"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FileText,
  Upload,
  Link,
  Database,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  X,
} from "lucide-react"

interface DataSource {
  id: string
  name: string
  type: "manual" | "database" | "scraping"
  pages?: number
  records?: number
  status: "integrated" | "pending" | "in_progress" | "not_started"
}

interface BrandCoverage {
  brand: string
  authentication: number
  pricing: number
}

const dataSources: DataSource[] = [
  {
    id: "1",
    name: "大吉マニュアル",
    type: "manual",
    pages: 213,
    status: "integrated",
  },
  {
    id: "2",
    name: "PokeStockDB",
    type: "database",
    records: 30000,
    status: "pending",
  },
  {
    id: "3",
    name: "国内買取店スクレイピング",
    type: "scraping",
    status: "in_progress",
  },
  {
    id: "4",
    name: "海外市場DB",
    type: "database",
    status: "not_started",
  },
]

const brandCoverage: BrandCoverage[] = [
  { brand: "LOUIS VUITTON", authentication: 95, pricing: 88 },
  { brand: "CHANEL", authentication: 92, pricing: 85 },
  { brand: "GUCCI", authentication: 88, pricing: 82 },
  { brand: "PRADA", authentication: 78, pricing: 75 },
  { brand: "HERMES", authentication: 85, pricing: 70 },
  { brand: "ROLEX", authentication: 90, pricing: 92 },
]

const statusConfig = {
  integrated: {
    icon: CheckCircle,
    label: "統合済み",
    className: "bg-success/10 text-success neon-badge-success",
  },
  pending: {
    icon: Clock,
    label: "保留中",
    className: "bg-warning/10 text-warning neon-badge-warning",
  },
  in_progress: {
    icon: Clock,
    label: "処理中",
    className: "bg-primary/10 text-primary neon-badge",
  },
  not_started: {
    icon: AlertCircle,
    label: "未開始",
    className: "bg-muted text-muted-foreground",
  },
}

const typeIcons = {
  manual: FileText,
  database: Database,
  scraping: Link,
}

export default function KnowledgeDBPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<"text" | "file" | "url">("text")

  return (
    <DashboardLayout
      title="ナレッジDB"
      description="AIナレッジソースとブランドカバレッジデータの管理"
    >
      {/* Data Sources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">登録済みデータソース</h2>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            データを追加
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {dataSources.map((source) => {
            const StatusIcon = statusConfig[source.status].icon
            const TypeIcon = typeIcons[source.type]

            return (
              <div
                key={source.id}
                className="table-row-glow rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{source.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {source.pages && `${source.pages}ページ`}
                        {source.records && `${source.records.toLocaleString()}レコード`}
                        {!source.pages && !source.records && "データ保留中"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      statusConfig[source.status].className
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[source.status].label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Brand Coverage */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">ブランドカバレッジ</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 gap-4 border-b border-border bg-muted/30 px-6 py-3">
            <div className="text-sm font-medium text-muted-foreground">ブランド</div>
            <div className="text-sm font-medium text-muted-foreground">真贋知識</div>
            <div className="text-sm font-medium text-muted-foreground">相場データ</div>
          </div>
          <div className="divide-y divide-border">
            {brandCoverage.map((brand) => (
              <div
                key={brand.brand}
                className="table-row-glow grid grid-cols-3 gap-4 px-6 py-4 transition-all duration-200"
              >
                <div className="font-medium text-foreground">{brand.brand}</div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${brand.authentication}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {brand.authentication}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-chart-2 transition-all duration-500"
                      style={{ width: `${brand.pricing}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {brand.pricing}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Data Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">データを追加</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex gap-2">
              {[
                { type: "text" as const, icon: FileText, label: "テキスト入力" },
                { type: "file" as const, icon: Upload, label: "ファイルアップロード" },
                { type: "url" as const, icon: Link, label: "URLスクレイピング" },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => setAddType(option.type)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-all duration-200",
                    addType === option.type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              {addType === "text" && (
                <textarea
                  placeholder="ナレッジデータを入力..."
                  className="h-32 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
              {addType === "file" && (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    PDFまたはDOCXファイルをここにドロップ
                  </p>
                  <p className="text-xs text-muted-foreground">またはクリックして参照</p>
                </div>
              )}
              {addType === "url" && (
                <input
                  type="url"
                  placeholder="スクレイピングするURLを入力..."
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="border-border"
              >
                キャンセル
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                追加
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
