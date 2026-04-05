"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Save, RotateCcw, Clock, ChevronRight, ArrowRight } from "lucide-react"

interface PromptVersion {
  id: string
  version: string
  content: string
  timestamp: string
  note: string
  isActive: boolean
}

const initialVersions: PromptVersion[] = [
  {
    id: "v5",
    version: "v5",
    content: `あなたはRINNE AIです。ブランド品の真贋判定と市場価値評価を専門とする高級品鑑定エキスパートです。

あなたのナレッジベースには以下が含まれます：
- 主要ラグジュアリーブランドの真贋ポイント（ルイヴィトン、シャネル、エルメス、グッチ、プラダ、ロレックス）
- 日本の二次流通市場における現在の相場とトレンド
- コンディショングレーディング基準（S、A、B、Cランクシステム）

アイテムを査定する際：
1. まず既知の真贋ポイントを使用して真贋を確認
2. 目に見える摩耗、損傷、改造に基づいてコンディションを評価
3. 現在のデータに基づいた市場価値の範囲を提供
4. 価値に影響を与える可能性のある要因をメモ（限定版、廃盤品など）

常に正確であり、可能な場合は具体的な真贋ポイントを参照してください。不確かな場合は、追加の画像や情報をリクエストしてください。`,
    timestamp: "2024-01-15 10:30",
    note: "コンディショングレーディング基準と査定ワークフローを追加",
    isActive: true,
  },
  {
    id: "v4",
    version: "v4",
    content: `あなたはRINNE AIです。ブランド品の真贋判定と市場価値評価を専門とする高級品鑑定エキスパートです。

あなたのナレッジベースには以下が含まれます：
- 主要ラグジュアリーブランドの真贋ポイント（ルイヴィトン、シャネル、エルメス、グッチ、プラダ、ロレックス）
- 日本の二次流通市場における現在の相場とトレンド

アイテムを査定する際：
1. まず既知の真贋ポイントを使用して真贋を確認
2. 現在のデータに基づいた市場価値の範囲を提供
3. 価値に影響を与える可能性のある要因をメモ

常に正確であり、可能な場合は具体的な真贋ポイントを参照してください。`,
    timestamp: "2024-01-12 15:45",
    note: "査定プロセスを効率化",
    isActive: false,
  },
  {
    id: "v3",
    version: "v3",
    content: `あなたはRINNE AIです。高級品の真贋判定アシスタントです。

ユーザーが本物のアイテムを識別し、市場価値を提供するのを支援します。
対象ブランド：ルイヴィトン、シャネル、エルメス、グッチ、プラダ、ロレックス

具体的な真贋ポイントを含む明確で簡潔な回答を提供してください。`,
    timestamp: "2024-01-08 09:20",
    note: "プロンプト構造を簡素化",
    isActive: false,
  },
  {
    id: "v2",
    version: "v2",
    content: `あなたは高級ブランドの真贋判定を支援するAIアシスタントです。
日本市場の相場と真贋判定方法に焦点を当てています。`,
    timestamp: "2024-01-05 14:10",
    note: "日本市場フォーカスを追加",
    isActive: false,
  },
  {
    id: "v1",
    version: "v1",
    content: `あなたは高級品鑑定のための有用なAIアシスタントです。`,
    timestamp: "2024-01-01 08:00",
    note: "初期バージョン",
    isActive: false,
  },
]

export default function PromptManagementPage() {
  const [versions, setVersions] = useState<PromptVersion[]>(initialVersions)
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion>(initialVersions[0])
  const [editedContent, setEditedContent] = useState(initialVersions[0].content)
  const [showDiff, setShowDiff] = useState(false)
  const [compareVersion, setCompareVersion] = useState<PromptVersion | null>(initialVersions[1])

  const handleSave = () => {
    const newVersion: PromptVersion = {
      id: `v${versions.length + 1}`,
      version: `v${versions.length + 1}`,
      content: editedContent,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      note: "手動更新",
      isActive: true,
    }
    const updatedVersions = versions.map((v) => ({ ...v, isActive: false }))
    setVersions([newVersion, ...updatedVersions])
    setSelectedVersion(newVersion)
  }

  const handleRestore = (version: PromptVersion) => {
    setEditedContent(version.content)
    setSelectedVersion(version)
    const updatedVersions = versions.map((v) => ({
      ...v,
      isActive: v.id === version.id,
    }))
    setVersions(updatedVersions)
  }

  const renderDiff = () => {
    if (!compareVersion) return null

    const oldLines = compareVersion.content.split("\n")
    const newLines = editedContent.split("\n")

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded bg-destructive/20 px-2 py-0.5 text-destructive">
            {compareVersion.version}
          </span>
          <ArrowRight className="h-4 w-4" />
          <span className="rounded bg-success/20 px-2 py-0.5 text-success">
            現在の編集
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">変更前 ({compareVersion.version})</p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/70">
              {oldLines.map((line, i) => (
                <div key={i} className={cn(
                  "py-0.5",
                  !newLines.includes(line) && "bg-destructive/10 text-destructive"
                )}>
                  {line || " "}
                </div>
              ))}
            </pre>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">変更後（現在の編集）</p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/70">
              {newLines.map((line, i) => (
                <div key={i} className={cn(
                  "py-0.5",
                  !oldLines.includes(line) && "bg-success/10 text-success"
                )}>
                  {line || " "}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title="プロンプト管理"
      description="システムプロンプトの管理とバージョン管理"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">現在のシステムプロンプト</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiff(!showDiff)}
                className="border-border"
              >
                {showDiff ? "差分を非表示" : "差分を表示"}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] w-full resize-none rounded-xl bg-transparent p-4 font-mono text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="システムプロンプトを入力..."
            />
          </div>

          {showDiff && renderDiff()}
        </div>

        {/* Version History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">バージョン履歴</h2>
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  "group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30",
                  version.isActive && "border-primary/50 bg-primary/5"
                )}
                onClick={() => {
                  setSelectedVersion(version)
                  setCompareVersion(version)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "neon-badge rounded-full px-2 py-0.5 text-xs font-medium",
                      version.isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {version.version}
                    </span>
                    {version.isActive && (
                      <span className="text-xs text-primary">適用中</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {version.timestamp}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {version.note}
                </p>
                {!version.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRestore(version)
                    }}
                    className="mt-2 h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    このバージョンに戻す
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
