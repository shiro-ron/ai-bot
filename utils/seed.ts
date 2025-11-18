import crypto from "crypto";

/** 0..77 のタロットカードIndexを決める決定論的関数 */
export function pickTarotIndex(userId: string, ymd: string, topic: string): number {
  const hex = crypto.createHash("sha256").update(`${userId}|${ymd}|${topic}`).digest("hex").slice(0, 8);
  const n = parseInt(hex, 16);
  return n % 78;
}
