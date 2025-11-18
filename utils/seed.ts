import crypto from "crypto";
export function pickTarotIndex(userId: string, ymd: string, topic: string): number {
  const hex = crypto.createHash("sha256").update(`${userId}|${ymd}|${topic}`).digest("hex").slice(0,8);
  return parseInt(hex, 16) % 78;
}
