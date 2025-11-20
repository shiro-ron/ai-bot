# LINE Fortune Bot PRO + DB (patched) — 2025-11-20

Patched so that **Vercel Cron** calls are accepted via `x-vercel-cron` header (no `?key` needed).
Manual calls still require `?key=CRON_SECRET` (if set).

- DB: `DB_BACKEND` = `SUPABASE` or `FIRESTORE` (fallback: `SUBSCRIBERS_CSV`)
- Cron: JST 08:00 (UTC 23:00) via `vercel.json`
- Endpoints: `/api/line/webhook`, `/api/cron/daily`
