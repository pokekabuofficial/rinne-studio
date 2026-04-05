export async function POST(req: Request) {
  const { imageBase64, brand, category } = await req.json()

  if (!imageBase64 || !brand) {
    return Response.json(
      { result: "不明", confidence: 0, reasoning: "画像またはブランド情報が不足しています" },
      { status: 400 }
    )
  }

  const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/)
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg"
  const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "")

  const systemPrompt = `あなたはブランド品の真贋判定の専門家です。
画像を詳細に分析して、以下の観点から本物か偽物かを判定してください：
- ロゴ・刻印の精度と正確さ（書体・サイズ・位置）
- 縫製・仕上げの品質（均一性・精度）
- 素材感・質感
- 金具・ハードウェアの品質（光沢・刻印）
- シリアルナンバーの書体・位置・フォーマット
- 全体的なプロポーションと仕上がり

必ずJSON形式のみで返答してください。説明文は不要です：
{
  "result": "本物" または "偽物" または "不明",
  "confidence": 0から100の整数,
  "reasoning": "判定根拠を日本語で3〜5点、箇条書きで詳しく説明"
}`

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `ブランド：${brand}\nカテゴリ：${category}\nこの商品の画像を分析して、本物か偽物かを判定してください。`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 600,
        temperature: 0.2,
      }),
    })

    const data = await res.json()

    if (data.error) {
      return Response.json({
        result: "不明",
        confidence: 0,
        reasoning: `APIエラー：${data.error.message}`,
      })
    }

    const content = data.choices?.[0]?.message?.content || ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return Response.json({
        result: "不明",
        confidence: 0,
        reasoning: content || "判定結果を取得できませんでした",
      })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json({
      result: parsed.result || "不明",
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
      reasoning: parsed.reasoning || "判定根拠を取得できませんでした",
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "不明なエラー"
    return Response.json({
      result: "不明",
      confidence: 0,
      reasoning: `エラーが発生しました：${msg}`,
    })
  }
}
