"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard, ArrowDownLeft, ArrowUpRight, CheckCircle,
  Clock, XCircle, Wallet, Plus, TrendingUp, Loader2,
  ExternalLink, AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
};

type BillingData = {
  balance: number;
  transactions: Transaction[];
};

const TYPE_META: Record<string, { icon: typeof ArrowDownLeft; color: string; bg: string; label: string }> = {
  DEPOSIT:    { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Recharge"   },
  PAYOUT:     { icon: ArrowUpRight,  color: "text-pink-400",    bg: "bg-pink-500/10",    label: "Retrait"    },
  COMMISSION: { icon: ArrowUpRight,  color: "text-amber-400",   bg: "bg-amber-500/10",   label: "Commission" },
  MISSION:    { icon: ArrowUpRight,  color: "text-indigo-400",  bg: "bg-indigo-500/10",  label: "Mission"    },
  BOOST:      { icon: ArrowUpRight,  color: "text-purple-400",  bg: "bg-purple-500/10",  label: "Boost"      },
};

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "error" | "default"; icon: typeof CheckCircle }> = {
  COMPLETED: { label: "Complété", variant: "success", icon: CheckCircle },
  PENDING:   { label: "En attente", variant: "warning", icon: Clock     },
  FAILED:    { label: "Échoué",   variant: "error",   icon: XCircle    },
};

const TOPUP_PRESETS = [5_000, 10_000, 20_000, 50_000];

function fmt(date: string) {
  return new Date(date).toLocaleDateString("fr-MA", { day: "numeric", month: "short", year: "numeric" });
}

