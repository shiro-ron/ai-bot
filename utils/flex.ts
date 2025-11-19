export function fortuneToFlex(f: any) {
  return { type: "flex", altText: "今日の運勢", contents: { type: "bubble", body: { type: "box", layout: "vertical", contents: [
    { type: "text", text: f.title, weight: "bold", size: "lg" },
    { type: "text", text: f.summary, wrap: true, margin: "md" },
    { type: "box", layout: "vertical", margin: "md", spacing: "xs", contents: [
      { type: "text", text: `ラッキーカラー：${f.luckyColor}`, size: "sm" },
      { type: "text", text: "今日の行動", weight: "bold", size: "sm", margin: "sm" },
      ...f.actions.map((a: string) => ({ type: "text", text: `・${a}`, size: "sm", wrap: true }))
    ]},
    { type: "text", text: f.disclaimer, size: "xxs", color: "#999999", wrap: true, margin: "md" }
  ] } } };
}
export function quickReplyBasics() {
  return { items: [
    { type: "action", action: { type: "message", label: "恋愛", text: "恋愛" } },
    { type: "action", action: { type: "message", label: "仕事", text: "仕事" } },
    { type: "action", action: { type: "message", label: "金運", text: "金運" } },
    { type: "action", action: { type: "message", label: "健康", text: "健康" } }
  ]};
}
export function paymentLinkFlex(url: string) {
  return { type: "flex", altText: "相性鑑定の購入", contents: { type: "bubble",
    body: { type: "box", layout: "vertical", contents: [
      { type: "text", text: "相性鑑定", weight: "bold", size: "lg" },
      { type: "text", text: "まずはご購入をお願いします。", wrap: true, margin: "md" }
    ]},
    footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
      { type: "button", style: "primary", action: { type: "uri", label: "購入する（¥300）", uri: url } }
    ]}
  }};
}
