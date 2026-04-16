"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function CountdownTimer({ endDate, className, size = "md" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  function getTimeLeft(end: Date) {
    const diff = Math.max(0, end.getTime() - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, total: diff };
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // < 24h
  const isExpired = timeLeft.total === 0;

  const unitClass = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const labelClass = size === "sm" ? "text-[9px]" : "text-[10px]";
  const boxClass = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-14 h-14" : "w-12 h-12";

  if (isExpired) {
    return (
      <span className={cn("text-xs text-red-400 font-medium", className)}>Défi terminé</span>
    );
  }

  const units = [
    { val: timeLeft.days, label: "j" },
    { val: timeLeft.hours, label: "h" },
    { val: timeLeft.minutes, label: "min" },
    { val: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {units.map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <div className={cn(
            "rounded-[8px] flex items-center justify-center font-heading font-bold tabular-nums transition-colors",
            boxClass, unitClass,
            isUrgent
              ? "bg-red-500/15 text-red-400 border border-red-500/20"
              : "glass text-slate-200"
          )}>
            {String(val).padStart(2, "0")}
          </div>
          <span className={cn(labelClass, "text-slate-600")}>{label}</span>
        </div>
      ))}
    </div>
  );
}
