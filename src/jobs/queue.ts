import { Queue } from "bullmq";
import { redisQueueConn } from "./redis";

export const orderQueue = new Queue("order-queue", {
  connection: redisQueueConn,
});
