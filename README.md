# SMB Copilot 
**Your Smart AI Copilot for Small Business Operations**

A cloud-native, multi-tenant AI operations platform supporting 6 SMB verticals — deployed on Microsoft Azure for under $15/month.

---

## Quick Links
- [Design Rationale](#design-rationale)
- [Scalability Considerations](#scalability-considerations)
- [System Limitations](#system-limitations)
- [Azure Deployment Guide](#azure-deployment-guide)
- [API Reference](#api-reference)

---

## Business Types Supported

| Business | AI-Powered Modules |
|---|---|
|  Hair Salon / Spa | Appointments, Staff, Inventory, Suppliers, Analytics |
|  Convenience Store | Inventory, Suppliers, Staff, Analytics |
|  Clothing Boutique | Stock & Trends, Suppliers, Staff, Analytics |
|  Laundromat | Supplies, Staff, Suppliers, Analytics |
|  Café / Food Truck | Ingredients, Suppliers, Staff, Analytics |
|  Local Service Shop | Parts & Tools, Staff, Suppliers, Analytics |

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 (CRA) | Component model fits dynamic per-business module rendering |
| Backend | Node.js 18 + Express 4 | Non-blocking I/O suits concurrent chat + DB workloads |
| Database | MongoDB Atlas M0 | Document model fits variable SMB schemas; free tier viable at MVP scale |
| AI Layer | OpenAI GPT-3.5-turbo | Cheapest capable model; temp=0 gives deterministic JSON output |
| Hosting | Azure App Service B1 | $13/month, persistent process, no cold starts vs. Azure Functions |

---

## Design Rationale

### Why a Monolith, Not Microservices?

This system deliberately uses a **single-service monolithic architecture** rather than microservices. The reasoning:

1. **Cold start elimination** — Azure Functions introduce 200–800ms cold starts per invocation. App Service runs a persistent Node.js process, giving sub-200ms API responses.
2. **Cost** — App Service B1 at $13/month vs. AKS (Kubernetes) at $70–150/month for equivalent capacity.
3. **Development velocity** — A single deployable unit with shared in-process state is faster to develop, debug, and deploy for a 1–2 person team.
4. **Scale threshold** — Microservices become beneficial at >10,000 DAU. This MVP targets <100 concurrent users.

The architecture is designed as a **strangler fig** — individual services (inventory, AI, staff) are already separated into controllers/services layers, making future extraction to microservices straightforward without rewriting business logic.

### Why MongoDB Atlas over Azure CosmosDB?

| Factor | MongoDB Atlas M0 | Azure CosmosDB |
|---|---|---|
| Cost (MVP) | $0/month | ~$24/month |
| Cost (production) | $9/month (M2) | $50–500/month |
| Query latency | 5–15ms | 10–25ms |
| Flexibility | Native JSON, no partition key required | Requires partition key design upfront |
| Global replication | Paid tiers only | Built-in (at cost) |

CosmosDB's global distribution is unnecessary at MVP scale and costs 10x more. MongoDB Atlas provides the same developer experience with a genuinely free tier.

### Why GPT-3.5-turbo with JSON Constraints?

- **Structured output:** LLM constrained to return only JSON prevents parsing errors in downstream business logic
- **Temperature=0:** Ensures deterministic, reproducible intent classification — critical for operations software
- **Mock fallback:** 11-pattern regex parser handles ~95% of standard commands at zero API cost, enabling free demos
- **Context injection:** Business type injected per-request adapts AI behavior without fine-tuning (e.g., "reorder supplies" triggers shampoo for Salon, milk for Store, coffee beans for Café)

### Why Serve Frontend from App Service?

Azure Static Web Apps was blocked by a university subscription policy. Co-locating static file serving with the API on App Service produced these benefits:
- Eliminates CORS configuration entirely
- Same-origin requests reduce latency by ~20ms
- Single deployment artifact simplifies CI/CD
- One fewer Azure service to manage and monitor

---

## Scalability Considerations

### Current Architecture Limits

| Component | Capacity at B1 | Upgrade Path |
|---|---|---|
| App Service B1 | ~100 concurrent requests | Scale up to P1v3 (2 cores, 3.5GB) |
| MongoDB M0 | 100 connections, 512MB | Upgrade to M10 ($57/month, 2GB) |
| Single region | ~100ms latency for non-US | Add West US 2 + Traffic Manager |
| No caching | Every request hits DB | Add Azure Cache for Redis |

### Horizontal Scaling Strategy

```
Current (MVP):          Scale-Out Path:
App Service B1          App Service P2v3 (autoscale 2–5 instances)
     │                           │
MongoDB M0              MongoDB M10 (dedicated, 10GB)
     │                           │
No cache               Azure Cache for Redis (hot inventory reads)
```

**Autoscaling trigger config (for production):**
- Scale out when CPU > 70% for 5 minutes
- Scale in when CPU < 30% for 10 minutes
- Minimum 1 instance, maximum 5 instances

### Database Indexing Strategy

Current indexes:
```javascript
// Applied automatically by Mongoose
businessId        // All collections — filters tenant data
businessId + date // Shifts — week range queries
businessId + name // Inventory — name search queries
```

For production at >10,000 inventory items per tenant, compound indexes on `{businessId, category, quantity}` would reduce low-stock query time from O(n) to O(log n).

### AI Layer Scaling

- Cache intent results for identical messages (Redis TTL: 5 min) → reduces OpenAI calls by ~40%
- Batch non-urgent AI requests (reorder analysis, trend detection) as background jobs
- Switch to GPT-4o-mini for 60% cost reduction with minimal quality loss at this use case complexity

---

## System Limitations

### Security Limitations
1. **No authentication** — API endpoints are publicly accessible. Production requires JWT middleware with per-tenant scope enforcement.
2. **No input validation** — Request bodies are not validated against schemas before DB writes. A malformed `quantity` field could corrupt inventory records.
3. **Shared logical isolation** — All tenants share one MongoDB cluster. A query missing `businessId` filter would expose cross-tenant data.
4. **`.env` credentials** — MongoDB URI and OpenAI key are stored in `.env`. Production requires Azure Key Vault integration.

### Functional Limitations
1. **Simulated analytics** — Weekly sales charts use randomly generated data. Real data requires POS integration (Square, Stripe).
2. **No real-time updates** — Dashboard requires page refresh to reflect chat-triggered changes. Production requires WebSockets or Server-Sent Events.
3. **No notifications** — Reorder alerts exist only in-app. Production needs email/SMS via Azure Communication Services.
4. **Static business types** — 6 business types are hardcoded in config. True multi-tenant SaaS would support dynamic business type creation.

### Infrastructure Limitations
1. **Single region** — Deployed only in East US. Adds 80–150ms latency for users in Europe or Asia.
2. **No CDN** — Static assets served from App Service. Azure CDN would reduce page load by 40–60% for non-US users.
3. **No backup policy** — MongoDB M0 free tier does not include automated backups. Data loss risk exists.
4. **99.9% SLA** — App Service B1 SLA. Insufficient for healthcare, financial, or regulated industry verticals.

---

## Quick Start (Local Development)

```bash
# 1. Configure environment
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI and optionally OPENAI_API_KEY

# 2. Install and seed
npm install
npm run seed

# 3. Start backend (port 5000)
npm run dev

# 4. Start frontend (port 3000)
cd ../client
npm install
npm start
```

---

## AI Chat Commands Reference

### Works for all business types (adapts context):
```
"Check low stock"                         → Lists items below reorder point
"Reorder supplies"                        → Creates reorder requests for low items
"Show my staff"                           → Lists active employees
"View analytics"                          → Returns live stats summary
"Show suppliers"                          → Lists all vendors
```

### Inventory management:
```
"Add 20kg coffee beans to inventory"      → Adds/updates stock item
"Add 5 gallons of milk"                   → Adds to existing item quantity
"Set milk quantity to 25"                 → Updates specific item stock
"Restock engine oil to 30"               → Updates to specific quantity
```

### Staff management:
```
"Add Sarah as Cashier"                    → Creates new employee
"Remove John Doe"                         → Deactivates employee
"Add John on Monday shift from 9am to 5pm" → Creates shift on calendar
```

---

## Azure Deployment Guide

### Architecture
```
[Azure App Service B1 — $13/month]
   ├── Node.js/Express API (/api/*)
   └── React Static Files (/* → index.html)
         │
   [MongoDB Atlas M0 — FREE]
         │
   [OpenAI API — ~$0.90/month]
```

### Step 1: MongoDB Atlas Setup
```
1. cloud.mongodb.com → Create FREE cluster (M0)
2. Database Access → Add user (username + password)
3. Network Access → Add 0.0.0.0/0 (allow all IPs)
4. Connect → Drivers → Copy connection string
   Format: mongodb+srv://user:pass@cluster.mongodb.net/smbcopilot
```

### Step 2: Deploy Backend to Azure App Service
```bash
# Via Azure Portal:
# App Services → Create → Node 18 LTS → Linux → B1 Basic

# Environment Variables (App Service → Environment Variables):
MONGODB_URI      = mongodb+srv://...
OPENAI_API_KEY   = sk-...
NODE_ENV         = production
PORT             = 8080

# Deploy: Advanced Tools (Kudu) → Zip Push Deploy
# Startup Command: node server.js
```

### Step 3: Seed Production Database
```bash
cd server
MONGODB_URI="your_atlas_uri" npm run seed
```

### Step 4: Verify Deployment
```
https://your-app.azurewebsites.net/health
→ {"status":"ok","timestamp":"..."}

https://your-app.azurewebsites.net
→ SMB Copilot landing page
```

### Cost Management
```bash
# Stop when not in use (saves ~$0.43/hr)
Azure Portal → App Service → Stop

# Start before demo
Azure Portal → App Service → Start
```

---

## Monthly Cost Breakdown

| Service | Tier | Cost |
|---|---|---|
| Azure App Service | B1 Basic | $13.14 |
| MongoDB Atlas | M0 Free | $0.00 |
| OpenAI API | GPT-3.5-turbo (~3K calls) | ~$0.90 |
| **Total** | | **~$14.04/month** |

---

## Project Structure

```
smb-copilot/
├── client/                        # React 18 Frontend
│   ├── src/
│   │   ├── App.jsx                # Root + business type state
│   │   ├── App.css                # Complete design system
│   │   ├── config/
│   │   │   └── businessConfig.js  # 6 business type definitions
│   │   ├── services/
│   │   │   └── api.js             # All fetch() wrappers
│   │   └── components/
│   │       ├── BusinessSelector.jsx  # Landing page
│   │       ├── Dashboard.jsx         # Stats + overview
│   │       ├── ChatPanel.jsx         # AI chat interface
│   │       ├── Sidebar.jsx           # Dynamic navigation
│   │       ├── Header.jsx
│   │       └── modules/
│   │           ├── InventoryModule.jsx    # Stock management
│   │           ├── StaffModule.jsx        # Calendar + team
│   │           ├── AppointmentsModule.jsx # Bookings (Salon)
│   │           ├── SuppliersModule.jsx    # Vendors + orders
│   │           └── AnalyticsModule.jsx    # Charts + KPIs
│   └── package.json
│
└── server/                        # Node.js + Express Backend
    ├── models/                    # 7 Mongoose schemas
    ├── controllers/               # Business logic (5 files)
    ├── routes/                    # Express routes (5 files)
    ├── services/
    │   ├── aiService.js           # OpenAI + regex fallback
    │   └── businessConfigService.js
    ├── seed/seed.js               # Demo data for all 6 businesses
    ├── server.js                  # App entry point
    └── package.json
```

---

## Academic References
See [PROJECT_REPORT.md](PROJECT_REPORT.md) for full research-style analysis including:
- System design trade-offs
- Quantitative latency and cost evaluation
- Scalability analysis
- Limitations and future work
