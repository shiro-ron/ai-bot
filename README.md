# LINE Fortune Bot PRO (Next.js 14 / TypeScript)

機能: ①毎朝自動配信（Vercel Cron） ②Flex Messageカード ③Stripe Payment Link。

## セットアップ
1) LINE Developers: Messaging API チャネル作成 → シークレット/アクセストークン取得  
2) Vercel: このプロジェクトをデプロイし、Envを設定  
   - LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN  
   - STRIPE_PAYMENT_LINK_URL（任意）  
   - CRON_SECRET（任意） / SUBSCRIBERS_CSV（テスト用）  
3) Webhook: https://YOUR_DOMAIN/api/line/webhook を設定

## 使い方
- 「今日の運勢」→ Flexカードで返信（クイックリプライ付き）  
- 「相性 1990-01-01 1993-05-05」→ Stripe Payment Link ボタン  
- 毎朝8:00（JST）→ `/api/cron/daily` が起動し SUBSCRIBERS_CSV のID宛に Push

## 開発
pnpm i && pnpm dev  # or npm/yarn

Happy shipping! (2025-11-18)
