"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  History,
  TestTube,
  BarChart3,
  Sparkles,
  LogOut,
  BookOpen,
  ImagePlus,
  ScanEye,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", href: "/" },
  { icon: MessageSquare, label: "プロンプト管理", href: "/prompts" },
  { icon: Database, label: "ナレッジDB", href: "/knowledge" },
  { icon: History, label: "会話ログ", href: "/logs" },
  { icon: TestTube, label: "精度テスト", href: "/test" },
  { icon: BookOpen, label: "手動買取履歴", href: "/manual-data" },
  { icon: ImagePlus, label: "画像ナレッジDB", href: "/image-knowledge" },
  { icon: ScanEye, label: "画像判定テスト", href: "/image-test" },
  { icon: BarChart3, label: "パフォーマンス", href: "/performance" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          RINNE AI Studio
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">モデル状態</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground">オンライン</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
