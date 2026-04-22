"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Shield, Save, Eye, EyeOff, ExternalLink,
  CheckCircle, RefreshCw, Clock, RotateCcw,
} from "lucide-react";
import PageHeader from "@/components/dashboard/page-header";
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/page-content";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "terms" | "privacy";

const TABS: Array<{ id: Tab; label: string; icon: typeof FileText; accent: string; publicPath: string }> = [
  { id: "terms",   label: "CGU",              icon: FileText, accent: "indigo", publicPath: "/terms"   },
  { id: "privacy", label: "Confidentialité",  icon: Shield,   accent: "pink",  publicPath: "/privacy" },
];

type PageData = { title: string; content: string; updatedAt: string | null };

export default function AdminContentEditor() {
  const [activeTab,  setActiveTab]  = useState<Tab>("terms");
  const [pages,      setPages]      = useState<Record<Tab, PageData>>({
    terms:   { title: PAGE_DEFAULTS.terms.title,   content: PAGE_DEFAULTS.terms.content,   updatedAt: null },
    privacy: { title: PAGE_DEFAULTS.privacy.title, content: PAGE_DEFAULTS.privacy.content, updatedAt: null },
  });
  const [loading,    setLoading]    = useState<Record<Tab, boolean>>({ terms: true, privacy: true });
  const [saving,     setSaving]     = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Local edits buffered per tab
  const [edits, setEdits] = useState<Record<Tab, { title: string; content: string }>>({
    terms:   { title: PAGE_DEFAULTS.terms.title,   content: PAGE_DEFAULTS.terms.content },
    privacy: { title: PAGE_DEFAULTS.privacy.title, content: PAGE_DEFAULTS.privacy.content },
  });

  const fetchPage = useCallback(async (slug: Tab) => {
    setLoading((l) => ({ ...l, [slug]: true }));
    try {
      const res  = await fetch(`/api/admin/content/${slug}`);
      const data = await res.json() as PageData;
      setPages((p)  => ({ ...p, [slug]: data }));
      setEdits((e)  => ({ ...e, [slug]: { title: data.title, content: data.content } }));
    } catch { /* non-fatal */ }
    finally { setLoading((l) => ({ ...l, [slug]: false })); }
  }, []);

  useEffect(() => {
    fetchPage("terms");
    fetchPage("privacy");
  }, [fetchPage]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${activeTab}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(edits[activeTab]),
      });
      const data = await res.json() as PageData & { error?: string };
      if (!res.ok) { toast.error(data.error ?? "Erreur lors de la sauvegarde"); return; }

      setPages((p)  => ({ ...p, [activeTab]: data }));
      setEdits((e)  => ({ ...e, [activeTab]: { title: data.title, content: data.content } }));
      toast.success("Page sauvegardée avec succès");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    const defaults = PAGE_DEFAULTS[activeTab];
    setEdits((e) => ({ ...e, [activeTab]: { title: defaults.title, content: defaults.content } }));
    toast("Contenu réinitialisé (non sauvegardé)", { icon: "↩️" });
  }

  const current     = edits[activeTab];
  const saved       = pages[activeTab];
  const isDirty     = current.content !== saved.content || current.title !== saved.title;
  const tab         = TABS.find((t) => t.id === activeTab)!;
  const isLoading   = loading[activeTab];

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Pages légales"
        subtitle="Modifier les CGU et la Politique de Confidentialité"
        icon={FileText}
        action={
          <a
            href={tab.publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <ExternalLink size={13} />
            Voir la page
          </a>
        }
      />

      {/* Tab selector */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const Icon     = t.icon;
          const isActive = activeTab === t.id;
          const dirty    = edits[t.id].content !== pages[t.id].content || edits[t.id].title !== pages[t.id].title;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-sm font-medium border transition-all",
                isActive
                  ? t.accent === "indigo"
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                    : "bg-pink-500/15 border-pink-500/30 text-pink-300"
                  : "border-white/[0.06] text-slate-400 hover:bg-white/5 hover:border-white/10"
              )}
            >
              <Icon size={14} />
              {t.label}
              {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Editor panel ── */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6 space-y-5">

          {/* Title field */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Titre de la page</label>
            <input
              value={current.title}
              onChange={(e) => setEdits((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], title: e.target.value } }))}
              disabled={isLoading}
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-40"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Contenu HTML</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? "Masquer aperçu" : "Aperçu"}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
              >
                <RotateCcw size={12} />
                Réinitialiser
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-80 bg-slate-800/40 rounded-[12px] animate-pulse" />
          ) : showPreview ? (
            /* Live HTML preview */
            <div
              className="legal-content min-h-80 bg-slate-900/40 border border-white/[0.06] rounded-[12px] p-6 overflow-auto max-h-[600px]"
              dangerouslySetInnerHTML={{ __html: current.content }}
            />
          ) : (
            /* HTML textarea editor */
            <textarea
              value={current.content}
              onChange={(e) => setEdits((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], content: e.target.value } }))}
              rows={20}
              spellCheck={false}
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] px-4 py-3 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-y font-mono leading-relaxed"
              placeholder="<h2>Section</h2><p>Contenu...</p>"
            />
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-700">{current.content.length.toLocaleString()} caractères</span>
            {isDirty && <span className="text-[11px] text-amber-500">Modifications non sauvegardées</span>}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty || !current.content.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={15} />
                Sauvegarder les modifications
              </>
            )}
          </button>
        </div>

        {/* ── Sidebar info ── */}
        <div className="space-y-4">

          {/* Page status */}
          <div className="glass rounded-[16px] p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</p>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-[10px] border",
              saved.updatedAt
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            )}>
              {saved.updatedAt ? (
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <RefreshCw size={16} className="text-amber-400 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {saved.updatedAt ? "Contenu personnalisé" : "Contenu par défaut"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {saved.updatedAt ? "Modifié par un admin" : "Jamais modifié"}
                </p>
              </div>
            </div>
            {saved.updatedAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Clock size={10} />
                Mis à jour le {new Date(saved.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
            )}
          </div>

          {/* Pages list */}
          <div className="glass rounded-[16px] p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pages légales</p>
            {TABS.map((t) => {
              const Icon         = t.icon;
              const isEditedInDB = !!pages[t.id].updatedAt;
              return (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={t.accent === "indigo" ? "text-indigo-400" : "text-pink-400"} />
                    <span className="text-xs text-slate-400">{t.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      isEditedInDB
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-700/60 text-slate-500"
                    )}>
                      {isEditedInDB ? "Modifiée" : "Défaut"}
                    </span>
                    <a
                      href={t.publicPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* HTML tips */}
          <div className="glass rounded-[16px] p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balises HTML utiles</p>
            {[
              { tag: "<h2>",      desc: "Titre de section" },
              { tag: "<p>",       desc: "Paragraphe" },
              { tag: "<ul><li>",  desc: "Liste à puces" },
              { tag: "<strong>",  desc: "Texte en gras" },
              { tag: "<a href=…>", desc: "Lien cliquable" },
            ].map(({ tag, desc }) => (
              <div key={tag} className="flex items-center justify-between gap-2">
                <code className="text-[11px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{tag}</code>
                <span className="text-[11px] text-slate-600">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .legal-content h2 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #e2e8f0;
          margin-top: 2rem;
          margin-bottom: 0.625rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .legal-content p {
          color: #94a3b8;
          font-size: 0.875rem;
          line-height: 1.75;
          margin-bottom: 0.875rem;
        }
        .legal-content ul { list-style: none; padding: 0; margin: 0 0 0.875rem 0; }
        .legal-content ul li {
          color: #94a3b8;
          font-size: 0.875rem;
          line-height: 1.75;
          padding-left: 1.25rem;
          position: relative;
          margin-bottom: 0.25rem;
        }
        .legal-content ul li::before { content: "—"; position: absolute; left: 0; color: #6366f1; font-weight: 700; }
        .legal-content strong { color: #cbd5e1; font-weight: 600; }
        .legal-content a { color: #818cf8; text-decoration: underline; text-underline-offset: 3px; }
      `}</style>
    </div>
  );
}
