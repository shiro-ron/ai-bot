export function simpleFortune(cardIndex: number) {
  const names = ["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"];
  const name = names[cardIndex % names.length];
  const base = cardIndex % 5;
  const actions = [
    ["5分の散歩","机の整理","深呼吸3回"],
    ["午前に重要連絡","温かい飲み物","TODOを3つに"],
    ["相談する","お礼を送る","軽く運動"],
    ["不要タスク削除","デスク拭き","早寝"],
    ["資料1つ仕上げ","10分学習","先延ばし解消"]
  ][base];
  return { title: "今日の運勢", summary: `${name} の気配。`, luckyColor: ["水色","白","緑","金","紺"][base], actions, disclaimer: "※娯楽・自己内省のためのコンテンツです。" };
}
