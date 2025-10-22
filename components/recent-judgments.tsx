import { Clock, Star } from "lucide-react"

const recentJudgments = [
  {
    id: 1,
    title: "AI Ethics Research Paper",
    judges: 3,
    score: 8.7,
    date: "2 hours ago",
    category: "Academic",
  },
  {
    id: 2,
    title: "E-commerce Landing Page Design",
    judges: 2,
    score: 9.2,
    date: "5 hours ago",
    category: "Creative",
  },
  {
    id: 3,
    title: "React Component Architecture",
    judges: 4,
    score: 8.9,
    date: "1 day ago",
    category: "Technical",
  },
]

export function RecentJudgments() {
  return (
    <div className="space-y-4">
      {recentJudgments.map((judgment) => (
        <div
          key={judgment.id}
          className="flex items-center justify-between p-6 rounded-xl bg-surface-1 border border-border/50 hover:border-brand-purple/30 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{judgment.title}</h3>
              <span className="px-2 py-1 text-xs rounded-md bg-surface-2 text-foreground/80 border border-border">
                {judgment.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-foreground/60">
              <span>{judgment.judges} judges</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {judgment.date}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-purple/10 border border-brand-purple/30">
            <Star className="w-4 h-4 text-brand-purple fill-brand-purple" />
            <span className="text-xl font-mono font-bold text-brand-purple">{judgment.score}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
