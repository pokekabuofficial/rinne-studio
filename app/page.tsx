import { DashboardLayout } from "@/components/dashboard-layout"
import { KpiCard } from "@/components/kpi-card"
import { ConversationLogCard } from "@/components/conversation-log-card"
import { Cpu, DollarSign, Target, MessageSquare } from "lucide-react"

const kpiData = [
  {
    title: "AIモデル",
    value: "GPT-4o-mini",
    icon: Cpu,
  },
  {
    title: "API使用量（今月）",
    value: "$0.84",
    icon: DollarSign,
    trend: { value: "先月比 12%", positive: false },
  },
  {
    title: "査定精度",
    value: "87%",
    icon: Target,
    trend: { value: "先週比 +3%", positive: true },
  },
  {
    title: "会話ログ数",
    value: "342",
    icon: MessageSquare,
    trend: { value: "本日 24件", positive: true },
  },
]

const recentLogs = [
  {
    id: "1",
    question: "ルイヴィトン ネヴァーフルMM モノグラム コンディション評価",
    answer: "画像分析に基づき、このバッグは本物と判断されます。主な判断ポイント：縫い目でのLVモノグラムパターンの適切な配置、正確な刻印タイポグラフィ、高品質なキャンバス素材。推定市場価値：120,000〜150,000円",
    accuracyTag: "accurate" as const,
    timestamp: "2024-01-15 14:32",
  },
  {
    id: "2",
    question: "シャネル クラシックフラップ ミディアム ラムスキン 査定依頼",
    answer: "追加画像が必要です。現在の分析では以下の点から本物の可能性が高いと判断：CCターンロックの位置、キルティングパターンの対称性、チェーンの重量感。シリアルステッカーの接写画像が必要です。",
    accuracyTag: "needs_improvement" as const,
    timestamp: "2024-01-15 13:45",
  },
  {
    id: "3",
    question: "ロレックス サブマリーナ デイト ref.116610LN 相場照会",
    answer: "現在の市場価値：1,450,000〜1,650,000円。備考：箱・保証書の有無、コンディション、購入年により価格が変動します。最近の市場トレンドではピーク時から5%下落。",
    accuracyTag: "accurate" as const,
    timestamp: "2024-01-15 12:18",
  },
  {
    id: "4",
    question: "エルメス バーキン25 トゴレザー カラー特定",
    answer: "提供された画像からは正確なカラー特定ができませんでした。照明条件がカラー判定に影響しています。推奨：自然光での追加画像をリクエストしてください。",
    accuracyTag: "inaccurate" as const,
    timestamp: "2024-01-15 11:05",
  },
  {
    id: "5",
    question: "グッチ GGマーモント スモール マテラッセ ショルダーバッグ 真贋判定",
    answer: "真贋判定完了。本物の判断ポイントを確認：正確なGG金具の仕上げ、適切なキルトシェブロンパターン、正確なシリアル番号フォーマット。コンディション：Aランク。推定価値：85,000〜95,000円",
    accuracyTag: "accurate" as const,
    timestamp: "2024-01-15 10:22",
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="ダッシュボード"
      description="AI査定システムの概要と最近のアクティビティ"
    >
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Recent Conversations */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">最近の会話ログ</h2>
          <a
            href="/logs"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            すべて見る
          </a>
        </div>
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <ConversationLogCard key={log.id} log={log} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
