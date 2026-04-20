"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Flame,
  Trophy,
  User,
  Wallet,
  Briefcase,
  BarChart3,
  Search,
  PlusCircle,
  ListChecks,
  CreditCard,
  Users,
  ShieldCheck,
  TrendingUp,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const creatorNav = [
  { href: "/dashboard/creator", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/creator/challenges", label: "Défis", icon: Flame },
  { href: "/dashboard/creator/missions", label: "Missions", icon: Briefcase },
  { href: "/dashboard/creator/earnings", label: "Revenus", icon: Wallet },
  { href: "/dashboard/creator/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/dashboard/creator/profile", label: "Mon profil", icon: User },
];

const brandNav = [
  { href: "/dashboard/brand", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/brand/discover", label: "Découvrir", icon: Search },
  { href: "/dashboard/brand/missions", label: "Missions", icon: ListChecks },
  { href: "/dashboard/brand/missions/new", label: "Créer mission", icon: PlusCircle },
  { href: "/dashboard/brand/challenges/new", label: "Créer défi", icon: Flame },
  { href: "/dashboard/brand/billing", label: "Facturation", icon: CreditCard },
];

const adminNav = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/dashboard/admin/challenges", label: "Défis", icon: Trophy },
  { href: "/dashboard/admin/missions", label: "Missions", icon: Briefcase },
  { href: "/dashboard/admin/payments", label: "Paiements", icon: Wallet },
  { href: "/dashboard/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/dashboard/admin/reports", label: "Rapports", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role?.toLowerCase() ?? "creator";

  const isAdminRole = role === "admin" || role === "manager";

  const nav =
    isAdminRole ? adminNav : role === "brand" ? brandNav : creatorNav;

  const roleLabel =
    role === "admin"   ? "Admin"   :
    role === "manager" ? "Manager" :
    role === "brand"   ? "Brand"   : "Creator";

  const RoleIcon =
    isAdminRole ? ShieldCheck : role === "brand" ? Briefcase : Trophy;

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] glass-dark py-6 px-3 gap-1 border-r transition-colors duration-300" style={{ borderColor: "var(--theme-border)" }}>
      {/* Role badge */}
      <div className="flex items-center gap-2 px-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <RoleIcon size={14} className="text-indigo-400" />
        </div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const dashRoot = isAdminRole ? "/dashboard/admin" : `/dashboard/${role}`;
          const active =
            href === dashRoot
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-200",
                active
                  ? "bg-indigo-500/15 text-indigo-300 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon
                size={16}
                className={active ? "text-indigo-400" : "text-slate-500"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Explorer link */}
      <div className="pt-4 mt-2 border-t transition-colors duration-300" style={{ borderColor: "var(--theme-border)" }}>
        <Link
          href="/explorer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Search size={16} className="text-slate-500" />
          Explorer les créateurs
        </Link>
      </div>
    </aside>
  );
}
