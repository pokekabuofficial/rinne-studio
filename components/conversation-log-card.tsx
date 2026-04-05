import { cn } from "@/lib/utils"

interface ConversationLog {
  id: string
  question: string
  answer: string
  accuracyTag: "accurate" | "inaccurate" | "needs_improvement"
  timestamp: string
}

interface ConversationLogCardProps {
  log: ConversationLog
}

const tagStyles = {
  accurate: "bg-success/10 text-success neon-badge-success",
  inaccurate: "bg-destructive/10 text-destructive neon-badge-destructive",
  needs_improvement: "bg-warning/10 text-warning neon-badge-warning",
}

const tagLabels = {
  accurate: "正確",
  inaccurate: "不正確",
  needs_improvement: "要改善",
}

export function ConversationLogCard({ log }: ConversationLogCardProps) {
  return (
    <div className="table-row-glow rounded-lg border border-border bg-card p-4 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                tagStyles[log.accuracyTag]
              )}
            >
              {tagLabels[log.accuracyTag]}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">Q: {log.question}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">A: {log.answer}</p>
        </div>
      </div>
    </div>
  )
}
