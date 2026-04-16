import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "glass rounded-[20px] py-16 px-8 text-center flex flex-col items-center gap-4",
      className
    )}>
      {emoji && <p className="text-4xl">{emoji}</p>}
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
          <Icon size={24} className="text-slate-600" />
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-300">{title}</p>
        {description && (
          <p className="text-slate-600 text-sm mt-1 max-w-xs mx-auto leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="outline" size="sm">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
