import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: string; up: boolean };
  gradient?: boolean;
  className?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = "text-indigo-400",
  trend,
  gradient,
  className,
}: StatCardProps) {
  return (
    <div className={cn(
      "glass rounded-[16px] p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-200",
      className
    )}>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center bg-white/5 group-hover:bg-white/8 transition-colors", iconColor.replace("text-", "bg-").replace("400", "500/15"))}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend.up
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}>
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-700 mt-0.5">{sub}</p>}
    </div>
  );
}
