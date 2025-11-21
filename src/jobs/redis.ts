import "dotenv/config";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

export const redisQueueConn = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const redisPubSubConn = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
