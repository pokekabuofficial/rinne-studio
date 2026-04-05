"use client"

import { useState } from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { cn } from "@/lib/utils"
import { Lightbulb, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ConversationLog {
  id: string
  timestamp: string
  userId: string
  question: string
  answer: string
  accuracyTag: "accurate" | "inaccurate" | "needs_improvement"
  improvementNote?: string
}

const conversationLogs: ConversationLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32",
    userId: "USR-001",
    question: "ルイヴィトン ネヴァーフルMM モノグラム コンディション評価",
    answer: "画像分析に基づき、このバッグは本物と判断されます。主な判断ポイント：縫い目でのLVモノグラムパターンの適切な配置、正確な刻印タイポグラフィ、高品質なキャンバス素材。推定市場価値：120,000〜150,000円",
    accuracyTag: "accurate"
  },
  {
    id: "2",
    timestamp: "2024-01-15 13:45",
    userId: "USR-002",
    question: "シャネル クラシックフラップ ミディアム ラムスキン 査定依頼",
    answer: "追加画像が必要です。現在の分析では本物の可能性が高いと判断：CCターンロックの位置、キルティングパターンの対称性、チェーンの重量感。シリアルステッカーの接写画像が必要です。",
    accuracyTag: "needs_improvement",
    improvementNote: "必要な画像を事前に全てリクエストすべき。シャネル真贋判定に必要な写真チェックリストを追加。"
  },
  {
    id: "3",
    timestamp: "2024-01-15 12:18",
    userId: "USR-003",
    question: "ロレックス サブマリーナ デイト ref.116610LN 相場照会",
    answer: "現在の市場価値：1,450,000〜1,650,000円。備考：箱・保証書の有無、コンディション、購入年により価格が変動します。最近の市場トレンドではピーク時から5%下落。",
    accuracyTag: "accurate"
  },
  {
    id: "4",
    timestamp: "2024-01-15 11:05",
    userId: "USR-004",
    question: "エルメス バーキン25 トゴレザー カラー特定",
    answer: "提供された画像からは正確なカラー特定ができませんでした。照明条件がカラー判定に影響しています。自然光下での追加画像をリクエストします。",
    accuracyTag: "inaccurate",
    improvementNote: "カラー特定に失敗。色認識アルゴリズムを強化し、カラーリファレンスチャートをナレッジベースに追加する必要あり。"
  },
  {
    id: "5",
    timestamp: "2024-01-15 10:22",
    userId: "USR-005",
    question: "グッチ GGマーモント スモール マテラッセ ショルダーバッグ 真贋判定",
    answer: "真贋判定完了。本物の判断ポイントを確認：正確なGG金具の仕上げ、適切なキルトシェブロンパターン、正確なシリアル番号フォーマット。コンディション：Aランク。推定価値：85,000〜95,000円",
    accuracyTag: "accurate"
  },
  {
    id: "6",
    timestamp: "2024-01-15 09:15",
    userId: "USR-006",
    question: "プラダ サフィアーノレザー ウォレット シリアル番号確認",
    answer: "シリアルフォーマットは有効に見えますが、データベースで確認できません。プラダの真贋判定にはロゴスタンプの深さとステッチパターンの実物検査が必要です。",
    accuracyTag: "needs_improvement",
    improvementNote: "プラダの真贋知識が不完全。詳細なシリアル番号フォーマットデータベースと真贋ポイント画像を追加する必要あり。"
  },
  {
    id: "7",
    timestamp: "2024-01-14 16:45",
    userId: "USR-007",
    question: "ヴィンテージ シャネル 2.55 リイシュー 価値評価",
    answer: "ヴィンテージ2.55リイシュー（2005-2010年代）は通常350,000〜450,000円で評価。コンディションは良好ですが、金具にパティナが見られます。",
    accuracyTag: "accurate"
  },
  {
    id: "8",
    timestamp: "2024-01-14 15:30",
    userId: "USR-008",
    question: "ロレックス デイトジャスト 36mm リファレンス比較",
    answer: "提供画像からref.116234とref.126234の判別ができません。ケースバックとブレスレットクラスプのより鮮明な画像が必要です。",
    accuracyTag: "inaccurate",
    improvementNote: "ロレックスのリファレンス識別を改善する必要あり。類似リファレンスの詳細比較チャートを追加。"
  }
]

const tagConfig = {
  accurate: { label: "正確", icon: CheckCircle, badge: "bg-success/10 text-success border border-success/20", dot: "bg-success" },
  inaccurate: { label: "不正確", icon: XCircle, badge: "bg-destructive/10 text-destructive border border-destructive/20", dot: "bg-destructive" },
  needs_improvement: { label: "要改善", icon: AlertCircle, badge: "bg-warning/10 text-warning border border-warning/20", dot: "bg-warning" },
}

type FilterType = "all" | "accurate" | "inaccurate" | "needs_improvement"

export default function ConversationLogsPage() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filteredLogs = conversationLogs.filter((log) => filter === "all" || log.accuracyTag === filter)
  const improvementLogs = conversationLogs.filter((log) => log.improvementNote)

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filterTabs = [
    { value: "all" as FilterType, label: "すべて", count: conversationLogs.length },
    { value: "accurate" as FilterType, label: "正確", count: conversationLogs.filter(l => l.accuracyTag === "accurate").length },
    { value: "needs_improvement" as FilterType, label: "要改善", count: conversationLogs.filter(l => l.accuracyTag === "needs_improvement").length },
    { value: "inaccurate" as FilterType, label: "不正確", count: conversationLogs.filter(l => l.accuracyTag === "inaccurate").length },
  ]

  return (
    <DashboardLayout title="会話ログ" description="AI査定の会話履歴と精度を管理します">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={cn("flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  filter === tab.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {tab.label}
                <span className={cn("rounded-full px-1.5 py-0.5 text-xs",
                  filter === tab.value ? "bg-primary/20 text-primary" : "bg-background text-muted-foreground")}>
                  {tab.count}
                </span>
              </button>
            ))}
            <span className="ml-auto text-sm text-muted-foreground">{filteredLogs.length}件</span>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const config = tagConfig[log.accuracyTag]
              const Icon = config.icon
              const isExpanded = expandedRows.has(log.id)
              return (
                <div key={log.id} className="rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 overflow-hidden">
                  <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => toggleRow(log.id)}>
                    <div className={cn("mt-1.5 h-2 w-2 rounded-full flex-shrink-0", config.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", config.badge)}>
                          <Icon className="h-3 w-3" />{config.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        <span className="text-xs font-mono text-muted-foreground">{log.userId}</span>
                      </div>
                      <p className={cn("text-sm font-medium text-foreground", !isExpanded && "line-clamp-2")}>{log.question}</p>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground mt-0.5">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/10 px-4 py-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">AIの回答</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{log.answer}</p>
                      </div>
                      {log.improvementNote && (
                        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                          <div className="flex items-center gap-2 text-warning mb-1">
                            <Lightbulb className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">改善メモ</span>
                          </div>
                          <p className="text-sm text-foreground">{log.improvementNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">改善ポイント</h2>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{improvementLogs.length}件</span>
          </div>
          <div className="space-y-3">
            {improvementLogs.map((log) => (
              <div key={log.id} className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-warning/30"
                onClick={() => setExpandedRows((prev) => { const next = new Set(prev); next.add(log.id); return next })}>
                <div className="flex items-start gap-3">
                  <div className={cn("mt-1 h-2 w-2 rounded-full flex-shrink-0", log.accuracyTag === "inaccurate" ? "bg-destructive" : "bg-warning")} />
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{log.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{log.improvementNote}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
