"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const accuracyTrendData = [
  { date: "1月1日", accuracy: 78 },
  { date: "1月5日", accuracy: 82 },
  { date: "1月8日", accuracy: 79 },
  { date: "1月10日", accuracy: 85 },
  { date: "1月12日", accuracy: 84 },
  { date: "1月14日", accuracy: 88 },
  { date: "1月15日", accuracy: 87 },
]

const categoryAccuracyData = [
  { category: "バッグ", accuracy: 92, color: "#7aaec8" },
  { category: "時計", accuracy: 88, color: "#5a8eaa" },
  { category: "ジュエリー", accuracy: 78, color: "#f59e0b" },
  { category: "財布", accuracy: 85, color: "#4a7e9a" },
  { category: "アクセサリー", accuracy: 82, color: "#3a6e8a" },
]

const topProducts = [
  { rank: 1, product: "ルイヴィトン ネヴァーフル", queries: 156 },
  { rank: 2, product: "シャネル クラシックフラップ", queries: 134 },
  { rank: 3, product: "ロレックス サブマリーナ", queries: 98 },
  { rank: 4, product: "エルメス バーキン", queries: 87 },
  { rank: 5, product: "グッチ GGマーモント", queries: 76 },
  { rank: 6, product: "プラダ サフィアーノ", queries: 65 },
  { rank: 7, product: "ロレックス デイトナ", queries: 58 },
  { rank: 8, product: "シャネル ボーイバッグ", queries: 52 },
  { rank: 9, product: "ルイヴィトン スピーディ", queries: 47 },
  { rank: 10, product: "エルメス ケリー", queries: 43 },
]

const weakCategories = [
  {
    category: "ジュエリー",
    accuracy: 78,
    issue: "プラチナとホワイトゴールドの区別が困難",
    recommendation: "金属組成分析をナレッジベースに追加",
  },
  {
    category: "ヴィンテージ時計",
    accuracy: 72,
    issue: "2000年以前のモデルでリファレンス番号識別エラー",
    recommendation: "ヴィンテージ時計リファレンスデータベースを拡充",
  },
  {
    category: "限定版",
    accuracy: 75,
    issue: "地域限定リリースのデータ不足",
    recommendation: "日本市場限定版カタログを追加",
  },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function PerformancePage() {
  const currentAccuracy = accuracyTrendData[accuracyTrendData.length - 1].accuracy
  const previousAccuracy = accuracyTrendData[accuracyTrendData.length - 2].accuracy
  const accuracyChange = currentAccuracy - previousAccuracy

  return (
    <DashboardLayout
      title="パフォーマンス"
      description="AI精度メトリクスとパフォーマンス分析"
    >
      <div className="space-y-6">
        {/* Accuracy Trend */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">精度推移</h2>
              <p className="text-sm text-muted-foreground">時間ごとの査定精度</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">{currentAccuracy}%</span>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  accuracyChange >= 0
                    ? "bg-success/10 text-success neon-badge-success"
                    : "bg-destructive/10 text-destructive neon-badge-destructive"
                )}
              >
                {accuracyChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {accuracyChange >= 0 ? "+" : ""}
                {accuracyChange}%
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                <XAxis
                  dataKey="date"
                  stroke="#8b9eb0"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8b9eb0"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[70, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#7aaec8"
                  strokeWidth={2}
                  dot={{ fill: "#7aaec8", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#7aaec8", stroke: "#060810", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Accuracy and Top Products */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Accuracy */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">カテゴリ別精度</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAccuracyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#8b9eb0"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#8b9eb0"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {categoryAccuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">よく査定される商品</h2>
            <div className="space-y-2">
              {topProducts.map((item) => (
                <div
                  key={item.rank}
                  className="table-row-glow flex items-center gap-4 rounded-lg px-3 py-2 transition-all duration-200"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                      item.rank <= 3
                        ? "bg-primary/20 text-primary neon-badge"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.rank}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {item.product}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.queries}件
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weak Categories */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">改善が必要なカテゴリ</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {weakCategories.map((item) => (
              <div
                key={item.category}
                className="rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{item.category}</h3>
                  <span className="neon-badge-warning rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    {item.accuracy}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.issue}</p>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">推奨事項</p>
                  <p className="mt-1 text-sm text-foreground">{item.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
