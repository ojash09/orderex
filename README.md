# 🚀 Order Execution Engine — Mock Implementation  
### Eterna Labs Backend Assignment

**Author:** Ojash Marghade  

---

## 📌 Overview

This project implements a **mock low-latency order execution engine**, designed to simulate how a DEX router chooses the best venue and executes an order.  
It includes:

- WebSocket-based real-time order status updates  
- Redis Queue (BullMQ) for concurrent job processing  
- Mock pricing from Raydium & Meteora  
- Routing logic based on effective price  
- Worker engine with retries  
- PostgreSQL persistence for orders & events  
- Redis Pub/Sub for live streaming  

This project fulfills all required criteria of the assignment.

---

## 🎯 Why Market Orders?

I chose **Market Orders** because they best demonstrate real-time routing, pricing comparison, and execution flow.  
The same design can extend to:

- **Limit orders** via price triggers  
- **Sniper orders** via pool/launch listeners  

---

## ✔️ Mandatory Deliverables (as required by Eterna Labs)

- ✅ GitHub repo with clean commits  
- ✅ Order execution API with routing  
- ✅ WebSocket status updates  
- 🔄 If real execution → transaction proof (not applicable: mock implementation)  
- ✅ README with design decisions + setup  
- 🔄 Public deployment URL (will be added)  
- 🔄 YouTube video link (will be added)  
- ✅ Demonstrates submitting 3–5 simultaneous orders  
- ✅ WebSocket lifecycle: pending → routing → confirmed  
- ✅ Console logs show routing decisions  
- ✅ Queue processes multiple orders concurrently  
- ✅ Postman/Insomnia collection included  
- ✅ ≥10 unit & integration tests (routing, queue, WebSocket lifecycle)

---

## ⚙️ System Architecture

Client (WebSocket)
│
▼
Fastify Server ─────────────▶ Redis Queue (BullMQ)
│ │
│ ▼
└───────── Redis Pub/Sub ◀── Worker
│
├── Fetch mock Raydium/Meteora quotes
├── Choose best DEX
├── Simulate execution
└── Publish events

yaml
Copy code

---

## 🧩 Features

### 1. WebSocket Order Intake
Endpoint:  
ws://localhost:3000/api/orders/ws

yaml
Copy code

Steps:
- Validate order  
- Assign UUID  
- Store in PostgreSQL  
- Push job to queue  
- Send **pending** event instantly  

---

### 2. Mock DEX Quote Engine
Two simulated DEXs: **Raydium** and **Meteora**

Example quote:
```json
{
  "venue": "Raydium",
  "price": 14.2,
  "slippage": 0.02,
  "liquidityScore": 90,
  "latencyMs": 110
}
3. Routing Logic
ini
Copy code
effectivePrice = price * (1 + slippage)
Selection priority:

Lowest effective price

Highest liquidity score

Lowest latency

4. Redis Queue (BullMQ)
Orders added as:

ts
Copy code
orderQueue.add("execute", orderPayload);
Provides:

High concurrency

Retry logic

Parallel order handling

5. Worker Engine
Worker performs:

routing

fetching quotes

selecting best venue

simulated execution

retry (max 3, exponential backoff)

publishing progress events

saving events to DB

6. Real-Time Streaming (Pub/Sub)
Events published to:

css
Copy code
order-events-<orderId>
WebSocket server pushes these events to the client.

7. PostgreSQL Persistence
Tables:

orders

order_events

Every lifecycle step stored with timestamps.

🧪 Sample WebSocket Orders
Example Order
json
Copy code
{
  "clientId": "userA",
  "side": "buy",
  "baseAsset": "SOL",
  "quoteAsset": "USDC",
  "amount": 1
}
Example Event Flow
makefile
Copy code
pending
routing
routing:quotes
building
submitted
confirmed
🛠 Setup Instructions
1. Install dependencies
bash
Copy code
npm install
2. Start server
bash
Copy code
npm run dev
3. Start worker
bash
Copy code
npx ts-node src/jobs/worker.ts
📦 Environment Variables
Create .env:

ini
Copy code
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:password@localhost:5432/orderexec