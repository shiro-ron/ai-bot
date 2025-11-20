import crypto from "crypto";
export type Compat = { title: string; score: number; summary: string; tips: string[]; disclaimer: string; };
function seedToScore(seed: string): number {
  const hex = crypto.createHash("sha256").update(seed).digest("hex").slice(0,4);
  return parseInt(hex, 16) % 101;
}
export function makeCompatibility(lineUserId: string, dob1: string, dob2: string): Compat {
  const base = [dob1, dob2].sort().join("|");
  const score = seedToScore(`${lineUserId}|${base}|compat`);
  const band = Math.floor(score / 20);
  const msgs = [
    "価値観の確認をこまめに。小さなズレを放置しないのが鍵。",
    "相互理解が深まる週。相手の得意を頼ると前進。",
    "軽い冒険が相性を温めます。新しい体験をシェア。",
    "強力に噛み合う暗示。共通の目標へ一歩。",
    "最高の流れ。素直な感謝が未来の投資に。"
  ];
  const tipsList = [
    ["3つ質問して相手を知る","日程を先に決める","短いメッセージを増やす"],
    ["役割分担を言語化","小さなお願いをしてみる","“ありがとう”を増やす"],
    ["未知の体験を一緒に","写真を撮って共有","朝に計画すると吉"],
    ["共同タスクを設定","小さな成功を祝う","相手の強みを褒める"],
    ["次の予定をその場で","ギフトは小さく頻繁に","共通ルールを決める"]
  ][Math.min(4, band)];
  return { title: "相性診断の結果", score, summary: msgs[Math.min(4, band)], tips: tipsList, disclaimer: "※娯楽・自己内省のためのコンテンツです。医療・法律・投資等の助言ではありません。" };
}
export function compatToFlex(c: Compat) {
  return {
    type: "flex",
    altText: "相性診断の結果",
    contents: { type: "bubble", body: { type: "box", layout: "vertical", contents: [
      { type: "text", text: c.title, weight: "bold", size: "lg" },
      { type: "text", text: `相性スコア：${c.score}/100`, size: "md", margin: "sm" },
      { type: "text", text: c.summary, wrap: true, margin: "md" },
      { type: "text", text: "今日のヒント", weight: "bold", size: "sm", margin: "md" },
      ...c.tips.map(t => ({ type: "text", text: `・${t}`, size: "sm", wrap: true })),
      { type: "text", text: c.disclaimer, size: "xxs", color: "#999999", wrap: true, margin: "md" }
    ] } }
  };
}
