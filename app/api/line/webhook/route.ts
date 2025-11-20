import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pickTarotIndex } from "@/utils/seed";
import { simpleFortune } from "@/utils/fortune";
import { fortuneToFlex, quickReplyBasics, paymentLinkFlex } from "@/utils/flex";
import { replyMessage } from "@/utils/line";
import { upsertSubscriber } from "@/utils/db";

export const runtime = "nodejs";
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";

function verifySignature(bodyText: string, signature: string | null): boolean {
  if (!signature || !CHANNEL_SECRET) return false;
  const h = crypto.createHmac("sha256", CHANNEL_SECRET).update(bodyText).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature ?? ""));
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-line-signature");
  const bodyText = await req.text();
  if (!verifySignature(bodyText, sig)) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  let payload: any;
  try { payload = JSON.parse(bodyText); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  for (const ev of (payload.events ?? [])) {
    try {
      if (ev.type === "message" && ev.message?.type === "text") {
        const text: string = (ev.message.text as string).trim();
        const userId: string = ev.source?.userId ?? "anonymous";

        if (text.includes("今日") && text.includes("運勢")) {
          const ymd = new Date().toISOString().slice(0,10);
          const idx = pickTarotIndex(userId, ymd, "daily");
          const f = simpleFortune(idx);
          await replyMessage(ev.replyToken, [{ ...fortuneToFlex(f), quickReply: quickReplyBasics() }]);
          continue;
        }

        if (text.startsWith("相性")) {
          const url = process.env.STRIPE_PAYMENT_LINK_URL;
          if (url) await replyMessage(ev.replyToken, [paymentLinkFlex(url)]);
          else await replyMessage(ev.replyToken, [{ type: "text", text: "相性鑑定の購入リンクが未設定です。管理者は STRIPE_PAYMENT_LINK_URL を設定してください。" }]);
          continue;
        }

        if (text === "購読ON") {
          const uid = ev.source?.userId;
          if (uid) await upsertSubscriber(uid, true);
          await replyMessage(ev.replyToken, [{ type: "text", text: "毎朝の配信をオンにしました。" }]);
          continue;
        }
        if (text === "購読OFF") {
          const uid = ev.source?.userId;
          if (uid) await upsertSubscriber(uid, false);
          await replyMessage(ev.replyToken, [{ type: "text", text: "毎朝の配信をオフにしました。" }]);
          continue;
        }

        if (text === "ユーザーID") {
          await replyMessage(ev.replyToken, [{ type: "text", text: `あなたのユーザーID: ${userId}` }]);
          continue;
        }

        await replyMessage(ev.replyToken, [{ type: "text", text: "「今日の運勢」と送ってみてください。購読は「購読ON/購読OFF」です。相性鑑定は「相性 1990-01-01 1993-05-05」です。" }]);
      } else if (ev.type === "follow") {
        const uid = ev.source?.userId;
        if (uid) await upsertSubscriber(uid, true);
        await replyMessage(ev.replyToken, [{ type: "text", text: "友だち追加ありがとうございます！毎朝配信を開始しました（停止は「購読OFF」）。" }]);
      } else if (ev.type === "unfollow") {
        const uid = ev.source?.userId;
        if (uid) await upsertSubscriber(uid, false);
      }
    } catch (e) { console.error("event handling error:", e); }
  }
  return NextResponse.json({ ok: true });
}
