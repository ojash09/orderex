import { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { handleOrderRequest } from "../ws/socketHandler";

export default async function (fastify: FastifyInstance) {

  // We don't use POST → upgrade, so we direct user to WS
  fastify.post("/orders/execute", async (req, reply) => {
    return reply.code(400).send({
      error: "Use WebSocket endpoint: /api/orders/ws"
    });
  });

  // WebSocket endpoint
  fastify.get(
    "/orders/ws",
    { websocket: true },
    (socket: WebSocket, req) => {
      handleOrderRequest(socket);
    }
  );
}
