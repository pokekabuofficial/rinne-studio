import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const res = await fetch('https://gold.tanaka.co.jp/commodity/souba/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept-Language': 'ja,en;q=0.9',
      },
      cache: 'no-store'
    })

    const html = await res.text()
    const $ = cheerio.load(html)

    // 価格を取得
    let goldBuy = 0, goldSell = 0, platinumBuy = 0, platinumSell = 0

    $('table tr').each((_, row) => {
      const cells = $(row).find('td')
      if (cells.length < 2) return
      const label = $(cells[0]).text().trim()
      const value = $(cells[1]).text().trim()
      const num = parseInt(value.replace(/[^0-9]/g, ''))
      if (!num) return

      if (label.includes('金') && label.includes('買取')) goldBuy = num
      if (label.includes('金') && label.includes('小売')) goldSell = num
      if (label.includes('プラチナ') && label.includes('買取')) platinumBuy = num
      if (label.includes('プラチナ') && label.includes('小売')) platinumSell = num
    })

    const today = new Date().toISOString().split('T')[0]

    // Supabaseに保存（同じ日付があればスキップ）
    const { error } = await supabase
      .from('gold_prices')
      .upsert({
        recorded_at: today,
        gold_buy: goldBuy,
        gold_sell: goldSell,
        platinum_buy: platinumBuy,
        platinum_sell: platinumSell,
      }, { onConflict: 'recorded_at' })

    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      data: { today, goldBuy, goldSell, platinumBuy, platinumSell },
      saved: !error,
      error: error?.message
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

