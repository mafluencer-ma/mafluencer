import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-8", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-[12px] bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <Icon size={20} className="text-indigo-400" />
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
