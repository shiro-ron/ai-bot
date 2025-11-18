export async function replyMessage(replyToken: string, messages: any[]) {
  const r = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN!}`
    },
    body: JSON.stringify({ replyToken, messages })
  });
  if (!r.ok) console.error("LINE reply error:", r.status, await r.text());
}

export async function pushMessage(to: string, messages: any[]) {
  const r = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN!}`
    },
    body: JSON.stringify({ to, messages })
  });
  if (!r.ok) console.error("LINE push error:", r.status, await r.text());
}
