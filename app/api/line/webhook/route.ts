import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Stripe from "stripe";
import { pickTarotIndex } from "@/utils/seed";
import { simpleFortune } from "@/utils/fortune";
import { fortuneToFlex, quickReplyBasics, paymentLinkFlex } from "@/utils/flex";
import { replyMessage } from "@/utils/line";
import { upsertSubscriber } from "@/utils/db";

export const runtime = "nodejs";
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" as any });

function verifySignature(bodyText: string, signature: string | null): boolean {
  if (!signature || !CHANNEL_SECRET) return false;
  const h = crypto.createHmac("sha256", CHANNEL_SECRET).update(bodyText).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature ?? ""));
}

function parseCompat(text: string): { dob1: string, dob2: string } | null {
  const m = text.match(/^相性\s+(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})$/);
  if (!m) return null;
  return { dob1: m[1], dob2: m[2] };
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

        const parsed = parseCompat(text);
        if (parsed) {
          if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
            await replyMessage(ev.replyToken, [{ type: "text", text: "決済設定が未完了です。管理者は STRIPE_SECRET_KEY と STRIPE_PRICE_ID を設定してください。" }]);
            continue;
          }
          const origin = process.env.PUBLIC_BASE_URL || `https://${req.nextUrl.host}`;
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
            success_url: `${origin}/?paid=1`,
            cancel_url: `${origin}/?cancel=1`,
            metadata: { line_user_id: userId, dob1: parsed.dob1, dob2: parsed.dob2 },
          });
          await replyMessage(ev.replyToken, [paymentLinkFlex(session.url!)]);
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

        await replyMessage(ev.replyToken, [{ type: "text", text: "「今日の運勢」と送ってみてください。相性鑑定は「相性 1990-01-01 1993-05-05」です。" }]);
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
