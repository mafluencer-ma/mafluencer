"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone, Mail, Send, Users, User, Building2, Globe,
  AlertCircle, CheckCircle, ChevronDown, RefreshCw, Clock,
} from "lucide-react";
import PageHeader from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type TargetType = "all" | "creators" | "brands" | "specific";

type SendLog = {
  id:        string;
  title:     string;  // = subject
  message:   string;  // JSON string with stats
  createdAt: string;
};

type LogData = {
  target:       string;
  total:        number;
  sent:         number;
  failed:       number;
  failedEmails: string[];
};

const EMAIL_TEMPLATES = [
  {
    label:   "Annonce nouveauté",
    subject: "Nouvelle fonctionnalité sur Mafluencer",
    message: "Nous avons le plaisir de vous annoncer une nouvelle fonctionnalité sur Mafluencer.\n\nRestez connecté pour en découvrir plus.",
  },
  {
    label:   "Nouveau défi",
    subject: "Un nouveau défi t'attend sur Mafluencer 🔥",
    message: "Un tout nouveau défi créatif vient d'être lancé sur Mafluencer !\n\nConnecte-toi maintenant pour participer et booster ton score.",
  },
  {
    label:   "Rappel mission",
    subject: "Ta mission Mafluencer attend ta livraison",
    message: "Nous vous rappelons qu'une de vos missions est en attente de livraison.\n\nConnectez-vous à votre dashboard pour la gérer.",
  },
  {
    label:   "Invitation inscription",
    subject: "Rejoins Mafluencer — la plateforme des creators marocains",
    message: "Bonjour,\n\nNous t'invitons à rejoindre Mafluencer, la première plateforme dédiée aux creators du Maroc.\n\nInscris-toi gratuitement sur mafluencer.ma et commence à relever des défis créatifs.",
  },
];

const TARGET_OPTIONS: Array<{ value: TargetType; label: string; sub: string; icon: typeof Globe; color: string }> = [
  { value: "all",      label: "Tous les utilisateurs", sub: "Creators + Brands", icon: Globe,     color: "text-slate-300"  },
  { value: "creators", label: "Creators uniquement",   sub: "Rôle CREATOR",      icon: Users,     color: "text-indigo-400" },
  { value: "brands",   label: "Brands uniquement",     sub: "Rôle BRAND",        icon: Building2, color: "text-blue-400"   },
  { value: "specific", label: "Email spécifique",      sub: "Un destinataire",   icon: User,      color: "text-pink-400"   },
];

