import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // RE:TANAKAから買取価格を取得
    const res = await fetch('https://gold.tanaka.co.jp/retanaka/price/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept-Language': 'ja,en;q=0.9',
      },
      cache: 'no-store'
    })

    const html = await res.text()
    const $ = cheerio.load(html)

    const goldPrices: Record<string, number> = {}
    const platinumPrices: Record<string, number> = {}
    let silverPrice = 0

    // 金製品テーブル
    $('#au_price_table tbody tr').each((_, row) => {
      const grade = $(row).find('th').text().trim().replace(/\s+/g, '')
      const value = $(row).find('td').text().trim()
      const num = parseInt(value.replace(/[^0-9]/g, ''))
      if (grade && num) goldPrices[grade] = num
    })

    // プラチナ製品テーブル
    $('#pt_price_table tbody tr').each((_, row) => {
      const grade = $(row).find('th').text().trim().replace(/\s+/g, '')
      const value = $(row).find('td').text().trim()
      const num = parseInt(value.replace(/[^0-9]/g, ''))
      if (grade && num) platinumPrices[grade] = num
    })

    // 銀
    const silverText = $('#ag_price_table tbody td').first().text().trim()
    silverPrice = parseInt(silverText.replace(/[^0-9]/g, ''))

    const today = new Date().toISOString().split('T')[0]

    // Supabaseに保存
    const { error } = await supabase
      .from('gold_prices')
      .upsert({
        recorded_at: today,
        gold_buy: goldPrices['K24'] || 0,
        gold_sell: goldPrices['K24特定品'] || 0,
        platinum_buy: platinumPrices['1000(999)'] || platinumPrices['1000'] || 0,
        platinum_sell: platinumPrices['Pt特定品'] || 0,
        silver_buy: silverPrice,
        silver_sell: silverPrice,
      }, { onConflict: 'recorded_at' })

    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      data: {
        today,
        gold: goldPrices,
        platinum: platinumPrices,
        silver: silverPrice,
      },
      saved: !error,
      error: error?.message
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
