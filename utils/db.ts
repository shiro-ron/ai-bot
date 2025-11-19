type Backend = "SUPABASE" | "FIRESTORE" | "FALLBACK";
function backend(): Backend {
  const b = (process.env.DB_BACKEND ?? "").toUpperCase();
  if (b === "SUPABASE") return "SUPABASE";
  if (b === "FIRESTORE") return "FIRESTORE";
  return "FALLBACK";
}

async function supabaseClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY!;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key);
}

let firestoreInited = false;
async function initFirestore() {
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
  firestoreInited = true;
}
async function firestoreDb() {
  if (!firestoreInited) await initFirestore();
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore();
}

function getSubscribersFromEnv(): string[] {
  const csv = process.env.SUBSCRIBERS_CSV ?? "";
  return csv.split(",").map(s => s.trim()).filter(Boolean);
}

export async function upsertSubscriber(userId: string, active = true): Promise<void> {
  const b = backend();
  if (b === "SUPABASE") {
    const supa = await supabaseClient();
    const { error } = await supa.from("subscribers").upsert({ user_id: userId, active, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) console.error("supabase upsert error:", error);
    return;
  }
  if (b === "FIRESTORE") {
    const db = await firestoreDb();
    await db.collection("subscribers").doc(userId).set({ active, updated_at: new Date().toISOString() }, { merge: true });
    return;
  }
}

export async function listSubscribers(): Promise<string[]> {
  const b = backend();
  if (b === "SUPABASE") {
    const supa = await supabaseClient();
    const { data, error } = await supa.from("subscribers").select("user_id").eq("active", true).limit(10000);
    if (error) { console.error("supabase list error:", error); return []; }
    return (data ?? []).map((r: any) => r.user_id as string);
  }
  if (b === "FIRESTORE") {
    const db = await firestoreDb();
    const snap = await db.collection("subscribers").where("active", "==", true).get();
    return snap.docs.map((d: any) => d.id);
  }
  return getSubscribersFromEnv();
}
