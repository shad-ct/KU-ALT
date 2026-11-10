# KU-ALT — Kannur University R&D Cell Unified Portal

Full-stack application for managing research & development workflows at Kannur University.

- **Backend** (`server/`): Express + Sequelize + MySQL, port `5000`
- **Frontend** (`client/`): React + Vite + Tailwind CSS, port `5173`

---

## 1. Clone the repo

```bash
git clone https://github.com/shad-ct/KU-ALT.git
cd KU-ALT
```

---

## 2. Prerequisites

- **Node.js** 20+
- **npm** (comes with Node)
- **MySQL 8.0** (or use Docker Compose, see below)

---

## 3. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and set at least these:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3307` |
| `DB_NAME` | Database name | `kannur_rd_db` |
| `DB_USER` | MySQL username | `kannur_user` |
| `DB_PASSWORD` | MySQL password | `kannur_pass` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | random string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | random string |
| `JWT_ACCESS_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:5173` |
| `UPLOAD_DIR` | File upload directory | `./data/uploads` |
| `SMTP_HOST` | SMTP host (MailHog for dev) | `127.0.0.1` |
| `SMTP_PORT` | SMTP port | `1025` |

Generate strong secrets in production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Database setup

### Option A — Docker Compose (recommended)

Starts MySQL + MailHog + API + Web (Nginx):

```bash
docker-compose up -d
```

Services:
- MySQL: `localhost:3307`
- MailHog UI: `http://localhost:8025`
- API: `http://localhost:5000`
- Web: `http://localhost:3000`

Then run migrations & seeds (see sections 5 & 6).

### Option B — Manual MySQL

1. Install & start MySQL 8.0.
2. Create the database & user (adjust to match your `.env`):

```sql
CREATE DATABASE kannur_rd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kannur_user'@'127.0.0.1' IDENTIFIED BY 'kannur_pass';
GRANT ALL PRIVILEGES ON kannur_rd_db.* TO 'kannur_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

---

## 5. Install dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd ../client
npm install
```

---

## 6. Run migrations

From `server/`:

```bash
npm run migrate
```

Undo last migration:

```bash
npm run migrate:undo
```

---

## 7. Seed data

From `server/`:

```bash
npm run seed
```

Seeders run in order from `server/seeders/`:
- `20261108000000-seed-roles-and-demo-users.js`
- `20261108000001-seed-master-data.js`
- `20261108000002-seed-workflow-chains.js`
- `20261108000003-seed-certificates-and-equipment.js`

Undo all seeders:

```bash
npm run seed:undo
```

---

## 8. Run the app

### Backend (from `server/`)

Development (nodemon):

```bash
npm run dev
```

Production:

```bash
npm start
```

API available at `http://localhost:5000`.

### Frontend (from `client/`)

```bash
npm run dev
```

Vite dev server at `http://localhost:5173`. Requests to `/api` are proxied to `http://localhost:5000`.

Open `http://localhost:5173` in your browser.

---

## 9. Demo credentials

After seeding, you can log in with the demo users created by the seeders (check `server/seeders/20261108000000-seed-roles-and-demo-users.js` for exact emails/passwords).

---

## 10. Run tests

From `server/`:

```bash
npm test
```

---

## Project structure

```
KU-ALT/
├── server/              # Backend API (Express + Sequelize)
│   ├── src/
│   ├── migrations/
│   ├── seeders/
│   ├── data/uploads/
│   └── package.json
├── client/              # Frontend (React + Vite + Tailwind)
│   ├── src/
│   └── package.json
├── docs/                # Architecture, API spec, design docs
├── docker-compose.yml   # Full-stack local setup
└── .env.example         # Environment variable template
```
