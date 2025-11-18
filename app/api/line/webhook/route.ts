import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pickTarotIndex } from "@/utils/seed";
import { simpleFortune } from "@/utils/fortune";

export const runtime = "nodejs"; // use Node.js runtime (crypto HMAC is needed)

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

function verifySignature(bodyText: string, signature: string | null): boolean {
  if (!signature || !CHANNEL_SECRET) return false;
  const hmac = crypto.createHmac("sha256", CHANNEL_SECRET);
  hmac.update(bodyText);
  const calc = hmac.digest("base64");
  // constant-time compare
  return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(signature));
}

async function replyMessage(replyToken: string, messages: any[]) {
  const r = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ replyToken, messages })
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("LINE reply error:", r.status, t);
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature");
  const bodyText = await req.text();
  const ok = verifySignature(bodyText, signature);
  if (!ok) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch (e) {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const events = payload.events ?? [];
  for (const ev of events) {
    try {
      if (ev.type === "message" && ev.message?.type === "text") {
        const userId = ev.source?.userId ?? "anonymous";
        const text = (ev.message.text as string).trim();

        if (text.includes("今日") && text.includes("運勢") or text === "今日の運勢") {
          const ymd = new Date().toISOString().slice(0, 10);
          const idx = pickTarotIndex(userId, ymd, "daily");
          const f = simpleFortune(idx);
          await replyMessage(ev.replyToken, [
            { type: "text", text: `${f.title}

${f.summary}

ラッキーカラー：${f.luckyColor}
今日の行動：
・${f.actions.join("\n・")}

${f.disclaimer}` }
          ]);
        } else {
          await replyMessage(ev.replyToken, [
            { type: "text", text: "「今日の運勢」と送ってみてください。例：今日の運勢" }
          ]);
        }
      } else if (ev.type === "follow") {
        await replyMessage(ev.replyToken, [
          { type: "text", text: "友だち追加ありがとうございます！「今日の運勢」と送ると占えます。" }
        ]);
      } else if (ev.type === "ping") {
        // for health checks (rare)
      }
    } catch (err) {
      console.error("event h&&ling error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
