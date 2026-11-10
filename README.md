# Kannur University — Research & Development Cell Unified Portal

Institutional portal for research scholar registration, guide recognition, statutory scholar service applications (RAC, title changes, extensions), certificate issuance, and departmental equipment management.

---

## Architecture & Tech Stack

- **Backend:** Node.js 20 + Express, Sequelize v6 + `mysql2`, Umzug migrations, Zod environment validation, Pino logging, JWT authentication.
- **Database:** MySQL 8.0, InnoDB, `utf8mb4_unicode_ci`, strict SQL mode, UTC timezone.
- **Frontend:** React 18 + Vite, Tailwind CSS using custom design tokens (`tokens.css`), Radix UI primitives, Lucide icons.
- **Design System:** Strictly minimal, flat institutional aesthetic (no gradients, shadows, emoji, or multi-colored cards).
- **Infrastructure:** Docker Compose (`mysql`, `api`, `web`, `mailhog`).

---

## Directory Structure

```
kannur-rd-portal/
├── docker-compose.yml          # MySQL 8, API (Express), Web (Nginx), MailHog
├── .env.example                # Sample environment configuration
├── docs/                       # Specifications and Design System outputs
│   ├── 00-master-prompt.md
│   ├── 01-product-requirements.md
│   ├── 02-architecture.md
│   ├── 03-database-schema.md
│   ├── 04-api-spec.md
│   ├── 05-workflow-engine.md
│   ├── 06-equipment-module.md
│   ├── 07-rbac-security.md
│   ├── 08-frontend-ui-design.md
│   ├── 09-build-plan-and-agent-prompts.md
│   └── design/                 # Phase D design tokens, component & screen specs
├── server/                     # Backend API
│   ├── migrations/             # Umzug migration files
│   ├── src/
│   │   ├── config/             # Zod-validated environment, constants
│   │   ├── db/                 # Sequelize instance, transaction helper with deadlock retry
│   │   ├── middleware/         # Error mapping, Pino logger
│   │   ├── modules/health/     # /api/v1/health, /api/v1/health/db
│   │   └── utils/              # ApiError, response envelope, pagination, sortWhitelist
├── client/                     # Frontend SPA
│   ├── src/
│   │   ├── components/layout/  # AppShell (232px sidebar + 52px top bar)
│   │   ├── components/ui/      # PageHeader, StatusChip
│   │   ├── pages/              # Role-specific placeholders
│   │   └── styles/             # tokens.css & base.css
```

---

## Quickstart

### Option 1: Running with Docker Compose (Recommended)

1. **Clone & Configure:**
   ```bash
   cp .env.example .env
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```

3. **Verify running containers:**
   - Web Application: [http://localhost:3000](http://localhost:3000)
   - API Service: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
   - Database Health Check: [http://localhost:5000/api/v1/health/db](http://localhost:5000/api/v1/health/db)
   - MailHog (Email Inbox): [http://localhost:8025](http://localhost:8025)

---

### Option 2: Running Locally for Development

#### 1. Backend Server
```bash
cd server
npm install
npm run dev
```

#### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
Client runs at [http://localhost:5173](http://localhost:5173).

---

## Health Check Verification Endpoints

- `GET /api/v1/health`
  Returns service operational state, runtime environment, and uptime:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "service": "Kannur University R&D Cell Unified Portal API",
      "timestamp": "2026-11-08T10:45:00.000Z",
      "uptimeSeconds": 12,
      "environment": "development"
    },
    "message": "Service is operational"
  }
  ```

- `GET /api/v1/health/db`
  Pings the active MySQL connection pool:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "database": "MySQL 8.0",
      "connected": true,
      "latencyMs": 4,
      "timestamp": "2026-11-08T10:45:00.000Z"
    },
    "message": "Database connection is healthy and responsive"
  }
  ```

