"use client";

import { useState } from "react";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, AlertCircle, TrendingUp, CreditCard,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

const BALANCE = 3450;
const PENDING_PAYOUT = 800;

const TRANSACTIONS = [
  { id: "t1", type: "DEPOSIT", from: "Jumia Maroc", amount: 1500, status: "COMPLETED", date: "15 Avr 2025", method: "Virement", mission: "Vidéo review produit" },
  { id: "t2", type: "PAYOUT", from: "Retrait", amount: -1000, status: "COMPLETED", date: "10 Avr 2025", method: "CIH Bank" },
  { id: "t3", type: "DEPOSIT", from: "Inwi", amount: 1200, status: "COMPLETED", date: "2 Avr 2025", method: "Virement", mission: "Post sponsorisé" },
  { id: "t4", type: "COMMISSION", from: "Commission Mafluencer", amount: -120, status: "COMPLETED", date: "2 Avr 2025", method: "Auto" },
  { id: "t5", type: "DEPOSIT", from: "Marjane Market", amount: 800, status: "PENDING", date: "28 Mar 2025", method: "Virement", mission: "Story x3" },
  { id: "t6", type: "DEPOSIT", from: "Zara Beauty", amount: 650, status: "COMPLETED", date: "20 Mar 2025", method: "Virement", mission: "Reel beauté" },
  { id: "t7", type: "PAYOUT", from: "Retrait", amount: -500, status: "FAILED", date: "15 Mar 2025", method: "CIH Bank" },
  { id: "t8", type: "DEPOSIT", from: "Carrefour MA", amount: 920, status: "COMPLETED", date: "8 Mar 2025", method: "Virement", mission: "Haul shopping" },
];

const TYPE_META: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string }> = {
  DEPOSIT: { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Mission" },
  PAYOUT: { icon: ArrowUpRight, color: "text-blue-400", bg: "bg-blue-500/10", label: "Retrait" },
  COMMISSION: { icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-500/10", label: "Commission" },
};

const STATUS_META: Record<string, { label: string; icon: typeof CheckCircle; color: string; variant: "success" | "warning" | "error" | "default" }> = {
  COMPLETED: { label: "Complété", icon: CheckCircle, color: "text-emerald-400", variant: "success" },
  PENDING: { label: "En attente", icon: Clock, color: "text-amber-400", variant: "warning" },
  FAILED: { label: "Échoué", icon: XCircle, color: "text-red-400", variant: "error" },
};

const TABS = ["Toutes", "Dépôts", "Retraits"] as const;
type Tab = typeof TABS[number];

const MONTHS = ["Avr 2025", "Mar 2025", "Fév 2025"];

export default function EarningsContent() {
  const [tab, setTab] = useState<Tab>("Toutes");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const filtered = TRANSACTIONS.filter((t) => {
    if (tab === "Dépôts") return t.type === "DEPOSIT";
    if (tab === "Retraits") return t.type === "PAYOUT";
    return true;
  });

  const totalEarned = TRANSACTIONS.filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED").reduce((a, t) => a + t.amount, 0);
  const totalWithdrawn = Math.abs(TRANSACTIONS.filter((t) => t.type === "PAYOUT" && t.status === "COMPLETED").reduce((a, t) => a + t.amount, 0));

  async function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) { toast.error("Montant invalide"); return; }
    if (amount > BALANCE) { toast.error("Solde insuffisant"); return; }
    if (amount < 200) { toast.error("Retrait minimum : 200 MAD"); return; }
    setWithdrawing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setWithdrawing(false);
    setWithdrawModalOpen(false);
    setWithdrawAmount("");
    toast.success(`Retrait de ${formatMAD(amount)} initié ! Traitement sous 48h.`);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Revenus"
        subtitle="Solde, historique des paiements et retraits"
        icon={Wallet}
      />

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Main balance */}
        <div className="sm:col-span-1 glass rounded-[20px] p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-cyan-500/5" />
          <div className="relative z-10">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <Wallet size={12} /> Solde disponible
            </p>
            <p className="text-4xl font-heading font-bold text-slate-100 mb-1">
              {BALANCE.toLocaleString("fr-MA")}
              <span className="text-lg text-slate-500 ml-1">MAD</span>
            </p>
            {PENDING_PAYOUT > 0 && (
              <p className="text-xs text-amber-400">
                + {formatMAD(PENDING_PAYOUT)} en attente
              </p>
            )}
            <Button
              variant="primary"
              className="mt-5 w-full"
              onClick={() => setWithdrawModalOpen(true)}
            >
              <ArrowUpRight size={15} /> Retirer des fonds
            </Button>
          </div>
        </div>

        {[
          { label: "Total gagné", value: totalEarned, icon: TrendingUp, color: "text-indigo-400", sub: "Toutes missions confondues" },
          { label: "Total retiré", value: totalWithdrawn, icon: CreditCard, color: "text-blue-400", sub: "Vers ton compte bancaire" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-heading font-bold text-slate-100">
              {value.toLocaleString("fr-MA")} <span className="text-sm text-slate-500">MAD</span>
            </p>
            <p className="text-xs text-slate-700 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="glass rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-300">Revenus mensuels</p>
          <Badge variant="success">+40% ce mois</Badge>
        </div>
        <div className="flex items-end gap-3 h-24">
          {[920, 1450, 2200].map((v, i) => {
            const max = 2200;
            const pct = (v / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-600">{formatMAD(v)}</span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-pink-500 rounded-t-[6px] transition-all duration-500"
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[10px] text-slate-600">{MONTHS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-slate-300">Historique des transactions</p>
          {/* Tabs */}
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                  tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState emoji="💸" title="Aucune transaction" description="Les transactions apparaîtront ici" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((t) => {
              const typeMeta = TYPE_META[t.type];
              const statusMeta = STATUS_META[t.status];
              const Icon = typeMeta.icon;
              const StatusIcon = statusMeta.icon;
              const isPositive = t.amount > 0;

              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0", typeMeta.bg)}>
                    <Icon size={16} className={typeMeta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{t.from}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-600">{t.date}</span>
                      {t.mission && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-xs text-slate-600 truncate">{t.mission}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={statusMeta.variant}>
                      <StatusIcon size={10} />
                      {statusMeta.label}
                    </Badge>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      isPositive ? "text-emerald-400" : "text-slate-400"
                    )}>
                      {isPositive ? "+" : ""}{Math.abs(t.amount).toLocaleString("fr-MA")} MAD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWithdrawModalOpen(false)} />
          <div className="relative glass rounded-[24px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Retirer des fonds</h3>
            <p className="text-slate-500 text-sm mb-6">
              Solde disponible : <span className="text-slate-200 font-semibold">{formatMAD(BALANCE)}</span>
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Montant (min. 200 MAD)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="500"
                    min={200}
                    max={BALANCE}
                    className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] pl-4 pr-14 py-3 text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">MAD</span>
                </div>
              </div>
              <div className="glass-sm rounded-[12px] p-4 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Méthode</span><span className="text-slate-300">CIH Bank (••••3421)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Délai</span><span className="text-slate-300">1–2 jours ouvrables</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Frais</span><span className="text-emerald-400">Gratuit</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setWithdrawModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" className="flex-1" loading={withdrawing} onClick={handleWithdraw}>
                Confirmer le retrait
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
