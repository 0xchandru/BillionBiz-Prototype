# BillionBiz — Production Cloud Migration Runbook

This document provides the complete roadmap and step-by-step procedures for transitioning the BillionBiz platform from a laptop-hosted backend development environment to a resilient, high-availability cloud infrastructure running under `chandraprakash.codes`.

---

## 1. Migration Overview & Target State

```text
                                  DNS & CDN (Vercel DNS)
                                    chandraprakash.codes
                                             |
             +-------------------------------+-------------------------------+
             |                                                               |
             v                                                               v
      [Vercel Edge]                                              [Cloud Backend Cluster]
   chandraprakash.codes                                         api.chandraprakash.codes
   admin.chandraprakash.codes                                     (Railway / Cloud Run)
   accounts.chandraprakash.codes                                             |
   staff.chandraprakash.codes                                                v
   pos.chandraprakash.codes                                      [Managed PostgreSQL 16+]
   ops.chandraprakash.codes                                      (Supabase / Cloud SQL / RDS)
   *.stores.chandraprakash.codes                                   57 Schema Tables + Backups
```

---

## 2. Cloud Backend Hosting Evaluation

| Provider | Pros | Cons | Ideal For |
| :--- | :--- | :--- | :--- |
| **Railway** | Native Docker support, integrated PostgreSQL, automatic custom domain TLS, zero devops | Usage-based pricing after trial | Fast, reliable production launch with minimal maintenance |
| **Render** | Simple setup, managed PostgreSQL, free SSL, zero-downtime deploys | Slower cold starts on starter tier | Simple full-stack deployments |
| **Google Cloud Run** | Serverless scale-to-zero, extreme performance, GCP VPC integration | Requires GCP IAM and artifact registry setup | High scale, enterprise multi-region |
| **AWS App Runner / ECS** | Enterprise SLA, full AWS ecosystem integration | Higher configuration complexity | Large-scale enterprise compliance |

**Recommendation**: Start with **Railway** or **Render** for rapid, painless deployment of both the Express Docker container and managed PostgreSQL.

---

## 3. Database Migration Runbook

### Step 1: Export Database from Windows Laptop
Ensure PostgreSQL client tools (`pg_dump`) are in your PATH. Run the following command from PowerShell:
```powershell
pg_dump -U postgres -h localhost -p 5432 -d billionbiz -F c -b -v -f billionbiz_laptop_backup.dump
```
*Note: This creates a compressed binary dump containing all 57 tables, sequences, indexes, and initial catalog seed data.*

### Step 2: Provision Managed PostgreSQL Instance
1. Create a PostgreSQL 16 or 17 database on your chosen provider (e.g., Supabase, Neon, Railway PostgreSQL, or AWS RDS).
2. Copy the external connection URI:
   `postgres://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>?sslmode=require`

### Step 3: Restore Schema & Data to Cloud Database
```powershell
pg_restore -U <db_user> -h <db_host> -p <db_port> -d <db_name> -v --no-owner --clean --if-exists billionbiz_laptop_backup.dump
```

### Step 4: Verify Restoration Integrity
Run backend migrations or test table count:
```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 57 tables
```

---

## 4. Backend Deployment via Dockerfile

The repository contains a production-ready `billionbiz-backend/Dockerfile`.

### Build & Deploy Steps:
1. **Push Backend Code**: Ensure `billionbiz-backend` is pushed to GitHub.
2. **Connect Repository to Cloud Host (e.g. Railway / Render)**:
   - Root Directory: `billionbiz-backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. **Configure Environment Variables in Cloud Host**:
   ```env
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=postgres://<user>:<password>@<cloud-db-host>:5432/<dbname>?sslmode=require
   JWT_SECRET=<new-high-entropy-64-character-secret>
   BCRYPT_ROUNDS=12
   CORS_ALLOWED_ORIGINS=https://chandraprakash.codes,https://admin.chandraprakash.codes,https://accounts.chandraprakash.codes,https://staff.chandraprakash.codes,https://pos.chandraprakash.codes,https://ops.chandraprakash.codes
   APP_URL=https://chandraprakash.codes
   API_BASE_URL=https://api.chandraprakash.codes
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=<mailgun-user>
   SMTP_PASS=<mailgun-pass>
   SMTP_FROM=BillionBiz <noreply@chandraprakash.codes>
   ```

---

## 5. Domain & DNS Configuration (`api.chandraprakash.codes`)

Since authoritative DNS for `chandraprakash.codes` is managed via Vercel DNS (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`):

1. **Log in to Vercel Dashboard** -> Go to **Domains** under Account/Team Settings.
2. Select `chandraprakash.codes` -> **DNS Records**.
3. **Add CNAME Record**:
   - **Type**: `CNAME`
   - **Name**: `api`
   - **Value**: Cloud host ingress domain (e.g., `<your-app>.up.railway.app` or `<your-app>.onrender.com`).
   - **TTL**: `60` seconds.
4. Verify propagation:
   ```powershell
   Resolve-DnsName -Name "api.chandraprakash.codes" -Type CNAME
   ```
5. In your cloud host dashboard, attach the custom domain `api.chandraprakash.codes`. SSL certificates will be generated and renewed automatically.

---

## 6. Frontend Vercel Final Cutover

Once `https://api.chandraprakash.codes/health` responds with `HTTP 200 OK`:

1. Open Vercel Project Settings for `billionbiz-frontend`.
2. Go to **Environment Variables**.
3. Update `VITE_API_BASE_URL` to:
   ```env
   VITE_API_BASE_URL=https://api.chandraprakash.codes/api/v1
   ```
4. Update `VITE_WS_BASE_URL` to:
   ```env
   VITE_WS_BASE_URL=wss://api.chandraprakash.codes/realtime
   ```
5. Click **Save** and trigger a new deployment.
6. The entire platform (all 4 portals + marketing landing) is now fully cloud-hosted with zero dependence on the local laptop!

---

## 7. Production Hardening Checklist

- [ ] **Database Connection Pooling**: Ensure `max: 20` or use Supabase/PgBouncer transaction pooler.
- [ ] **Automated Backups**: Enable daily automated database backups with 30-day retention.
- [ ] **CORS Lock-Down**: Remove all `localhost` and `ngrok` origins from production `CORS_ALLOWED_ORIGINS`.
- [ ] **Rate Limiting**: Enable Redis or memory rate-limiting on sensitive endpoints (`/identity/login`, `/identity/register`).
- [ ] **Health Monitoring**: Configure UptimeRobot, BetterUptime, or Datadog to ping `https://api.chandraprakash.codes/health` every 60 seconds with alerts configured.

