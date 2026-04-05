export async function POST(req: Request) {
  const { messages, category } = await req.json()
  const systemPrompt = `あなたはRINNEという買取サービスの専属AI査定士です。プロの目利きとして査定してください。
【商品ランク】S/A/AB/B/BC/C/J
【主要相場】HERMES バーキン トゴ：A品180万 / ROLEX サブマリーナ16610：A品95万 / CHANEL クラシックフラップ：A品90万
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
