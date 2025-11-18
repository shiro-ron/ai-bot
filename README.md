# LINE Fortune Bot (Next.js 14 App Router, TypeScript)

最小構成のLINEボット雛形です。**署名検証**・**返信API**・**決定論タロットの「今日の運勢」**を実装。
Vercelにそのままデプロイできます。

## デプロイ
1. LINE Developersで Messaging API チャネル作成（Secret/Access Token発行）
2. Vercelの環境変数に `LINE_CHANNEL_SECRET` と `LINE_CHANNEL_ACCESS_TOKEN` を登録
3. Webhook URL: `https://YOUR_DOMAIN/api/line/webhook` をVerify
4. 友だち追加 → 「今日の運勢」と送る

## 重要: App Routerは**root layout**が必須
このプロジェクトは `app/layout.tsx` を含みます。これが無いと Next.js がビルドエラーになります。

## ローカル開発
```bash
npm i    # or pnpm i / yarn
npm run dev
```
