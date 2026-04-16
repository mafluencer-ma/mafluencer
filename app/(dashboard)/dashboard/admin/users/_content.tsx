"use client";

import { useState, useMemo } from "react";
import {
  Users, Search, Filter, X, CheckCircle, Ban,
  ShieldCheck, Edit2, ChevronDown, MoreVertical,
  MapPin, Star, Eye,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";

type UserRole   = "CREATOR" | "BRAND" | "ADMIN";
type UserStatus = "ACTIVE" | "BANNED" | "PENDING";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  city?: string;
  niche?: string;
  score?: number;
  followers?: number;
  company?: string;
  joinedAt: string;
  verified: boolean;
};

const USERS: AdminUser[] = [
  { id: "u1",  name: "Yassine Chahir",  email: "yassine@example.com",  role: "CREATOR", status: "ACTIVE",  city: "Casablanca", niche: "Humour",    score: 847, followers: 124000, joinedAt: "12 Jan 2025", verified: true  },
  { id: "u2",  name: "Sara Benali",     email: "sara@example.com",     role: "CREATOR", status: "ACTIVE",  city: "Rabat",      niche: "Beauté",    score: 762, followers: 89000,  joinedAt: "18 Jan 2025", verified: true  },
  { id: "u3",  name: "Karim Tahir",     email: "karim@example.com",    role: "CREATOR", status: "ACTIVE",  city: "Casablanca", niche: "Tech",      score: 698, followers: 67000,  joinedAt: "3 Fév 2025",  verified: false },
  { id: "u4",  name: "Fatima Zahra",    email: "fatima@example.com",   role: "CREATOR", status: "BANNED",  city: "Marrakech",  niche: "Food",      score: 120, followers: 55000,  joinedAt: "20 Fév 2025", verified: false },
  { id: "u5",  name: "Hind Moussaoui", email: "hind@example.com",     role: "CREATOR", status: "PENDING", city: "Casablanca", niche: "Lifestyle", score: 589, followers: 48000,  joinedAt: "5 Mar 2025",  verified: false },
  { id: "u6",  name: "Jumia Maroc",     email: "contact@jumia.ma",     role: "BRAND",   status: "ACTIVE",  company: "Jumia Maroc",     joinedAt: "1 Jan 2025",  verified: true  },
  { id: "u7",  name: "Inwi",            email: "digital@inwi.ma",      role: "BRAND",   status: "ACTIVE",  company: "Inwi",            joinedAt: "15 Jan 2025", verified: true  },
  { id: "u8",  name: "Marjane Market",  email: "media@marjane.ma",     role: "BRAND",   status: "ACTIVE",  company: "Marjane Market",  joinedAt: "8 Fév 2025",  verified: true  },
  { id: "u9",  name: "Zara Beauty MA",  email: "zara@example.ma",      role: "BRAND",   status: "PENDING", company: "Zara Beauty",     joinedAt: "1 Avr 2025",  verified: false },
  { id: "u10", name: "Driss Gamer",     email: "driss@example.com",    role: "CREATOR", status: "ACTIVE",  city: "Agadir",     niche: "Gaming",    score: 389, followers: 27000,  joinedAt: "10 Mar 2025", verified: false },
  { id: "u11", name: "Nora Alami",      email: "nora@example.com",     role: "CREATOR", status: "ACTIVE",  city: "Casablanca", niche: "Beauté",    score: 278, followers: 15000,  joinedAt: "22 Mar 2025", verified: false },
  { id: "u12", name: "Admin Mafluencer",email: "admin@mafluencer.ma",  role: "ADMIN",   status: "ACTIVE",  joinedAt: "1 Jan 2025",  verified: true  },
];

const ROLE_OPTIONS:   Array<"ALL" | UserRole>   = ["ALL", "CREATOR", "BRAND", "ADMIN"];
const STATUS_OPTIONS: Array<"ALL" | UserStatus> = ["ALL", "ACTIVE", "BANNED", "PENDING"];

const ROLE_META: Record<UserRole, { label: string; variant: "primary" | "warning" | "success" }> = {
  CREATOR: { label: "Creator", variant: "primary" },
  BRAND:   { label: "Brand",   variant: "warning" },
  ADMIN:   { label: "Admin",   variant: "success" },
};

const STATUS_META: Record<UserStatus, { label: string; variant: "success" | "error" | "warning" }> = {
  ACTIVE:  { label: "Actif",       variant: "success" },
  BANNED:  { label: "Banni",       variant: "error" },
  PENDING: { label: "En attente",  variant: "warning" },
};

