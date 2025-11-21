import { Worker } from "bullmq";
import { redisQueueConn, redisPubSubConn } from "./redis";
import { getQuotes } from "../dex/quotes";
import { pickBestQuote } from "../router/router";
import { executeOnVenue } from "../executor/executeOrder";
import { withRetries } from "../utils/retry";
import { saveEvent, saveOrder } from "../persistence/db";

// Simple function to publish events to WS channel
function publish(orderId: string, message: any) {
  redisPubSubConn.publish(`order-events-${orderId}`, JSON.stringify(message));
}

// --------------------------------------------
// WORKER SETUP
// --------------------------------------------

console.log("🔥 Worker is starting...");

export const orderWorker = new Worker(
  "order-queue",
  async (job) => {
    console.log("⚙️ Worker processing job:", job.id);

    const { orderId, order } = job.data;

    // 1️⃣ Routing
    publish(orderId, { event: "routing" });
    await saveEvent(orderId, "routing", {});

    // 2️⃣ Fetch quotes
    const quotes = await getQuotes(order);
    publish(orderId, { event: "routing:quotes", quotes });
    await saveEvent(orderId, "routing:quotes", {quotes});

    // 3️⃣ Pick best route
    const chosen = pickBestQuote(quotes);
    publish(orderId, { event: "building", chosen });
    await saveEvent(orderId, "building", {chosen});

    // 4️⃣ Execute with retries
    const execFn = async () => {
      const res = await executeOnVenue(order, chosen);
      if (!res.success) throw new Error(res.error ?? "execution failed");
      return res;
    };

    const result = await withRetries(execFn, 3, 500);

    // 5️⃣ Submitted
    publish(orderId, { event: "submitted", txId: result.txId });
    await saveEvent(orderId, "submitted", {result});

    // 6️⃣ Confirmed
    publish(orderId, { event: "confirmed", receipt: result });
    await saveOrder(orderId, order, "confirmed", result.txId);

    console.log("✔️ Worker job completed:", job.id);

    return result;
  },
  { connection: redisQueueConn }
);

// --------------------------------------------
// WORKER EVENT LOGS
// --------------------------------------------

// If the job fails
orderWorker.on("failed", (job, err) => {
  console.error("❌ Worker failed:", job?.id, err);
});

// When the worker is ready
orderWorker.on("ready", () => {
  console.log("🔥 Worker is ready and listening for jobs...");
});

// When the job is completed
orderWorker.on("completed", (job) => {
  console.log("✔️ Job completed:", job.id);
});