export default function BillingContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [data,         setData]         = useState<BillingData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [topupModal,   setTopupModal]   = useState(false);
  const [topupAmount,  setTopupAmount]  = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, txRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/me/transactions?limit=50"),
      ]);
      const me = meRes.ok ? await meRes.json() : null;
      const tx = txRes.ok ? await txRes.json() : null;
      setData({
        balance:      tx?.balance ?? me?.brandProfile?.balance ?? 0,
        transactions: tx?.transactions ?? [],
      });
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Show toast when redirected back from YouCan Pay
  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success("Paiement confirmé ! Ton solde sera mis à jour dans quelques secondes.");
      // Re-fetch after short delay to catch webhook credit
      const t = setTimeout(() => load(), 3000);
      return () => clearTimeout(t);
    }
    if (paymentStatus === "error") {
      toast.error("Paiement annulé ou échoué. Réessaie.");
    }
  }, [paymentStatus, load]);

  async function handleTopup() {
    const amount = Number(topupAmount);
    if (!amount || amount < 500)    { toast.error("Montant minimum : 500 MAD");      return; }
    if (amount > 500_000)           { toast.error("Montant maximum : 500 000 MAD"); return; }

    setTopupLoading(true);
    try {
      const res = await fetch("/api/payments/youcanpay/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de la création du paiement");
        return;
      }
      // Redirect to YouCan Pay hosted payment page
      window.location.href = json.paymentUrl;
    } catch {
      toast.error("Erreur réseau. Réessaie.");
    } finally {
      setTopupLoading(false);
    }
  }

  const balance  = data?.balance ?? 0;
  const txList   = data?.transactions ?? [];
  const reserved = txList.filter((t) => t.status === "PENDING" && t.type === "DEPOSIT").reduce((s, t) => s + t.amount, 0);

  const thisMonth = (() => {
    const now = new Date();
    return txList
      .filter((t) => {
        const d = new Date(t.createdAt);
        return t.status === "COMPLETED" && t.type !== "DEPOSIT"
          && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
  })();

  const totalSpent = txList
    .filter((t) => t.status === "COMPLETED" && t.type !== "DEPOSIT")
    .reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-8 w-48 bg-slate-700/60 rounded-lg animate-pulse" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-[20px] p-6 animate-pulse h-36" />)}
        </div>
        <div className="glass rounded-[20px] animate-pulse h-64" />
      </div>
    );
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

      {/* Payment status banner */}
      {paymentStatus === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-[14px] bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300">Paiement reçu ! Ton solde sera mis à jour dans quelques instants.</p>
        </div>
      )}
      {paymentStatus === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">Le paiement a été annulé ou a échoué. Aucun montant n&apos;a été débité.</p>
        </div>
      )}

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass rounded-[20px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-pink-500/5" />
          <div className="relative z-10">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <Wallet size={12} /> Solde disponible
            </p>
            <p className="text-4xl font-heading font-bold text-slate-100 mb-1 tabular-nums">
              {balance.toLocaleString("fr-MA")}
              <span className="text-lg text-slate-500 ml-1">MAD</span>
            </p>
            {reserved > 0 && (
              <p className="text-xs text-amber-400 mb-3">
                {formatMAD(reserved)} en attente de confirmation
              </p>
            )}
            <Button variant="primary" className="mt-4 w-full" onClick={() => setTopupModal(true)}>
              <Plus size={15} /> Recharger le solde
            </Button>
          </div>
        </div>

        {[
          { label: "Dépensé ce mois",  value: thisMonth,  icon: ArrowUpRight, color: "text-indigo-400", sub: "Missions + défis" },
          { label: "Dépensé au total", value: totalSpent, icon: TrendingUp,   color: "text-pink-400",   sub: "Depuis le début" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-heading font-bold text-slate-100 tabular-nums">
              {value.toLocaleString("fr-MA")} <span className="text-sm text-slate-500">MAD</span>
            </p>
            <p className="text-xs text-slate-700 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-slate-300">Historique des transactions</p>
          <span className="text-xs text-slate-600">{txList.length} transaction{txList.length !== 1 ? "s" : ""}</span>
        </div>

        {txList.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-slate-400 text-sm">Aucune transaction encore</p>
            <p className="text-slate-600 text-xs mt-1">Recharge ton solde pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {txList.map((t) => {
              const meta   = TYPE_META[t.type]   ?? TYPE_META.DEPOSIT;
              const status = STATUS_META[t.status] ?? STATUS_META.PENDING;
              const Icon   = meta.icon;
              const isIncoming = t.type === "DEPOSIT";
              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0", meta.bg)}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{meta.label}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-600">{fmt(t.createdAt)}</span>
                      {t.paymentMethod?.startsWith("youcanpay") && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-xs text-slate-600">YouCan Pay</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      isIncoming ? "text-emerald-400" : "text-slate-400"
                    )}>
                      {isIncoming ? "+" : "-"}{t.amount.toLocaleString("fr-MA")} MAD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top-up modal */}
      {topupModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !topupLoading && setTopupModal(false)} />
          <div className="relative glass rounded-[24px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Recharger le solde</h3>
            <p className="text-slate-500 text-sm mb-6">
              Solde actuel : <span className="text-slate-200 font-semibold">{formatMAD(balance)}</span>
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
                      : "bg-slate-800/60 text-slate-500 border-white/[0.08] hover:text-slate-300"
                  )}
                >
                  {(preset / 1_000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Montant <span className="text-slate-600">(min. 500 MAD)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="10000"
                    min={500}
                    className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-4 pr-14 py-3 text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">MAD</span>
                </div>
              </div>

              {/* YouCan Pay info */}
              <div className="glass-sm rounded-[12px] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard size={13} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Paiement sécurisé via YouCan Pay</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Méthode</span>
                  <span className="text-slate-300">Carte bancaire · CashPlus</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Crédit du solde</span>
                  <span className="text-slate-300">Immédiat après paiement</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Frais YouCan Pay</span>
                  <span className="text-emerald-400">Inclus</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-[10px]">
                <ExternalLink size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">
                  Tu seras redirigé vers la page de paiement sécurisée YouCan Pay. Reviens ici une fois le paiement effectué.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setTopupModal(false)}
                disabled={topupLoading}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleTopup}
                disabled={topupLoading}
              >
                {topupLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Redirection...</>
                  : <><CreditCard size={14} /> Payer {topupAmount ? formatMAD(Number(topupAmount)) : ""}</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