export default function AdminUsersContent() {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [users, setUsers]           = useState(USERS);

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (roleFilter   !== "ALL" && u.role   !== roleFilter)   return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    return true;
  }), [users, search, roleFilter, statusFilter]);

  function banUser(id: string) {
    setUsers((us) => us.map((u) => u.id === id ? { ...u, status: "BANNED" } : u));
    setActionMenu(null);
    toast.success("Utilisateur banni.");
  }

  function unbanUser(id: string) {
    setUsers((us) => us.map((u) => u.id === id ? { ...u, status: "ACTIVE" } : u));
    setActionMenu(null);
    toast.success("Utilisateur réactivé.");
  }

  function verifyUser(id: string) {
    setUsers((us) => us.map((u) => u.id === id ? { ...u, verified: true, status: "ACTIVE" } : u));
    setActionMenu(null);
    toast.success("Utilisateur vérifié ✓");
  }

  function changeRole(id: string, role: UserRole) {
    setUsers((us) => us.map((u) => u.id === id ? { ...u, role } : u));
    setActionMenu(null);
    toast.success(`Rôle changé → ${role}`);
  }

  return (
    <div className="max-w-6xl space-y-6" onClick={() => setActionMenu(null)}>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${users.length} inscrits · ${users.filter(u => u.status === "ACTIVE").length} actifs`}
        icon={Users}
      />

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total",    value: users.length,                                  color: "text-slate-300" },
          { label: "Creators", value: users.filter(u => u.role === "CREATOR").length, color: "text-indigo-400" },
          { label: "Brands",   value: users.filter(u => u.role === "BRAND").length,   color: "text-pink-400" },
          { label: "Bannis",   value: users.filter(u => u.status === "BANNED").length, color: "text-red-400" },
          { label: "En attente", value: users.filter(u => u.status === "PENDING").length, color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-[12px] px-4 py-2.5 flex items-center gap-2">
            <span className={cn("text-lg font-heading font-bold", color)}>{value}</span>
            <span className="text-xs text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-[16px] p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email..."
              className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={13} /></button>}
          </div>

          {/* Role filter */}
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {ROLE_OPTIONS.map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)} className={cn(
                "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                roleFilter === r ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
              )}>{r === "ALL" ? "Tous" : r}</button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn(
                "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                statusFilter === s ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
              )}>{s === "ALL" ? "Tous" : STATUS_META[s].label}</button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600"><span className="text-slate-300">{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState emoji="👥" title="Aucun utilisateur trouvé" description="Élargis tes filtres" />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-3 border-b border-white/8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Utilisateur</span>
            <span>Email</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span>Score / Infos</span>
            <span>Inscription</span>
            <span />
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((u) => {
              const roleMeta   = ROLE_META[u.role];
              const statusMeta = STATUS_META[u.status];
              return (
                <div key={u.id} className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_60px] gap-4 items-center px-6 py-4 hover:bg-white/2 transition-colors relative">
                  {/* Name + verified */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                        {u.verified && <CheckCircle size={11} className="text-indigo-400 flex-shrink-0" />}
                      </div>
                      {u.city && <p className="text-xs text-slate-600 flex items-center gap-0.5"><MapPin size={9} />{u.city}</p>}
                      {u.company && <p className="text-xs text-slate-600">{u.company}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <p className="text-xs text-slate-500 truncate hidden lg:block">{u.email}</p>

                  {/* Role */}
                  <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>

                  {/* Status */}
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>

                  {/* Score / Info */}
                  <div className="text-xs text-slate-500">
                    {u.role === "CREATOR" && u.score !== undefined && (
                      <div>
                        <p className="text-indigo-300 font-semibold">{u.score} pts</p>
                        <p>{u.followers ? formatNumber(u.followers) + " abonnés" : ""}</p>
                      </div>
                    )}
                    {u.role === "BRAND" && <p className="text-pink-300 font-semibold">Brand</p>}
                    {u.role === "ADMIN" && <p className="text-emerald-300 font-semibold">Admin</p>}
                  </div>

                  {/* Joined */}
                  <p className="text-xs text-slate-600 hidden lg:block">{u.joinedAt}</p>

                  {/* Action menu */}
                  <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                      className="p-2 rounded-[8px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {actionMenu === u.id && (
                      <div className="absolute right-0 top-9 z-20 w-48 glass rounded-[12px] border border-white/8 shadow-xl py-1">
                        {u.role === "CREATOR" && (
                          <Link href={`/creator/${u.name.toLowerCase().replace(/\s/g, "_")}`} target="_blank">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                              <Eye size={12} /> Voir le profil public
                            </button>
                          </Link>
                        )}
                        {!u.verified && (
                          <button onClick={() => verifyUser(u.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-emerald-400 hover:bg-white/5 transition-colors">
                            <CheckCircle size={12} /> Vérifier le compte
                          </button>
                        )}
                        {u.status !== "BANNED" ? (
                          <button onClick={() => banUser(u.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors">
                            <Ban size={12} /> Bannir l'utilisateur
                          </button>
                        ) : (
                          <button onClick={() => unbanUser(u.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-amber-400 hover:bg-white/5 transition-colors">
                            <CheckCircle size={12} /> Réactiver
                          </button>
                        )}
                        <div className="border-t border-white/8 mt-1 pt-1">
                          {(["CREATOR", "BRAND", "ADMIN"] as UserRole[]).filter(r => r !== u.role).map((r) => (
                            <button key={r} onClick={() => changeRole(u.id, r)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                              <ShieldCheck size={12} /> Changer rôle → {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
