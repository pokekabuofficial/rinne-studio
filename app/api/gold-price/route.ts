import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

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

    const prices: Record<string, string> = {}

    $('table tr').each((_, row) => {
      const cells = $(row).find('td')
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim()
        const value = $(cells[1]).text().trim()
        if (label && value) prices[label] = value
      }
    })

    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      prices,
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
