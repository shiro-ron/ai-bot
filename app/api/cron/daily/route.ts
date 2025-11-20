import { NextRequest, NextResponse } from "next/server";
import { pickTarotIndex } from "@/utils/seed";
import { simpleFortune } from "@/utils/fortune";
import { fortuneToFlex } from "@/utils/flex";
import { pushMessage } from "@/utils/line";
import { listSubscribers } from "@/utils/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const key = req.nextUrl.searchParams.get("key");
  const fromVercelCron = req.headers.get("x-vercel-cron") !== null;

  if (secret && !fromVercelCron && key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const subs = await listSubscribers();
  if (subs.length === 0) {
    console.warn("[cron] no subscribers");
    return NextResponse.json({ ok: true, sent: 0, fromVercelCron });
  }

  const ymd = new Date().toISOString().slice(0,10);
  let sent = 0;
  for (const uid of subs) {
    try {
      const idx = pickTarotIndex(uid, ymd, "daily");
      const f = simpleFortune(idx);
      await pushMessage(uid, [fortuneToFlex(f)]);
      sent++;
    } catch (e) { console.error("[cron] push failed", uid, e); }
  }
  return NextResponse.json({ ok: true, sent, fromVercelCron });
}
