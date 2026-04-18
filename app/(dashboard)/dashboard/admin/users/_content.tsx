"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, X, CheckCircle, Ban,
  ShieldCheck, MoreVertical, Eye, RefreshCw, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";

type UserRole = "CREATOR" | "BRAND" | "ADMIN";

type AdminUser = {
  id:           string;
  name:         string | null;
  email:        string;
  role:         UserRole;
  image:        string | null;
  banned:       boolean;
  emailVerified: string | null;
  createdAt:    string;
  creatorProfile?: { score: number; level: string; followersCount: number } | null;
  brandProfile?:  { companyName: string; balance: number } | null;
};

type Pagination = { page: number; limit: number; total: number };

const ROLE_OPTIONS: Array<"ALL" | UserRole> = ["ALL", "CREATOR", "BRAND", "ADMIN"];

const ROLE_META: Record<UserRole, { label: string; variant: "primary" | "warning" | "success" }> = {
  CREATOR: { label: "Creator", variant: "primary" },
  BRAND:   { label: "Brand",   variant: "warning" },
  ADMIN:   { label: "Admin",   variant: "success" },
};

export default function AdminUsersContent() {
  const [users,       setUsers]       = useState<AdminUser[]>([]);
  const [pagination,  setPagination]  = useState<Pagination>({ page: 1, limit: 50, total: 0 });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState<"ALL" | UserRole>("ALL");
  const [actionMenu,  setActionMenu]  = useState<string | null>(null);
  const [processing,  setProcessing]  = useState<string | null>(null);
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "ALL") params.set("role", roleFilter);

      const res  = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json() as { users: AdminUser[]; pagination: Pagination };
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (e) {
      setError("Impossible de charger les utilisateurs.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => { load(1); }, [load]);

  async function patchUser(id: string, body: Record<string, unknown>) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as { user?: AdminUser; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      setUsers((us) => us.map((u) => u.id === id ? { ...u, ...data.user } : u));
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setProcessing(null);
      setActionMenu(null);
    }
  }

  async function changeRole(id: string, role: UserRole) {
    await patchUser(id, { role });
    toast.success(`Rôle changé → ${role}`);
  }

  async function banUser(id: string) {
    await patchUser(id, { banned: true });
    toast.success("Utilisateur banni");
  }

  async function unbanUser(id: string) {
    await patchUser(id, { banned: false });
    toast.success("Utilisateur réactivé");
  }

  const counts = {
    total:    users.length,
    creators: users.filter(u => u.role === "CREATOR").length,
    brands:   users.filter(u => u.role === "BRAND").length,
    banned:   users.filter(u => u.banned).length,
    pending:  users.filter(u => !u.emailVerified && !u.banned).length,
  };

  return (
    <div className="max-w-6xl space-y-6" onClick={() => setActionMenu(null)}>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${pagination.total} inscrits au total`}
        icon={Users}
        action={
          <button
            onClick={() => load(1)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total",      value: pagination.total, color: "text-slate-300" },
          { label: "Creators",   value: counts.creators,  color: "text-indigo-400" },
          { label: "Brands",     value: counts.brands,    color: "text-pink-400" },
          { label: "Bannis",     value: counts.banned,    color: "text-red-400" },
          { label: "En attente", value: counts.pending,   color: "text-amber-400" },
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
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
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
        </div>
        <p className="text-xs text-slate-600"><span className="text-slate-300">{users.length}</span> résultat{users.length !== 1 ? "s" : ""} affiché{users.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass rounded-[20px] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-700/60 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700/60 rounded w-40" />
                <div className="h-2.5 bg-slate-700/40 rounded w-56" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState emoji="👥" title="Aucun utilisateur trouvé" description="Élargis tes filtres ou attends les premières inscriptions" />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-3 border-b border-white/[0.06] text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Utilisateur</span>
            <span>Email</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span>Score / Infos</span>
            <span>Inscription</span>
            <span />
          </div>
          <div className="divide-y divide-white/5">
            {users.map((u) => {
              const roleMeta = ROLE_META[u.role];
              const isBanned = u.banned;
              const isPending = !u.emailVerified && !isBanned && u.role !== "ADMIN";
              const statusLabel = isBanned ? "Banni" : isPending ? "En attente" : "Actif";
              const statusVariant = isBanned ? "error" as const : isPending ? "warning" as const : "success" as const;
              const isProcessing = processing === u.id;

              return (
                <div key={u.id} className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_60px] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors relative">
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                      {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{u.name ?? "—"}</p>
                      {u.brandProfile && <p className="text-xs text-slate-600">{u.brandProfile.companyName}</p>}
                    </div>
                  </div>
                  {/* Email */}
                  <p className="text-xs text-slate-500 truncate hidden lg:block">{u.email}</p>
                  {/* Role */}
                  <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>
                  {/* Status */}
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                  {/* Score / Info */}
                  <div className="text-xs text-slate-500">
                    {u.role === "CREATOR" && u.creatorProfile && (
                      <div>
                        <p className="text-indigo-300 font-semibold">{u.creatorProfile.score} pts</p>
                        <p>{formatNumber(u.creatorProfile.followersCount)} abonnés</p>
                      </div>
                    )}
                    {u.role === "BRAND" && u.brandProfile && (
                      <p className="text-pink-300 font-semibold">{u.brandProfile.companyName}</p>
                    )}
                    {u.role === "ADMIN" && <p className="text-emerald-300 font-semibold">Admin</p>}
                  </div>
                  {/* Joined */}
                  <p className="text-xs text-slate-600 hidden lg:block">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })}
                  </p>
                  {/* Action menu */}
                  <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                      disabled={isProcessing}
                      className="p-2 rounded-[8px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {actionMenu === u.id && (
                      <div className="absolute right-0 top-9 z-20 w-52 glass rounded-[12px] border border-white/[0.08] shadow-xl py-1">
                        {u.role === "CREATOR" && (
                          <Link href={`/creator/${(u.name ?? u.email).toLowerCase().replace(/\s/g, "_")}`} target="_blank">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                              <Eye size={12} /> Voir le profil public
                            </button>
                          </Link>
                        )}
                        {!isBanned ? (
                          <button onClick={() => banUser(u.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors">
                            <Ban size={12} /> Bannir l'utilisateur
                          </button>
                        ) : (
                          <button onClick={() => unbanUser(u.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-amber-400 hover:bg-white/5 transition-colors">
                            <CheckCircle size={12} /> Réactiver
                          </button>
                        )}
                        {u.role !== "ADMIN" && (
                          <div className="border-t border-white/[0.06] mt-1 pt-1">
                            {(["CREATOR", "BRAND"] as UserRole[]).filter(r => r !== u.role).map((r) => (
                              <button key={r} onClick={() => changeRole(u.id, r)} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                                <ShieldCheck size={12} /> Changer rôle → {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06]">
              <p className="text-xs text-slate-600">
                Page {pagination.page} · {pagination.total} résultats
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => load(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 hover:bg-white/5 rounded-[8px] transition-all"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => load(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 hover:bg-white/5 rounded-[8px] transition-all"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
