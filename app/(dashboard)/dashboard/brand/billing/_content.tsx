"use client";

import { useState } from "react";
import {
  CreditCard, ArrowDownLeft, ArrowUpRight, CheckCircle,
  Clock, XCircle, TrendingUp, Wallet, Plus, FileText,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

const BALANCE = 34600;
const RESERVED = 4300;

const TRANSACTIONS = [
  { id: "t1", type: "DEPOSIT",    label: "Recharge solde",        amount: 20000, status: "COMPLETED", date: "14 Avr 2025", method: "Virement bancaire" },
  { id: "t2", type: "MISSION",    label: "Mission @yassine_create", amount: -1500, status: "COMPLETED", date: "12 Avr 2025", method: "Mission #m1" },
  { id: "t3", type: "CHALLENGE",  label: "Défi sponsorisé",        amount: -2300, status: "COMPLETED", date: "10 Avr 2025", method: "Challenge #c4" },
  { id: "t4", type: "DEPOSIT",    label: "Recharge solde",        amount: 10000, status: "COMPLETED", date: "5 Avr 2025",  method: "Carte bancaire" },
  { id: "t5", type: "MISSION",    label: "Mission @sarabeauty",    amount: -800,  status: "RESERVED",  date: "3 Avr 2025",  method: "Mission #m2" },
  { id: "t6", type: "MISSION",    label: "Mission @techmaroc",     amount: -2000, status: "RESERVED",  date: "2 Avr 2025",  method: "Mission #m3" },
  { id: "t7", type: "DEPOSIT",    label: "Recharge solde",        amount: 15000, status: "COMPLETED", date: "1 Mar 2025",  method: "Virement bancaire" },
  { id: "t8", type: "CHALLENGE",  label: "Défi #MajestéMaroc",     amount: -4140, status: "COMPLETED", date: "15 Mar 2025", method: "Challenge #c2" },
];

const TYPE_META: Record<string, { icon: typeof ArrowDownLeft; color: string; bg: string }> = {
  DEPOSIT:   { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  MISSION:   { icon: ArrowUpRight,  color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  CHALLENGE: { icon: ArrowUpRight,  color: "text-orange-400",  bg: "bg-orange-500/10" },
};

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  COMPLETED: { label: "Complété", variant: "success" },
  RESERVED:  { label: "Réservé",  variant: "warning" },
  FAILED:    { label: "Échoué",   variant: "error" },
};

const TOPUP_PRESETS = [5000, 10000, 20000, 50000];

const INVOICES = [
  { id: "INV-2025-04", label: "Avril 2025", amount: 6440, date: "1 Avr 2025" },
  { id: "INV-2025-03", label: "Mars 2025",  amount: 4140, date: "1 Mar 2025" },
  { id: "INV-2025-02", label: "Février 2025", amount: 2800, date: "1 Fév 2025" },
];

export default function BillingContent() {
  const [topupModal, setTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [tab, setTab] = useState<"transactions" | "invoices">("transactions");

  async function handleTopup() {
    const amount = Number(topupAmount);
    if (!amount || amount < 500) { toast.error("Montant minimum : 500 MAD"); return; }
    if (amount > 500000) { toast.error("Montant maximum : 500 000 MAD"); return; }
    setTopupLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTopupLoading(false);
    setTopupModal(false);
    setTopupAmount("");
    toast.success(`Recharge de ${formatMAD(amount)} initiée ! Ton solde sera mis à jour sous 24h.`);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Facturation"
        subtitle="Solde, recharges et historique des transactions"
        icon={CreditCard}
        action={
          <Button variant="primary" onClick={() => setTopupModal(true)}>
            <Plus size={15} /> Recharger
          </Button>
        }
      />

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Main balance */}
        <div className="sm:col-span-1 glass rounded-[20px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-pink-500/5" />
          <div className="relative z-10">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <Wallet size={12} /> Solde disponible
            </p>
            <p className="text-4xl font-heading font-bold text-slate-100 mb-1">
              {BALANCE.toLocaleString("fr-MA")}
              <span className="text-lg text-slate-500 ml-1">MAD</span>
            </p>
            {RESERVED > 0 && (
              <p className="text-xs text-amber-400">
                {formatMAD(RESERVED)} réservés en cours
              </p>
            )}
            <Button variant="primary" className="mt-5 w-full" onClick={() => setTopupModal(true)}>
              <Plus size={15} /> Recharger le solde
            </Button>
          </div>
        </div>

        {[
          { label: "Dépensé ce mois",   value: 6440,  icon: ArrowUpRight,  color: "text-indigo-400", sub: "Missions + défis" },
          { label: "Dépensé total",     value: 15780, icon: TrendingUp,    color: "text-pink-400",   sub: "Depuis le début" },
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

      {/* Spend bar chart */}
      <div className="glass rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-300">Dépenses mensuelles</p>
          <Badge variant="warning">+55% vs mois dernier</Badge>
        </div>
        <div className="flex items-end gap-3 h-24">
          {[
            { month: "Fév", spend: 2800 },
            { month: "Mar", spend: 4140 },
            { month: "Avr", spend: 6440 },
          ].map(({ month, spend }) => {
            const pct = (spend / 6440) * 100;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-600">{(spend / 1000).toFixed(1)}k</span>
                <div className="w-full bg-gradient-to-t from-indigo-500 to-pink-500 rounded-t-[6px]" style={{ height: `${pct}%` }} />
                <span className="text-[10px] text-slate-600">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions + Invoices tabs */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-slate-300">Historique</p>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {(["transactions", "invoices"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                  tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t === "transactions" ? "Transactions" : "Factures"}
              </button>
            ))}
          </div>
        </div>

        {tab === "transactions" ? (
          <div className="divide-y divide-white/5">
            {TRANSACTIONS.map((t) => {
              const typeMeta = TYPE_META[t.type];
              const statusMeta = STATUS_META[t.status];
              const Icon = typeMeta.icon;
              const isPositive = t.amount > 0;
              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0", typeMeta.bg)}>
                    <Icon size={16} className={typeMeta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{t.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-600">{t.date}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-600">{t.method}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
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
        ) : (
          <div className="divide-y divide-white/5">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="w-10 h-10 rounded-[10px] bg-slate-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{inv.label}</p>
                  <p className="text-xs text-slate-600">{inv.date} · {inv.id}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-300 tabular-nums">{formatMAD(inv.amount)}</span>
                  <Button variant="ghost" size="sm" onClick={() => toast("Téléchargement de la facture...", { icon: "📄" })}>
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top-up modal */}
      {topupModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTopupModal(false)} />
          <div className="relative glass rounded-[24px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Recharger le solde</h3>
            <p className="text-slate-500 text-sm mb-6">
              Solde actuel : <span className="text-slate-200 font-semibold">{formatMAD(BALANCE)}</span>
            </p>

            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {TOPUP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTopupAmount(String(preset))}
                  className={cn(
                    "py-2 rounded-[10px] text-xs font-semibold border transition-all",
                    topupAmount === String(preset)
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : "bg-slate-800/60 text-slate-500 border-white/8 hover:text-slate-300"
                  )}
                >
                  {(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Montant (min. 500 MAD)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="10000"
                    min={500}
                    className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] pl-4 pr-14 py-3 text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">MAD</span>
                </div>
              </div>

              <div className="glass-sm rounded-[12px] p-4 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Méthode</span><span className="text-slate-300">Virement bancaire CIH</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Délai de crédit</span><span className="text-slate-300">24–48h ouvrables</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Frais</span><span className="text-emerald-400">Gratuit</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-[10px]">
                <AlertCircle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">Les instructions de virement te seront envoyées par email. Le solde est crédité après réception des fonds.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setTopupModal(false)}>Annuler</Button>
              <Button variant="primary" className="flex-1" loading={topupLoading} onClick={handleTopup}>
                <CreditCard size={14} /> Initier la recharge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
