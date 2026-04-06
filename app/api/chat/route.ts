import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getLatestGoldPrices() {
  const { data } = await supabase
    .from('gold_kaitori_prices')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(18)
  return data || []
}

export async function POST(req: Request) {
  const { messages, category } = await req.json()

  // 最新の金相場を取得
  const goldPrices = await getLatestGoldPrices()
  
  const today = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })

  // 相場テキストを作成
  const goldText = goldPrices
    .filter(p => p.metal === 'gold')
    .map(p => `${p.grade}: ${p.price.toLocaleString()}円/g`)
    .join(', ')

  const platinumText = goldPrices
    .filter(p => p.metal === 'platinum')
    .map(p => `${p.grade}: ${p.price.toLocaleString()}円/g`)
    .join(', ')

  const silverText = goldPrices
    .filter(p => p.metal === 'silver')
    .map(p => `${p.price.toLocaleString()}円/g`)
    .join(', ')

  const systemPrompt = `あなたはRINNEという買取サービスの専属AI査定士です。プロの目利きとして査定してください。

【商品ランク】S/A/AB/B/BC/C/J

【本日${today}の貴金属買取相場（RE:TANAKA）】
金製品: ${goldText || 'データなし'}
プラチナ製品: ${platinumText || 'データなし'}
銀製品: ${silverText || 'データなし'}

【ブランド品主要相場】
HERMES バーキン トゴ：A品180万 / ROLEX サブマリーナ16610：A品95万 / CHANEL クラシックフラップ：A品90万

貴金属の査定では必ず上記の本日の相場を使って計算してください。重量がわからない場合は重量を聞いてください。
常に具体的な金額を提示し、オークションを開始しますか？で締めてください。`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, ...messages], max_tokens: 800 }),
  })
  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content || "エラーが発生しました"
  return Response.json({ content: reply })
}
