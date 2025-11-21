import type { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { saveOrder, saveEvent } from "../persistence/db";
import { redisPubSubConn } from "../jobs/redis";
import { orderQueue } from "../jobs/queue";
export async function handleOrderRequest(ws: WebSocket) {
  ws.on("message", async (raw) => {
    const data = JSON.parse(raw.toString());
    const orderId = uuidv4();

    await saveOrder(orderId, data, "pending");
    await saveEvent(orderId, "pending", {});
    ws.send(JSON.stringify({ event: "pending", orderId }));

    // 1️⃣ Create subscriber first
    const sub = redisPubSubConn.duplicate();
    await sub.subscribe(`order-events-${orderId}`);

    sub.on("message", (_channel, msg) => {
      ws.send(msg);
    });

    // 2️⃣ THEN add to queue
    await orderQueue.add("execute", { orderId, order: data });

    // Cleanup on close
    ws.on("close", async () => {
      await sub.unsubscribe(`order-events-${orderId}`);
      await sub.quit();
    });
  });
}
