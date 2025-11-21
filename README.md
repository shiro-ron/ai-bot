# LINE Fortune Bot PRO + DB (patched2) — 2025-11-21

**401対策の検出強化版**：
- Vercel Cron 判定: `x-vercel-cron` **or** `User-Agent: Vercel-Cron` **or** `x-vercel-signature`
- `export const dynamic = 'force-dynamic'` を追加（キャッシュ抑止）
- ログに `detect` オブジェクトを出力して原因を可視化

## 手動確認
- `GET /api/cron/daily?key=CRON_SECRET` は引き続きOK
- ローカル再現: `curl -H 'x-vercel-cron: 1' https://.../api/cron/daily` で Cron 相当

他は従来通り（Supabase / Firestore 切替、Flex、相性導線）。
