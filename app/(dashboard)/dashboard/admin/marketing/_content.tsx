"use client";

import { useState } from "react";
import {
  Megaphone, Mail, MessageCircle, Send, Users, User,
  Building2, Globe, AlertCircle, CheckCircle, Clock, ChevronDown,
} from "lucide-react";
import PageHeader from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type SendType   = "email" | "whatsapp";
type TargetType = "all" | "creators" | "brands" | "specific";

type SendResult = {
  type:         string;
  total:        number;
  sent:         number;
  failed:       number;
  failedEmails?: string[];
};

type HistoryItem = {
  id:        string;
  type:      SendType;
  target:    TargetType;
  subject:   string;
  message:   string;
  sentAt:    Date;
  result:    SendResult;
};

const EMAIL_TEMPLATES = [
  {
    label:   "Annonce nouveauté",
    subject: "Nouvelle fonctionnalité sur Mafluencer",
    message: "Bonjour,\n\nNous avons le plaisir de vous annoncer une nouvelle fonctionnalité sur Mafluencer.\n\nRestez connecté pour en découvrir plus.\n\nL'équipe Mafluencer",
  },
  {
    label:   "Nouveau défi",
    subject: "Un nouveau défi t'attend sur Mafluencer 🔥",
    message: "Salut,\n\nUn tout nouveau défi créatif vient d'être lancé sur Mafluencer !\n\nConnecte-toi maintenant pour participer et booster ton score.\n\nL'équipe Mafluencer",
  },
  {
    label:   "Rappel mission",
    subject: "Ta mission Mafluencer attend ta livraison",
    message: "Bonjour,\n\nNous vous rappelons qu'une de vos missions est en attente de livraison.\n\nConnectez-vous à votre dashboard pour la gérer.\n\nL'équipe Mafluencer",
  },
];

const TARGET_OPTIONS: Array<{ value: TargetType; label: string; icon: typeof Globe; color: string }> = [
  { value: "all",      label: "Tous les utilisateurs", icon: Globe,     color: "text-slate-300"   },
  { value: "creators", label: "Creators uniquement",   icon: Users,     color: "text-indigo-400"  },
  { value: "brands",   label: "Brands uniquement",     icon: Building2, color: "text-blue-400"    },
  { value: "specific", label: "Email spécifique",      icon: User,      color: "text-pink-400"    },
];

