"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Upload, ScanEye, History, CheckCircle, XCircle, HelpCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthResult = "本物" | "偽物" | "不明"

type TestResult = {
  id: string
  imagePreview: string
  brand: string
  category: string
  result: AuthResult
  confidence: number
  reasoning: string
  timestamp: string
}

const STORAGE_KEY = "rinne_image_test_history"
const CATEGORIES = ["時計", "ジュエリー", "バッグ", "金・貴金属", "ホビー", "その他"]

const resultConfig = {
  本物: { icon: CheckCircle, color: "text-success", bg: "bg-success/10 border-success/30" },
  偽物: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  不明: { icon: HelpCircle, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
}

export default function ImageTestPage() {
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [brand, setBrand] = useState("")
  const [category, setCategory] = useState("時計")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [history, setHistory] = useState<TestResult[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setImageBase64(base64)
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleTest = async () => {
    if (!imageBase64 || !brand) return
    setIsRunning(true)
    setResult(null)
    try {
      const res = await fetch("/api/image-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, brand, category }),
      })
      const data = await res.json()
      const newResult: TestResult = {
        id: Date.now().toString(),
        imagePreview: imagePreview!,
        brand,
        category,
        result: (data.result as AuthResult) || "不明",
        confidence: data.confidence || 0,
        reasoning: data.reasoning || "判定できませんでした",
        timestamp: new Date().toLocaleString("ja-JP"),
      }
      setResult(newResult)
      const existing: TestResult[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      const updated = [newResult, ...existing].slice(0, 20)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setHistory(updated)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "不明なエラー"
      setResult({
        id: Date.now().toString(),
        imagePreview: imagePreview!,
        brand,
        category,
        result: "不明",
        confidence: 0,
        reasoning: `エラーが発生しました：${msg}`,
        timestamp: new Date().toLocaleString("ja-JP"),
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <DashboardLayout title="画像判定テスト" description="画像をアップロードしてAIが本物か偽物かを判定します（GPT-4o Vision使用）">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">新しい判定テスト</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">判定する画像 *</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} className="max-h-64 w-full rounded-lg border border-border bg-muted object-contain" alt="判定画像" />
                    <button onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileRef.current?.click()}
                    className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">クリックして画像を選択</p>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP対応</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">ブランド *</label>
                  <input value={brand} onChange={(e) => setBrand(e.target.value)}
                    placeholder="例：ROLEX、CHANEL"
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">カテゴリ</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={handleTest} disabled={!imageBase64 || !brand || isRunning}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {isRunning ? (
                  <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />AIが判定中...</>
                ) : (
                  <><ScanEye className="mr-2 h-4 w-4" />画像を判定する</>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <div className={cn("rounded-xl border p-6", resultConfig[result.result].bg)}>
              <div className="mb-4 flex items-center gap-4">
                {(() => { const Icon = resultConfig[result.result].icon; return <Icon className={cn("h-10 w-10", resultConfig[result.result].color)} /> })()}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">判定結果</p>
                  <p className={cn("text-3xl font-bold", resultConfig[result.result].color)}>{result.result}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">信頼度</p>
                  <p className={cn("text-3xl font-bold", resultConfig[result.result].color)}>{result.confidence}%</p>
                </div>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-background/50">
                <div className={cn("h-full rounded-full transition-all duration-700",
                  result.result === "本物" ? "bg-success" : result.result === "偽物" ? "bg-destructive" : "bg-warning")}
                  style={{ width: `${result.confidence}%` }} />
              </div>
              <div className="rounded-lg bg-background/50 p-4">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">AI判定根拠</p>
                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{result.reasoning}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">判定履歴</h2>
            {history.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{history.length}件</span>
            )}
          </div>
          {history.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">まだ履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => {
                const config = resultConfig[h.result] || resultConfig["不明"]
                const Icon = config.icon
                return (
                  <div key={h.id} className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30">
                    <div className="flex items-center gap-3 p-3">
                      <img src={h.imagePreview} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" alt={h.brand} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{h.brand}</p>
                        <p className="text-xs text-muted-foreground">{h.timestamp}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <Icon className={cn("h-3.5 w-3.5", config.color)} />
                          <span className={cn("text-sm font-bold", config.color)}>{h.result}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{h.confidence}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
