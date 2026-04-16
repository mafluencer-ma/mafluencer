"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getScoreLevel, getLevelGradient } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  showLevel?: boolean;
  className?: string;
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  animated = true,
  showLevel = true,
  className,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animated ? 0 : score);
  const level = getScoreLevel(score);

  useEffect(() => {
    if (!animated) return;
    let start: number | null = null;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(ease * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score, animated]);

  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = displayed / 1000;
  const dashOffset = circumference * (1 - pct);

  const gradientId = `score-grad-${score}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: animated ? "none" : "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-heading font-bold text-slate-100">{displayed}</span>
        {showLevel && (
          <span className={cn("text-xs font-semibold mt-0.5", `bg-gradient-to-r ${getLevelGradient(level)} bg-clip-text text-transparent`)}>
            {level}
          </span>
        )}
      </div>
    </div>
  );
}
