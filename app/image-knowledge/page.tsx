"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, Info, Plus, X, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

type ImageEntry = {
  id: string
  brand: string
  model: string
  category: string
  authenticity: "本物" | "偽物"
  part: string
  memo: string
  image_urls: string[]
  created_at: string
}

const CATEGORIES = ["時計", "ジュエリー", "バッグ", "金・貴金属", "ホビー", "その他"]
const PARTS = ["全体", "正面", "背面", "文字盤", "リューズ・竜頭", "刻印・刻字", "シリアルナンバー", "金具・バックル", "ステッチ", "タグ・シリアルシール", "その他"]

export default function ImageKnowledgePage() {
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [filterAuth, setFilterAuth] = useState<"すべて" | "本物" | "偽物">("すべて")
  const [filterBrand, setFilterBrand] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    brand: "",
    model: "",
    category: "時計",
    authenticity: "本物" as "本物" | "偽物",
    part: "全体",
    memo: "",
  })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('image_knowledge')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setEntries(data)
    }
    setLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewImages((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleAdd = async () => {
    if (!form.brand || previewImages.length === 0) return
    const { error } = await supabase
      .from('image_knowledge')
      .insert([{
        brand: form.brand,
        model: form.model,
        category: form.category,
        authenticity: form.authenticity,
        part: form.part,
        memo: form.memo,
        image_urls: previewImages
      }])
    if (!error) {
      await fetchEntries()
      setForm({
        brand: "",
        model: "",
        category: "時計",
        authenticity: "本物",
        part: "全体",
        memo: ""
      })
      setPreviewImages([])
      setShowForm(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('image_knowledge')
      .delete()
      .eq('id', id)
    if (!error) {
      await fetchEntries()
    }
    setDeleteConfirm(null)
  }

  const filtered = entries.filter((e) =>
    (filterAuth === "すべて" || e.authenticity === filterAuth) &&
    (filterBrand === "" || e.brand.toLowerCase().includes(filterBrand.toLowerCase()))
  )

  const stats = {
    total: entries.length,
    real: entries.filter((e) => e.authenticity === "本物").length,
    fake: entries.filter((e) => e.authenticity === "偽物").length,
  }

  return (
    <DashboardLayout title="画像ナレッジDB" description="本物・偽物の画像を蓄積してAIの真贋判定精度を向上させます">
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          本物・偽物の画像を登録することでAIの真贋判定精度が向上します。部位ごとに細かく登録するほど効果的です。偽物の場合はメモに「どこが偽物か」を記録してください。
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "総登録数", value: stats.total, color: "text-foreground" },
          { label: "本物", value: stats.real, color: "text-success" },
          { label: "偽物", value: stats.fake, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className={cn("text-3xl font-bold", s.color)}>{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["すべて", "本物", "偽物"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterAuth(f)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                filterAuth === f ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          placeholder="ブランドで絞り込み"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
        />
        <Button onClick={() => setShowForm(true)} className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />画像を追加
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <ImagePlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">まだ画像がありません。「画像を追加」から登録してください。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <div key={entry.id} className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {entry.image_urls[0] && (
                  <img src={entry.image_urls[0]} alt={entry.brand} className="h-full w-full object-cover" />
                )}
                {entry.image_urls.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                    +{entry.image_urls.length - 1}枚
                  </span>
                )}
                <span
                  className={cn(
                    "absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
                    entry.authenticity === "本物" ? "bg-success/90" : "bg-destructive/90"
                  )}
                >
                  {entry.authenticity}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{entry.brand}</p>
                    <p className="text-sm text-muted-foreground">{entry.model || "モデル未記載"}</p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(entry.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{entry.category}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{entry.part}</span>
                </div>
                {entry.memo && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{entry.memo}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">画像を追加</h3>
              <button
                onClick={() => { setShowForm(false); setPreviewImages([]) }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">ブランド *</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="例：ROLEX"
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">モデル</label>
                  <input
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="例：サブマリーナ"
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">カテゴリ</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">撮影部位</label>
                  <select
                    value={form.part}
                    onChange={(e) => setForm((f) => ({ ...f, part: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">真贋 *</label>
                <div className="flex gap-6">
                  {(["本物", "偽物"] as const).map((a) => (
                    <label key={a} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="auth"
                        value={a}
                        checked={form.authenticity === a}
                        onChange={() => setForm((f) => ({ ...f, authenticity: a }))}
                        className="accent-primary"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">メモ</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                  placeholder="偽物の場合：どこが偽物か（例：竜頭の刻印が浅い・シリアルの書体が違う）"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">画像 *（複数選択可）</label>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary/50"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 text-sm text-muted-foreground">クリックして画像を選択</p>
                </div>
                {previewImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewImages.map((img, i) => (
                      <div key={i} className="relative h-16 w-16">
                        <img src={img} className="h-full w-full rounded object-cover" alt="" />
                        <button
                          onClick={() => setPreviewImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowForm(false); setPreviewImages([]) }}
                className="flex-1 border-border"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!form.brand || previewImages.length === 0}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                追加する
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-foreground">削除の確認</h3>
            <p className="mb-6 text-sm text-muted-foreground">この画像データを削除しますか？この操作は取り消せません。</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 border-border">
                キャンセル
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
