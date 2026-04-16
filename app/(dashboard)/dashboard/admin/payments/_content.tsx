"use client";

import { useState, useMemo } from "react";
import {
  Wallet, Search, X, CheckCircle, XCircle, Clock,
  ArrowUpRight, ArrowDownLeft, AlertCircle, DollarSign, TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type PaymentStatus = "PENDING" | "PAID" | "REJECTED";
type PaymentType   = "WITHDRAWAL" | "DEPOSIT" | "COMMISSION";

type Payment = {
  id: string;
  type: PaymentType;
  user: string;
  userRole: "CREATOR" | "BRAND";
  amount: number;
  method: string;
  status: PaymentStatus;
  requestedAt: string;
  processedAt?: string;
  note?: string;
};

const INITIAL_PAYMENTS: Payment[] = [
  { id: "p1",  type: "WITHDRAWAL", user: "yassine_create",  userRole: "CREATOR", amount: 1200, method: "CIH Bank ••••3421", status: "PENDING",  requestedAt: "16 Avr 2025" },
  { id: "p2",  type: "WITHDRAWAL", user: "sarabeauty",      userRole: "CREATOR", amount: 800,  method: "Wafabank ••••7812", status: "PENDING",  requestedAt: "15 Avr 2025" },
  { id: "p3",  type: "WITHDRAWAL", user: "techmaroc",       userRole: "CREATOR", amount: 500,  method: "CIH Bank ••••9900", status: "PENDING",  requestedAt: "14 Avr 2025" },
  { id: "p4",  type: "WITHDRAWAL", user: "fatima_food",     userRole: "CREATOR", amount: 650,  method: "Attijariwafa ••••2233", status: "PAID",  requestedAt: "10 Avr 2025", processedAt: "12 Avr 2025" },
  { id: "p5",  type: "DEPOSIT",    user: "Jumia Maroc",     userRole: "BRAND",   amount: 20000, method: "Virement bancaire", status: "PAID",  requestedAt: "8 Avr 2025",  processedAt: "9 Avr 2025" },
  { id: "p6",  type: "WITHDRAWAL", user: "sport_amine",     userRole: "CREATOR", amount: 320,  method: "CIH Bank ••••5510", status: "REJECTED", requestedAt: "5 Avr 2025", processedAt: "6 Avr 2025", note: "IBAN incorrect" },
  { id: "p7",  type: "COMMISSION", user: "Mafluencer",      userRole: "CREATOR", amount: 150,  method: "Interne",           status: "PAID",  requestedAt: "3 Avr 2025",  processedAt: "3 Avr 2025" },
  { id: "p8",  type: "DEPOSIT",    user: "Inwi",            userRole: "BRAND",   amount: 10000, method: "Virement bancaire", status: "PAID",  requestedAt: "1 Avr 2025",  processedAt: "2 Avr 2025" },
  { id: "p9",  type: "WITHDRAWAL", user: "driss_gamer",     userRole: "CREATOR", amount: 420,  method: "Wafabank ••••4411", status: "PENDING",  requestedAt: "16 Avr 2025" },
  { id: "p10", type: "WITHDRAWAL", user: "nora_alami",      userRole: "CREATOR", amount: 280,  method: "CIH Bank ••••6622", status: "PENDING",  requestedAt: "15 Avr 2025" },
];

const STATUS_META: Record<PaymentStatus, { label: string; variant: "warning" | "success" | "error" }> = {
  PENDING:  { label: "En attente", variant: "warning" },
  PAID:     { label: "Payé",       variant: "success" },
  REJECTED: { label: "Rejeté",     variant: "error" },
};

const TYPE_META: Record<PaymentType, { label: string; icon: typeof ArrowUpRight; color: string; bg: string }> = {
  WITHDRAWAL: { label: "Retrait",     icon: ArrowUpRight,  color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  DEPOSIT:    { label: "Recharge",    icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  COMMISSION: { label: "Commission",  icon: DollarSign,    color: "text-pink-400",    bg: "bg-pink-500/10" },
};

const TABS = ["Tous", "En attente", "Payés", "Rejetés"] as const;
type Tab = typeof TABS[number];

export default function AdminPaymentsContent() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState<Tab>("Tous");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote]   = useState("");
  const [loadingId, setLoadingId]     = useState<string | null>(null);

  const filtered = useMemo(() => payments.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.user.toLowerCase().includes(q) && !p.method.toLowerCase().includes(q)) return false;
    if (tab === "En attente" && p.status !== "PENDING")  return false;
    if (tab === "Payés"      && p.status !== "PAID")     return false;
    if (tab === "Rejetés"    && p.status !== "REJECTED") return false;
    return true;
  }), [payments, search, tab]);

  const pendingWithdrawals = payments.filter(p => p.type === "WITHDRAWAL" && p.status === "PENDING");
  const pendingAmount      = pendingWithdrawals.reduce((a, p) => a + p.amount, 0);
  const totalPaidOut       = payments.filter(p => p.type === "WITHDRAWAL" && p.status === "PAID").reduce((a, p) => a + p.amount, 0);

  async function markPaid(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 1000));
    setPayments((ps) => ps.map((p) => p.id === id ? { ...p, status: "PAID", processedAt: new Date().toLocaleDateString("fr-MA") } : p));
    setLoadingId(null);
    toast.success("Paiement marqué comme effectué ✓");
  }

  async function rejectPayment(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 800));
    setPayments((ps) => ps.map((p) => p.id === id ? { ...p, status: "REJECTED", processedAt: new Date().toLocaleDateString("fr-MA"), note: rejectNote || "Refusé par admin" } : p));
    setLoadingId(null);
    setRejectModal(null);
    setRejectNote("");
    toast("Paiement rejeté. Le creator est notifié.", { icon: "↩️" });
  }

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Paiements"
        subtitle="Gestion des retraits creators et recharges brands"
        icon={Wallet}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Retraits en attente", value: pendingWithdrawals.length, sub: formatMAD(pendingAmount), color: "text-amber-400",   icon: Clock },
          { label: "Total versé creators", value: formatMAD(totalPaidOut),  sub: "Retraits validés",       color: "text-indigo-400",  icon: ArrowUpRight },
          { label: "Dépôts brands (mois)", value: formatMAD(payments.filter(p => p.type === "DEPOSIT" && p.status === "PAID").reduce((a, p) => a + p.amount, 0)), sub: "Soldes rechargés", color: "text-emerald-400", icon: ArrowDownLeft },
          { label: "Commissions perçues",  value: formatMAD(payments.filter(p => p.type === "COMMISSION" && p.status === "PAID").reduce((a, p) => a + p.amount, 0)), sub: "Revenus plateforme", color: "text-pink-400", icon: TrendingUp },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="glass rounded-[16px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className={cn("text-xl font-heading font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-700 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pending withdrawals alert */}
      {pendingWithdrawals.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-[14px]">
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-slate-300 flex-1">
            <span className="font-semibold text-amber-400">{pendingWithdrawals.length} demande{pendingWithdrawals.length > 1 ? "s" : ""} de retrait</span> pour un total de <span className="text-amber-400 font-semibold">{formatMAD(pendingAmount)}</span> en attente de traitement.
          </p>
          <button onClick={() => setTab("En attente")} className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap">
            Traiter →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-[16px] p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Creator, marque, méthode..." className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={13} /></button>}
          </div>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn(
                "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
              )}>
                {t}{t === "En attente" && pendingWithdrawals.length > 0 && (
                  <span className="ml-1 px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">{pendingWithdrawals.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600"><span className="text-slate-300">{filtered.length}</span> transaction{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Payments table */}
      {filtered.length === 0 ? (
        <EmptyState emoji="💸" title="Aucune transaction" description="Modifie les filtres" />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          <div className="hidden lg:grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_140px] gap-4 px-6 py-3 border-b border-white/8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span />
            <span>Utilisateur</span>
            <span>Type</span>
            <span>Méthode</span>
            <span>Montant</span>
            <span>Statut</span>
            <span>Demandé le</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((p) => {
              const typeMeta   = TYPE_META[p.type];
              const statusMeta = STATUS_META[p.status];
              const TIcon      = typeMeta.icon;
              const isPending  = p.status === "PENDING";

              return (
                <div key={p.id} className="grid grid-cols-1 lg:grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_140px] gap-4 items-center px-6 py-4 hover:bg-white/2 transition-colors">
                  {/* Type icon */}
                  <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0", typeMeta.bg)}>
                    <TIcon size={14} className={typeMeta.color} />
                  </div>

                  {/* User */}
                  <div>
                    <p className="text-sm font-medium text-slate-200">@{p.user}</p>
                    <p className="text-xs text-slate-600">{p.userRole}</p>
                  </div>

                  {/* Type */}
                  <p className="text-xs text-slate-500">{typeMeta.label}</p>

                  {/* Method */}
                  <p className="text-xs text-slate-500 truncate">{p.method}</p>

                  {/* Amount */}
                  <p className="text-sm font-bold text-slate-200 tabular-nums">{formatMAD(p.amount)}</p>

                  {/* Status + note */}
                  <div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                    {p.note && <p className="text-[11px] text-red-400 mt-0.5">{p.note}</p>}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-slate-500">{p.requestedAt}</p>
                    {p.processedAt && <p className="text-[11px] text-slate-700">Traité: {p.processedAt}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isPending && p.type === "WITHDRAWAL" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={loadingId === p.id}
                          onClick={() => markPaid(p.id)}
                        >
                          <CheckCircle size={12} /> Payer
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setRejectModal(p.id); setRejectNote(""); }}
                        >
                          <XCircle size={12} />
                        </Button>
                      </>
                    )}
                    {isPending && p.type === "DEPOSIT" && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={loadingId === p.id}
                        onClick={() => markPaid(p.id)}
                      >
                        <CheckCircle size={12} /> Valider
                      </Button>
                    )}
                    {!isPending && (
                      <span className="text-xs text-slate-700 italic">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/8 flex items-center justify-between text-xs text-slate-600">
            <span>{filtered.length} transactions</span>
            <span>
              Total affiché : <span className="text-slate-300 font-semibold">{formatMAD(filtered.reduce((a, p) => a + p.amount, 0))}</span>
            </span>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative glass rounded-[24px] p-7 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-heading font-bold text-slate-100 mb-1">Rejeter la demande</h3>
            <p className="text-slate-500 text-sm mb-5">Ajoute une raison (visible par le creator).</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Ex: IBAN incorrect, pièce justificative manquante..."
              className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500/40 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setRejectModal(null)}>Annuler</Button>
              <Button variant="danger" className="flex-1" loading={loadingId === rejectModal} onClick={() => rejectPayment(rejectModal)}>
                <XCircle size={13} /> Rejeter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
