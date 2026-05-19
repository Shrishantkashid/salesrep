import React from 'react';

const LABEL_STYLES = {
  "Cold":        { bar: "bg-gray-300",   text: "text-slate-400",   bg: "bg-slate-800/70",   border: "border-white/15" },
  "Warming up":  { bar: "bg-amber-400",  text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  "Engaged":     { bar: "bg-blue-400",   text: "text-cyan-300",   bg: "bg-cyan-500/10",   border: "border-blue-200" },
  "Hot":         { bar: "bg-emerald-500/100",  text: "text-emerald-200",  bg: "bg-emerald-500/10",  border: "border-green-200" },
  "At risk":     { bar: "bg-red-400",    text: "text-red-600",    bg: "bg-rose-500/10",    border: "border-red-200" },
}

const MOMENTUM_ICON = {
  "improving":  { icon: "↑", color: "text-green-500" },
  "stalling":   { icon: "→", color: "text-amber-500" },
  "declining":  { icon: "↓", color: "text-red-500" },
  "new":        { icon: "★", color: "text-blue-400" },
}

const CONFIDENCE_LABEL = {
  "low":    "Low confidence — limited interaction history",
  "medium": "Medium confidence",
  "high":   "High confidence — strong memory signal",
}

export default function DealHealthCard({ dealHealth }) {
  if (!dealHealth) return null

  const { score, label, momentum, risk, recommended_action, confidence } = dealHealth
  const styles = LABEL_STYLES[label] || LABEL_STYLES["Cold"]
  const mom = MOMENTUM_ICON[momentum] || MOMENTUM_ICON["new"]

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4 mb-4`}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Deal Health</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles.border} ${styles.text} ${styles.bg}`}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${mom.color}`}>{mom.icon}</span>
          <span className="text-xs text-slate-500 capitalize">{momentum}</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-1">
          <span className={`text-3xl font-bold ${styles.text}`}>{score}</span>
          <span className="text-xs text-slate-500 mb-1">/ 100</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`${styles.bar} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Risk */}
      {risk && (
        <div className="flex items-start gap-2 mb-3 p-2 bg-slate-900/70 rounded-lg border border-white/10">
          <span className="text-amber-400 mt-0.5 text-xs">⚠</span>
          <p className="text-xs text-slate-300 leading-relaxed">{risk}</p>
        </div>
      )}

      {/* Recommended action */}
      <div className="flex items-start gap-2 mb-3 p-2 bg-slate-900/70 rounded-lg border border-white/10">
        <span className="text-blue-400 mt-0.5 text-xs">→</span>
        <p className="text-xs text-slate-200 font-medium leading-relaxed">{recommended_action}</p>
      </div>

      {/* Confidence */}
      <p className="text-xs text-slate-500 italic">{CONFIDENCE_LABEL[confidence] || CONFIDENCE_LABEL["medium"]}</p>
    </div>
  )
}
