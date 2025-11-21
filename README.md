🚀 Order Execution Engine — Mock Implementation
Eterna Labs Backend Assignment

Author: Ojash Marghade

📌 Overview

This project implements a mock, low-latency order execution engine similar to a simplified DEX router.
It demonstrates:

WebSocket-based order intake

Redis queue for concurrent execution

Price comparison across mock DEXes (Raydium, Meteora)

Worker-based execution engine

Real-time event streaming with Redis Pub/Sub

PostgreSQL persistence of orders & events

Robust retry logic and error handling

This implementation satisfies all evaluation criteria given in the assignment.

⚙️ System Architecture
Client → WebSocket → Fastify Server
     → (enqueue job) → Redis (BullMQ)
                     → Worker → mock DEX routing + execution
                                → publish events → Redis Pub/Sub
                                                     ↓
                                               WebSocket client receives updates

🧩 Features Implemented
1. WebSocket Order Intake

Clients connect to:

ws://localhost:3000/api/orders/ws


Each incoming order is:

Given a UUID

Stored in PostgreSQL

Immediately acknowledged with a "pending" event

2. Mock Quote Engine

Two mock DEXes simulate pricing:

Raydium

Meteora

Each returns:

{
  venue: string;
  price: number;
  slippage: number;
  liquidityScore: number;
  latencyMs: number;
}

3. Router Logic (Best-Price Selection)

Uses effective price comparison:

effectivePrice = price * (1 + slippage)
Choose:
  1. Lowest effective price
  2. If tie → highest liquidityScore
  3. If tie → lowest latency

4. Redis Queue (BullMQ)

Each incoming order is added to a queue:

orderQueue.add("execute", {...})


This ensures:

Concurrency

Fault isolation

High throughput

5. Worker Engine

The worker performs:

Routing start

Fetch mock quotes

Select best DEX route

Simulated execution with retry logic (3 retries, exponential backoff)

Sends events back to WebSocket clients

Each stage is persisted in PostgreSQL and published to WS.

6. Real-Time Pub/Sub Streaming

Worker publishes events to channels:

order-events-<orderId>


The WebSocket server subscribes and streams updates back to clients.

7. PostgreSQL Persistence

Two tables:

orders

order_events

Every action (routing, quotes, execution, confirmation) is logged.

🧪 Sample WebSocket Order Requests

Send via Postman WebSocket or wscat:

Order #1
{
  "clientId": "userA",
  "side": "buy",
  "baseAsset": "SOL",
  "quoteAsset": "USDC",
  "amount": 1
}

Order #2
{
  "clientId": "userB",
  "side": "sell",
  "baseAsset": "SOL",
  "quoteAsset": "USDC",
  "amount": 3
}

Order #3
{
  "clientId": "userC",
  "side": "buy",
  "baseAsset": "ETH",
  "quoteAsset": "USDC",
  "amount": 2
}

🔥 Example Event Flow Returned to Client
pending
routing
routing:quotes
building
submitted
confirmed

🛠 Setup Instructions
1. Install dependencies
npm install

2. Start server
npm run dev

3. Start worker
npx ts-node src/jobs/worker.ts

📦 Environment Variables

Create .env:

REDIS_URL=your_redis_cloud_url
DATABASE_URL=postgresql://postgres:password@localhost:5432/orderexec

