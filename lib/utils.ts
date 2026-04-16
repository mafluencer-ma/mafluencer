import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMAD(amount: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getScoreLevel(score: number): string {
  if (score >= 800) return "Legend";
  if (score >= 600) return "Elite";
  if (score >= 400) return "Star";
  if (score >= 200) return "Rising";
  return "Rookie";
}

export function getLevelColor(level: string): string {
  const map: Record<string, string> = {
    Legend: "text-yellow-400",
    Elite: "text-purple-400",
    Star: "text-blue-400",
    Rising: "text-green-400",
    Rookie: "text-slate-400",
  };
  return map[level] ?? "text-slate-400";
}

export function getLevelGradient(level: string): string {
  const map: Record<string, string> = {
    Legend: "from-yellow-500 to-orange-500",
    Elite: "from-purple-500 to-pink-500",
    Star: "from-blue-500 to-cyan-500",
    Rising: "from-green-500 to-emerald-500",
    Rookie: "from-slate-500 to-slate-400",
  };
  return map[level] ?? "from-slate-500 to-slate-400";
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `il y a ${Math.floor(diff / 86400)}j`;
  return d.toLocaleDateString("fr-MA");
}
