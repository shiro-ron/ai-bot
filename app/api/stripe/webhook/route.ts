import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { pushMessage } from "@/utils/line";
import { makeCompatibility, compatToFlex } from "@/utils/compat";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" as any });

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "no signature or secret" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    console.error("stripe webhook signature error:", err.message);
    return NextResponse.json({ error: "signature error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = (session.metadata?.line_user_id as string) || "";
    const dob1 = (session.metadata?.dob1 as string) || "";
    const dob2 = (session.metadata?.dob2 as string) || "";
    if (uid) {
      const compat = makeCompatibility(uid, dob1, dob2);
      await pushMessage(uid, [compatToFlex(compat)]);
    } else {
      console.warn("No line_user_id in metadata");
    }
  }

  return NextResponse.json({ received: true });
}
