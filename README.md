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

- ✅ Clean GitHub repo  
- ✅ Order execution API with routing  
- ✅ WebSocket status updates  
- 🔄 If real execution → transaction proof (mock used here)  
- ✅ README with design decisions + setup  
- 🔄 Deployed public URL (to be added)  
- 🔄 YouTube video link (to be added)  
- ✅ 3–5 simultaneous test orders  
- ✅ WebSocket lifecycle updates  
- ✅ Logging of routing decisions  
- ✅ Queue-based concurrency  
- ✅ Postman/Insomnia collection  
- ✅ ≥10 unit/integration tests  

---

## ⚙️ System Architecture

```
Client (WebSocket)
        │
        ▼
 Fastify Server ─────────────▶ Redis Queue (BullMQ)
        │                           │
        │                           ▼
        └───────── Redis Pub/Sub ◀── Worker
                                     │
                                     ├── Fetch mock Raydium/Meteora quotes
                                     ├── Choose best DEX
                                     ├── Simulate execution
                                     └── Publish events
```

---

## 🧩 Features

### 1. WebSocket Order Intake

WebSocket endpoint:  
```
ws://localhost:3000/api/orders/ws
```

Incoming order flow:
- Validate request  
- Assign UUID  
- Insert into PostgreSQL  
- Add job to queue  
- Push `pending` event to user  

---

### 2. Mock DEX Quote Engine

DEXs simulated:
- Raydium  
- Meteora  

Example quote:
```json
{
  "venue": "Raydium",
  "price": 14.2,
  "slippage": 0.02,
  "liquidityScore": 90,
  "latencyMs": 110
}
```

---

### 3. Routing Logic

Effective price formula:
```
effectivePrice = price * (1 + slippage)
```

Selection priority:
1. Lowest effective price  
2. Highest liquidity score  
3. Lowest latency  

---

### 4. Redis Queue (BullMQ)

Orders added using:
```ts
orderQueue.add("execute", orderPayload);
```

Benefits:
- High concurrency  
- Retry logic  
- Isolated failures  

---

### 5. Worker Engine

Worker tasks:
- Start routing  
- Fetch mock quotes  
- Select best route  
- Simulate transaction building  
- Retry up to 3 times  
- Push WebSocket events  
- Save events in DB  

---

### 6. Real-Time Streaming

Worker publishes to:
```
order-events-<orderId>
```

WebSocket server streams these to connected clients.

---

### 7. PostgreSQL Persistence

Tables:
- `orders`  
- `order_events`  

Every lifecycle phase is saved.

---

## 🧪 Sample WebSocket Orders

Example request:
```json
{
  "clientId": "userA",
  "side": "buy",
  "baseAsset": "SOL",
  "quoteAsset": "USDC",
  "amount": 1
}
```

---

## 🔥 Example WebSocket Event Flow

```
pending
routing
routing:quotes
building
submitted
confirmed
```

---

## 🛠 Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Start backend server
```bash
npm run dev
```

### 3. Start worker process
```bash
npx ts-node src/jobs/worker.ts
```

---

## 📦 Environment Variables

Create `.env`:

```
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:password@localhost:5432/orderexec
```

---

## 📚 Future Extensions

- Real Raydium/Meteora devnet execution  
- Slippage protection  
- Wrapped SOL (WSOL) handling  
- Distributed workers  
- Kafka-based queue  

---

## 📎 Deliverables Checklist

- [x] Clean repo  
- [x] Market order engine  
- [x] Routing logic  
- [x] WebSocket lifecycle  
- [x] Redis queue concurrency  
- [x] Retry strategy  
- [x] Logging  
- [x] Postman collection  
- [x] Tests  
- [ ] Deployment link  
- [ ] YouTube demo link  

---
