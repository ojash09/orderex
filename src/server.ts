import Fastify from "fastify";
import websocket from "@fastify/websocket";
import ordersRoutes from "./routes/orders";

import { redisQueueConn } from "./jobs/redis";
import "./jobs/worker"; // start worker automatically

async function buildServer() {
  const server = Fastify({ logger: true });

  // Redis Connection Logs
  redisQueueConn.on("connect", () => {
    console.log("🔗 Redis Cloud Connected");
  });

  redisQueueConn.on("error", (err) => {
    console.error("❌ Redis Connection Error:", err);
  });

  // WebSocket plugin
  await server.register(websocket);

  // Test endpoint
  server.get("/test", async () => {
    return { ok: true };
  });

  // Main API routes
  server.register(ordersRoutes, { prefix: "/api" });

  return server;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({
      port: 3000,
      host: "0.0.0.0",
    });

    console.log("🚀 Server running on http://localhost:3000");
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

start();
