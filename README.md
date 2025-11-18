# LINE Fortune Bot (Next.js 14 App Router, TypeScript)

最小構成のLINEボット雛形です。**署名検証**・**返信API**・**決定論的な“今日の運勢”**を実装済み。
Vercelにそのままデプロイできます。

## セットアップ

1. リポジトリ作成 → このプロジェクトをpush（またはVercelのImportでzipをアップロード）
2. LINE Developersで **Messaging API** チャネルを作成
   - Channel secret / Channel access token を発行
3. Vercelの **Project → Settings → Environment Variables** に以下を追加
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
4. デプロイ後、`https://YOUR_DOMAIN/api/line/webhook` を **Webhook URL** に設定し「Verify」
5. 友だち追加して、**「今日の運勢」** と送ると返事が来ます。

### ローカル開発
```bash
pnpm i   # もしくは npm i / yarn
pnpm dev
```
- 外部から受けるには ngrok 等でトンネルを張って、LINEのWebhook URLに指定

## 仕組み
- **署名検証**：`X-Line-Signature` と `LINE_CHANNEL_SECRET` のHMAC-SHA256を照合
- **メッセージ処理**：テキスト `"今日の運勢"` で、決定論的に1枚のタロットを選び簡易運勢を返答
- **ユーティリティ**：`utils/seed.ts` で日付とユーザーIDから78枚のカードIndexを決定

## 拡張のヒント
- DB（Supabase/Firestore）を繋ぎ「followイベント」で userId を保存すればプッシュ配信も可能
- `utils/fortune.ts` は雛形。OpenAI等で自然文を整形する場合は `OPENAI_API_KEY` を使った関数を追加

## セキュリティ
- 署名検証を必ず通過させています
- 医療・法律・投資の断定表現は禁止。返答末尾に簡易ディスクレーマーを付与

---

Happy shipping!