export default function MarketingContent() {
  const [sendType,    setSendType]    = useState<SendType>("email");
  const [target,      setTarget]      = useState<TargetType>("creators");
  const [subject,     setSubject]     = useState("");
  const [message,     setMessage]     = useState("");
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending,     setSending]     = useState(false);
  const [history,     setHistory]     = useState<HistoryItem[]>([]);
  const [templateOpen, setTemplateOpen] = useState(false);

  async function handleSend() {
    if (!message.trim()) { toast.error("Message requis"); return; }
    if (sendType === "email" && !subject.trim()) { toast.error("Sujet requis pour les emails"); return; }
    if (target === "specific" && !specificEmail.trim()) { toast.error("Email destinataire requis"); return; }

    setSending(true);
    try {
      const res = await fetch("/api/admin/marketing/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          type:    sendType,
          target,
          message,
          subject: subject || undefined,
          email:   target === "specific" ? specificEmail : undefined,
        }),
      });
      const data = await res.json() as { error?: string } & Partial<SendResult>;
      if (!res.ok) { toast.error(data.error ?? "Erreur d'envoi"); return; }

      const result: SendResult = {
        type:         data.type ?? sendType,
        total:        data.total ?? 0,
        sent:         data.sent  ?? 0,
        failed:       data.failed ?? 0,
        failedEmails: data.failedEmails,
      };

      setHistory((h) => [{
        id:      crypto.randomUUID(),
        type:    sendType,
        target,
        subject,
        message,
        sentAt:  new Date(),
        result,
      }, ...h.slice(0, 19)]);

      toast.success(`✓ ${result.sent} message${result.sent > 1 ? "s" : ""} envoyé${result.sent > 1 ? "s" : ""}`);
      if (result.failed > 0) toast.error(`${result.failed} échec${result.failed > 1 ? "s" : ""}`);

      setSubject("");
      setMessage("");
      setSpecificEmail("");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  function applyTemplate(t: typeof EMAIL_TEMPLATES[0]) {
    setSubject(t.subject);
    setMessage(t.message);
    setTemplateOpen(false);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Marketing"
        subtitle="Envoi d'emails et WhatsApp en masse"
        icon={Megaphone}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose form */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6 space-y-5">
          {/* Channel selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Canal</p>
            <div className="flex gap-2">
              {(["email", "whatsapp"] as SendType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSendType(t)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-medium border transition-all",
                    sendType === t
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "text-slate-500 border-white/[0.06] hover:text-slate-300 hover:bg-white/5"
                  )}
                >
                  {t === "email" ? <Mail size={14} /> : <MessageCircle size={14} />}
                  {t === "email" ? "Email" : "WhatsApp"}
                </button>
              ))}
            </div>
            {sendType === "whatsapp" && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-[10px] bg-amber-500/10 border border-amber-500/20">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  WhatsApp Business API nécessite les variables <code className="bg-slate-800 px-1 rounded">WHATSAPP_TOKEN</code> et <code className="bg-slate-800 px-1 rounded">WHATSAPP_PHONE_ID</code> dans les env vars, ainsi que des numéros de téléphone enregistrés.
                </p>
              </div>
            )}
          </div>

          {/* Target selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Destinataires</p>
            <div className="grid grid-cols-2 gap-2">
              {TARGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTarget(opt.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-xs border transition-all text-left",
                    target === opt.value
                      ? "bg-indigo-500/15 border-indigo-500/30 text-slate-200"
                      : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  )}
                >
                  <opt.icon size={13} className={target === opt.value ? opt.color : "text-slate-600"} />
                  {opt.label}
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

          {/* Templates dropdown */}
          {sendType === "email" && (
            <div className="relative">
              <button
                onClick={() => setTemplateOpen(!templateOpen)}
                className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ChevronDown size={13} className={cn("transition-transform", templateOpen && "rotate-180")} />
                Utiliser un modèle
              </button>
              {templateOpen && (
                <div className="absolute top-7 left-0 z-10 w-72 glass rounded-[12px] border border-white/[0.08] shadow-xl py-1">
                  {EMAIL_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => applyTemplate(t)}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
                    >
                      <p className="font-medium text-slate-300">{t.label}</p>
                      <p className="text-slate-600 truncate">{t.subject}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subject */}
          {sendType === "email" && (
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Sujet</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de l'email..."
                className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              placeholder="Écris ton message ici..."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
            />
            <p className="text-xs text-slate-700 mt-1 text-right">{message.length} caractères</p>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || (sendType === "email" && !subject.trim())}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={15} />
                Envoyer {sendType === "email" ? "l'email" : "WhatsApp"}
              </>
            )}
          </button>
        </div>

        {/* Stats + history sidebar */}
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="glass rounded-[16px] p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500">Résumé des envois</p>
            <div className="space-y-2">
              {[
                { label: "Campagnes",       value: history.length,                                                icon: Megaphone,     color: "text-indigo-400" },
                { label: "Emails envoyés",  value: history.filter(h => h.type === "email").reduce((a, h) => a + h.result.sent, 0), icon: Mail,          color: "text-emerald-400" },
                { label: "Échecs total",    value: history.reduce((a, h) => a + h.result.failed, 0),              icon: AlertCircle,   color: "text-red-400"    },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={color} />
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                  <span className={cn("text-sm font-bold", color)}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Env vars status */}
          <div className="glass rounded-[16px] p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500">Configuration</p>
            {[
              { label: "Resend API",   env: "RESEND_API_KEY",      ok: true  },
              { label: "WA Token",     env: "WHATSAPP_TOKEN",      ok: false },
              { label: "WA Phone ID",  env: "WHATSAPP_PHONE_ID",   ok: false },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{label}</span>
                {ok ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={11} /> Configuré</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-500"><AlertCircle size={11} /> Manquant</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Send history */}
      {history.length > 0 && (
        <div className="glass rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-slate-300">Historique des envois</p>
          </div>
          <div className="divide-y divide-white/5">
            {history.map((h) => (
              <div key={h.id} className="px-6 py-4 flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0",
                  h.type === "email" ? "bg-indigo-500/10" : "bg-emerald-500/10"
                )}>
                  {h.type === "email" ? <Mail size={14} className="text-indigo-400" /> : <MessageCircle size={14} className="text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{h.subject || h.message.slice(0, 50)}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600">
                    <span>{TARGET_OPTIONS.find(t => t.value === h.target)?.label}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{h.sentAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  <span className="text-emerald-400 font-semibold">✓ {h.result.sent}</span>
                  {h.result.failed > 0 && <span className="text-red-400">✗ {h.result.failed}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
