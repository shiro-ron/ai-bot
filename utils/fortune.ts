export type Fortune = {
  title: string;
  summary: string;
  luckyColor: string;
  actions: string[];
  disclaimer: string;
};

const tarotNames = [
  "The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant",
  "The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man",
  "Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World",
  "Wands Ace","Wands Two","Wands Three","Wands Four","Wands Five","Wands Six","Wands Seven","Wands Eight","Wands Nine","Wands Ten",
  "Wands Page","Wands Knight","Wands Queen","Wands King",
  "Cups Ace","Cups Two","Cups Three","Cups Four","Cups Five","Cups Six","Cups Seven","Cups Eight","Cups Nine","Cups Ten",
  "Cups Page","Cups Knight","Cups Queen","Cups King",
  "Swords Ace","Swords Two","Swords Three","Swords Four","Swords Five","Swords Six","Swords Seven","Swords Eight","Swords Nine","Swords Ten",
  "Swords Page","Swords Knight","Swords Queen","Swords King",
  "Pentacles Ace","Pentacles Two","Pentacles Three","Pentacles Four","Pentacles Five","Pentacles Six","Pentacles Seven","Pentacles Eight","Pentacles Nine","Pentacles Ten",
  "Pentacles Page","Pentacles Knight","Pentacles Queen","Pentacles King"
];

/** とても簡易的なテンプレート文を返す（LLM無しでも動く） */
export function simpleFortune(cardIndex: number): Fortune {
  const name = tarotNames[cardIndex] ?? "The Star";
  const base = cardIndex % 5;
  const adviceA = [
    "小さく始めると運が味方します。",
    "午前中に大事な決断を。",
    "人に頼るほどうまくいきます。",
    "不要なものを手放すと吉。",
    "丁寧な準備が成果に直結。"
  ][base];

  const summary = `${name} の気配。${adviceA}`;

  const lucky = ["水色","白","緑","金","紺"][base];
  const actions = [
    ["5分の散歩","机まわりを整える","深呼吸3回"],
    ["午前中にメール返し","温かい飲み物を選ぶ","TODOを3つに絞る"],
    ["誰かに相談","お礼メッセージを送る","軽い運動"],
    ["不要なタスクを捨てる","デスクを拭く","早寝を意識"],
    ["資料を1つ仕上げる","10分だけ学習","先延ばしを1つ解決"]
  ][base];

  return {
    title: `今日の運勢：${name}`,
    summary,
    luckyColor: lucky,
    actions,
    disclaimer: "※本コンテンツは娯楽・自己内省のためのものです。医療・法律・投資等の助言にはあたりません。"
  };
}
