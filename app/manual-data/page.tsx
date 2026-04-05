"use client"
import { useState, useEffect, Fragment } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

type BuybackEntry = {
  id: string
  category: string
  brand: string
  model: string
  condition: string
  accessories: string[]
  buy_price: number
  sell_price: number | null
  trade_date: string
  authenticity: string
  memo: string
  created_at: string
}

const CATEGORIES = ["時計", "ジュエリー", "バッグ", "金・貴金属", "ホビー", "その他"]
const CONDITIONS = [
  { value: "S", label: "S - 未使用・タグ付き" },
  { value: "A", label: "A - 未使用感あり・極美品" },
  { value: "AB", label: "AB - 使用感少なめ" },
  { value: "B", label: "B - 使用感あり" },
  { value: "BC", label: "BC - やや難あり" },
  { value: "C", label: "C - 難あり" },
  { value: "J", label: "J - ジャンク" },
]
const ACCESSORIES_OPTIONS = ["箱", "保証書", "タグ", "なし"]

export default function ManualDataPage() {
  const [entries, setEntries] = useState<BuybackEntry[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [filterCategory, setFilterCategory] = useState("すべて")
  const [filterBrand, setFilterBrand] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    category: "",
    brand: "",
    model: "",
    condition: "",
    accessories: [] as string[],
    buyPrice: "",
    sellPrice: "",
    date: "",
    authenticity: "本物",
    memo: ""
  })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('buyback_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setEntries(data)
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.category || !form.brand || !form.condition || !form.buyPrice || !form.date) return
    const { error } = await supabase
      .from('buyback_records')
      .insert([{
        category: form.category,
        brand: form.brand,
        model: form.model,
        condition: form.condition,
        accessories: form.accessories,
        buy_price: Number(form.buyPrice),
        sell_price: form.sellPrice ? Number(form.sellPrice) : null,
        trade_date: form.date,
        authenticity: form.authenticity,
        memo: form.memo
      }])
    if (!error) {
      await fetchEntries()
      setForm({
        category: "",
        brand: "",
        model: "",
        condition: "",
        accessories: [],
        buyPrice: "",
        sellPrice: "",
        date: "",
        authenticity: "本物",
        memo: ""
      })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('buyback_records')
      .delete()
      .eq('id', id)
    if (!error) {
      await fetchEntries()
    }
    setDeleteConfirm(null)
  }

  const toggleAcc = (acc: string) => {
    setForm(f => ({
      ...f,
      accessories: f.accessories.includes(acc)
        ? f.accessories.filter(a => a !== acc)
        : [...f.accessories, acc]
    }))
  }

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedRows(next)
  }

  const filtered = entries.filter(e =>
    (filterCategory === "すべて" || e.category === filterCategory) &&
    (filterBrand === "" || e.brand.toLowerCase().includes(filterBrand.toLowerCase()))
  )

  const authBadge = (auth: string) => {
    const styles: Record<string, string> = {
      "本物": "bg-success/10 text-success",
      "偽物": "bg-destructive/10 text-destructive",
      "不明": "bg-muted text-muted-foreground",
    }
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[auth] || styles["不明"]}`}>{auth}</span>
  }

  return (
    <DashboardLayout title="手動買取履歴" description="実際の買取データを入力してAIの相場学習データを蓄積します">
      {/* バナー */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground">
          ここに入力した買取データはAIの相場学習データになります。実際の買取価格を積み重ねることで査定精度が向上します。
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">新規データ入力</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">カテゴリ *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">選択してください</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">ブランド *</label>
            <input
              value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              placeholder="例：ROLEX、HERMES"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">モデル・型番</label>
            <input
              value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
              placeholder="例：サブマリーナ 16610"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">状態ランク *</label>
            <select
              value={form.condition}
              onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">選択してください</option>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">買取価格（円） *</label>
            <input
              type="number"
              value={form.buyPrice}
              onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
              placeholder="例：850000"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">売却価格（円）</label>
            <input
              type="number"
              value={form.sellPrice}
              onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))}
              placeholder="例：950000"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">買取日 *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">真贋判定</label>
            <div className="flex gap-4 pt-2">
              {["本物", "偽物", "不明"].map(a => (
                <label key={a} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="authenticity"
                    value={a}
                    checked={form.authenticity === a}
                    onChange={e => setForm(f => ({ ...f, authenticity: e.target.value }))}
                    className="accent-primary"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">付属品</label>
            <div className="flex gap-4">
              {ACCESSORIES_OPTIONS.map(a => (
                <label key={a} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.accessories.includes(a)}
                    onChange={() => toggleAcc(a)}
                    className="accent-primary"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">メモ</label>
            <textarea
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              placeholder="真贋チェックポイント、特記事項など"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />データを追加
        </Button>
      </div>

      {/* 一覧テーブル */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            登録済みデータ <span className="text-sm font-normal text-muted-foreground">（{filtered.length}件）</span>
          </h2>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="すべて">すべてのカテゴリ</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              placeholder="ブランドで絞り込み"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            読み込み中...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            まだデータがありません。上のフォームから追加してください。
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["カテゴリ", "ブランド", "モデル", "状態", "買取価格", "買取日", "真贋", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(entry => (
                  <Fragment key={entry.id}>
                    <tr
                      className="cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => toggleRow(entry.id)}
                    >
                      <td className="px-4 py-3 text-sm text-foreground">{entry.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{entry.brand}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{entry.model || "-"}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{entry.condition}</td>
                      <td className="px-4 py-3 text-sm text-foreground">¥{entry.buy_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{entry.trade_date}</td>
                      <td className="px-4 py-3">{authBadge(entry.authenticity)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteConfirm(entry.id) }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(entry.id) && (
                      <tr className="bg-muted/10">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid gap-3 md:grid-cols-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">付属品：</span>
                              {entry.accessories?.join("、") || "なし"}
                            </div>
                            {entry.sell_price && (
                              <div>
                                <span className="text-muted-foreground">売却価格：</span>
                                ¥{entry.sell_price.toLocaleString()}
                              </div>
                            )}
                            {entry.memo && (
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">メモ：</span>
                                {entry.memo}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">削除の確認</h3>
            <p className="text-sm text-muted-foreground mb-6">このデータを削除しますか？この操作は取り消せません。</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">キャンセル</Button>
              <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-destructive text-white hover:bg-destructive/90">削除する</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