export default function MarketingContent() {
  const [target,        setTarget]        = useState<TargetType>("creators");
  const [subject,       setSubject]       = useState("");
  const [message,       setMessage]       = useState("");
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending,       setSending]       = useState(false);
  const [logs,          setLogs]          = useState<SendLog[]>([]);
  const [logsLoading,   setLogsLoading]   = useState(true);
  const [templateOpen,  setTemplateOpen]  = useState(false);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/marketing/send");
      if (res.ok) {
        const data = await res.json() as { logs: SendLog[] };
        setLogs(data.logs);
      }
    } catch { /* non-fatal */ }
    finally { setLogsLoading(false); }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  async function handleSend() {
    if (!subject.trim()) { toast.error("Sujet requis"); return; }
    if (!message.trim()) { toast.error("Message requis"); return; }
    if (target === "specific" && !specificEmail.trim()) { toast.error("Email destinataire requis"); return; }

    setSending(true);
    try {
      const res = await fetch("/api/admin/marketing/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          type:    "email",
          target,
          subject,
          message,
          email:   target === "specific" ? specificEmail : undefined,
        }),
      });
      const data = await res.json() as {
        error?: string; total?: number; sent?: number; failed?: number; failedEmails?: string[];
      };
      if (!res.ok) { toast.error(data.error ?? "Erreur d'envoi"); return; }

      const sentCount = data.sent ?? 0;
      const failCount = data.failed ?? 0;
      toast.success(`✓ ${sentCount} email${sentCount > 1 ? "s" : ""} envoyé${sentCount > 1 ? "s" : ""} sur ${data.total ?? 0}`);
      if (failCount > 0) toast.error(`${failCount} échec${failCount > 1 ? "s" : ""}`);

      setSubject("");
      setMessage("");
      setSpecificEmail("");
      loadLogs();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  function parseLogData(raw: string): LogData | null {
    try { return JSON.parse(raw); } catch { return null; }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Marketing"
        subtitle="Envoi d'emails en masse à vos utilisateurs"
        icon={Megaphone}
        action={
          <button onClick={loadLogs} disabled={logsLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50">
            <RefreshCw size={13} className={logsLoading ? "animate-spin" : ""} />
            Actualiser
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Compose form ── */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6 space-y-5">

          {/* Target selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Destinataires</p>
            <div className="grid grid-cols-2 gap-2">
              {TARGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTarget(opt.value)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-3 rounded-[12px] text-left border transition-all",
                    target === opt.value
                      ? "bg-indigo-500/15 border-indigo-500/30"
                      : "border-white/[0.06] hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <opt.icon size={14} className={target === opt.value ? opt.color : "text-slate-600"} />
                  <div>
                    <p className={cn("text-xs font-medium", target === opt.value ? "text-slate-200" : "text-slate-400")}>{opt.label}</p>
                    <p className="text-[11px] text-slate-600">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            {target === "specific" && (
              <input
                type="email"
                value={specificEmail}
                onChange={(e) => setSpecificEmail(e.target.value)}
                placeholder="destinataire@email.com"
                className="mt-2 w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            )}
          </div>

          {/* Template picker */}
          <div className="relative">
            <button
              onClick={() => setTemplateOpen(!templateOpen)}
              className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ChevronDown size={13} className={cn("transition-transform", templateOpen && "rotate-180")} />
              Modèles prédéfinis
            </button>
            {templateOpen && (
              <div className="absolute top-7 left-0 z-20 w-80 glass rounded-[14px] border border-white/[0.08] shadow-2xl py-1">
                {EMAIL_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => { setSubject(t.subject); setMessage(t.message); setTemplateOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-300">{t.label}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{t.subject}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Sujet de l&apos;email</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet de l'email..."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Contenu du message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Écris ton message ici...\n\nTu peux utiliser plusieurs paragraphes."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-700 mt-1 text-right">{message.length} caractères</p>
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={15} />
                Envoyer l&apos;email
              </>
            )}
          </button>
        </div>

        {/* ── Sidebar: info + config ── */}
        <div className="space-y-4">
          <div className="glass rounded-[16px] p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Canal actif</p>
            <div className="flex items-center gap-3 p-3 rounded-[10px] bg-indigo-500/10 border border-indigo-500/20">
              <Mail size={16} className="text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Email</p>
                <p className="text-[11px] text-slate-500">Via Resend API</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Les emails sont envoyés par lots de 10 depuis <span className="text-slate-400">noreply@mafluencer.ma</span>.
            </p>
          </div>

          <div className="glass rounded-[16px] p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuration</p>
            {[
              { label: "Resend API Key",  configured: !!process.env.NEXT_PUBLIC_APP_URL },
              { label: "From: noreply@mafluencer.ma", configured: true },
            ].map(({ label, configured }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 truncate">{label}</span>
                {configured ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 flex-shrink-0"><CheckCircle size={10} /> OK</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-amber-500 flex-shrink-0"><AlertCircle size={10} /> Manquant</span>
                )}
              </div>
            ))}
          </div>

          {/* Session stats from logs */}
          {logs.length > 0 && (
            <div className="glass rounded-[16px] p-5 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Résumé total</p>
              {(() => {
                const totals = logs.reduce((acc, l) => {
                  const d = parseLogData(l.message);
                  if (!d) return acc;
                  return { sent: acc.sent + d.sent, failed: acc.failed + d.failed };
                }, { sent: 0, failed: 0 });
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Envoyés</span>
                      <span className="text-emerald-400 font-bold">{totals.sent}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Échecs</span>
                      <span className="text-red-400 font-bold">{totals.failed}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Campagnes</span>
                      <span className="text-slate-300 font-bold">{logs.length}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── Send history ── */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-300">Historique des envois (10 derniers)</p>
          <span className="text-xs text-slate-600">{logs.length} campagne{logs.length !== 1 ? "s" : ""}</span>
        </div>
        {logsLoading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-8 h-8 rounded-[8px] bg-slate-700/60 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700/60 rounded w-48" />
                  <div className="h-2.5 bg-slate-700/40 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Mail size={24} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Aucun envoi pour l&apos;instant</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const d = parseLogData(log.message);
              return (
                <div key={log.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-[8px] bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{log.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-600">
                      {d && <span>→ {d.target}</span>}
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(log.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {d && (
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                      <span className="text-emerald-400 font-semibold">✓ {d.sent}</span>
                      {d.failed > 0 && <span className="text-red-400">✗ {d.failed}</span>}
                      <span className="text-slate-600">/{d.total}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
