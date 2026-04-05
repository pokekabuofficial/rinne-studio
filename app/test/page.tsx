"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Play, History, Target, CheckCircle, XCircle, Clock } from "lucide-react"

interface TestResult {
  id: string
  productName: string
  aiResponse: string
  expectedValue: string
  score: number
  timestamp: string
  status: "pass" | "fail" | "partial"
}

const statusConfig = {
  pass: {
    icon: CheckCircle,
    label: "合格",
    className: "bg-success/10 text-success neon-badge-success",
    color: "text-success",
  },
  fail: {
    icon: XCircle,
    label: "不合格",
    className: "bg-destructive/10 text-destructive neon-badge-destructive",
    color: "text-destructive",
  },
  partial: {
    icon: Clock,
    label: "部分合格",
    className: "bg-warning/10 text-warning neon-badge-warning",
    color: "text-warning",
  },
}

export default function AccuracyTestPage() {
  const [productName, setProductName] = useState("")
  const [expectedValue, setExpectedValue] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [testScore, setTestScore] = useState<number | null>(null)
  const [testHistory, setTestHistory] = useState<TestResult[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("rinne_test_history")
    if (saved) setTestHistory(JSON.parse(saved))
  }, [])

  const handleRunTest = async () => {
    if (!productName) return
    setIsRunning(true)
    setAiResponse("")
    setTestScore(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `以下の商品を査定してください：${productName}` }],
          category: "test",
        }),
      })
      const data = await res.json()
      const reply = data.content || "エラーが発生しました"
      setAiResponse(reply)

      let score: number | null = null
      if (expectedValue) {
        const keywords = expectedValue.split(/[\s、。,．]+/).filter((k: string) => k.length > 1)
        const matches = keywords.filter((k: string) => reply.includes(k))
        score = Math.min(Math.round((matches.length / keywords.length) * 100), 100)
        setTestScore(score)
      }

      const newResult: TestResult = {
        id: Date.now().toString(),
        productName,
        aiResponse: reply,
        expectedValue,
        score: score ?? 0,
        timestamp: new Date().toLocaleString("ja-JP"),
        status: score !== null ? (score >= 80 ? "pass" : score >= 60 ? "partial" : "fail") : "partial" as const,
      }
      const existing = JSON.parse(localStorage.getItem("rinne_test_history") || "[]")
      const updated = [newResult, ...existing].slice(0, 10)
      localStorage.setItem("rinne_test_history", JSON.stringify(updated))
      setTestHistory(updated)

    } catch (e: any) {
      setAiResponse("エラー：" + e.message)
    } finally {
      setIsRunning(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-destructive"
  }

  return (
    <DashboardLayout
      title="精度テスト"
      description="期待値に対するAI回答のテスト"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">新しいテスト</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  商品名
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="例：ルイヴィトン ネヴァーフルMM モノグラム"
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  期待値（任意）
                </label>
                <textarea
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="スコアリング用の期待されるAI回答を入力..."
                  className="h-24 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleRunTest}
                disabled={!productName || isRunning}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    実行中...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    テスト実行
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Response Section */}
          {(aiResponse || isRunning) && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">AIの回答</h2>
                {testScore !== null && (
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className={cn("text-2xl font-bold", getScoreColor(testScore))}>
                      {testScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                  {aiResponse}
                  {isRunning && (
                    <span className="inline-block h-4 w-2 animate-pulse bg-primary ml-0.5" />
                  )}
                </pre>
              </div>
              {testScore !== null && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        testScore >= 90
                          ? "bg-success"
                          : testScore >= 70
                          ? "bg-warning"
                          : "bg-destructive"
                      )}
                      style={{ width: `${testScore}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      testScore >= 90
                        ? "text-success"
                        : testScore >= 70
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {testScore >= 90 ? "優秀" : testScore >= 70 ? "良好" : "要改善"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">テスト履歴</h2>
          </div>
          <div className="space-y-3">
            {testHistory.map((test) => {
              const StatusIcon = statusConfig[test.status].icon

              return (
                <div
                  key={test.id}
                  className="table-row-glow rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {test.productName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {test.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-lg font-bold",
                          statusConfig[test.status].color
                        )}
                      >
                        {test.score}
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          statusConfig[test.status].className
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[test.status].label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
