"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Flame, Plus, Edit2, CheckCircle, XCircle, Eye,
  Play, Pause, Trash2, Calendar, Users, Trophy,
  Tag, Hash, ChevronDown, ChevronUp, RefreshCw, AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type ChallengeStatus = "DRAFT" | "ACTIVE" | "VOTING" | "COMPLETED";
type ChallengeType   = "FREE" | "SPONSORED";

type Challenge = {
  id:          string;
  title:       string;
  category:    string;
  type:        ChallengeType;
  status:      ChallengeStatus;
  prizeAmount: number | null;
  startDate:   string;
  endDate:     string;
  description: string;
  rules:       string;
  _count:      { submissions: number };
  brand?:      { companyName: string } | null;
};

type Submission = {
  id:        string;
  videoUrl:  string | null;
  caption:   string | null;
  status:    "PENDING" | "APPROVED" | "REJECTED";
  score:     number;
  createdAt: string;
  creator:   { id: string; name: string | null; image: string | null };
  votes:     Array<{ value: number }>;
};

const STATUS_META: Record<ChallengeStatus, { label: string; variant: "success" | "primary" | "warning" | "default" }> = {
  DRAFT:     { label: "Brouillon",       variant: "default"  },
  ACTIVE:    { label: "Actif",           variant: "success"  },
  VOTING:    { label: "Vote en cours",   variant: "primary"  },
  COMPLETED: { label: "Terminé",         variant: "warning"  },
};

const CATEGORIES = ["Humour", "Food", "Beauté", "Lifestyle", "Tech", "Sport", "Mode", "Gaming", "Voyage"];

type FormState = {
  title: string; category: string; type: ChallengeType;
  description: string; rules: string; prizeAmount: string;
  startDate: string; endDate: string;
};

const EMPTY_FORM: FormState = {
  title: "", category: "Humour", type: "FREE", description: "",
  rules: "Utilise le hashtag obligatoire.", prizeAmount: "",
  startDate: "", endDate: "",
};

export default function AdminChallengesContent() {
  const [challenges,    setChallenges]    = useState<Challenge[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [modal,         setModal]         = useState<"create" | "edit" | "submissions" | null>(null);
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [viewSubsFor,   setViewSubsFor]   = useState<string | null>(null);
  const [submissions,   setSubmissions]   = useState<Submission[]>([]);
  const [subsLoading,   setSubsLoading]   = useState(false);
  const [form,          setForm]          = useState<FormState>(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/challenges?limit=100");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json() as { challenges: Challenge[] };
      setChallenges(data.challenges);
    } catch (e) {
      setError("Impossible de charger les défis.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loadSubmissions(challengeId: string) {
    setSubsLoading(true);
    setSubmissions([]);
    try {
      const res  = await fetch(`/api/admin/challenges/${challengeId}`);
      if (!res.ok) throw new Error();
      const data = await res.json() as { challenge: { submissions: Submission[] } };
      setSubmissions(data.challenge.submissions);
    } catch {
      toast.error("Impossible de charger les soumissions.");
    } finally {
      setSubsLoading(false);
    }
  }

  function openCreate() { setForm(EMPTY_FORM); setEditingId(null); setModal("create"); }

  function openEdit(c: Challenge) {
    setForm({
      title: c.title, category: c.category, type: c.type,
      description: c.description, rules: c.rules,
      prizeAmount: c.prizeAmount ? String(c.prizeAmount) : "",
      startDate: c.startDate.slice(0, 10), endDate: c.endDate.slice(0, 10),
    });
    setEditingId(c.id);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Titre et description requis");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title:       form.title,
        category:    form.category,
        type:        form.type,
        description: form.description,
        rules:       form.rules || "Utilise le hashtag obligatoire.",
        startDate:   form.startDate || new Date().toISOString(),
        endDate:     form.endDate   || new Date(Date.now() + 7 * 86400000).toISOString(),
        prizeAmount: form.prizeAmount ? Number(form.prizeAmount) : undefined,
      };

      if (editingId) {
        const res = await fetch(`/api/admin/challenges/${editingId}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Défi mis à jour !");
      } else {
        const res = await fetch("/api/challenges", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Défi créé !");
      }
      setModal(null);
      load();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: ChallengeStatus) {
    try {
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setChallenges((cs) => cs.map((c) => c.id === id ? { ...c, status } : c));
      toast.success(`Statut → ${STATUS_META[status].label}`);
    } catch {
      toast.error("Erreur lors du changement de statut.");
    }
  }

  async function deleteChallenge(id: string) {
    try {
      const res = await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setChallenges((cs) => cs.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      toast.success("Défi supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  async function moderateSubmission(challengeId: string, submissionId: string, status: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ submissionId, status }),
      });
      if (!res.ok) throw new Error();
      setSubmissions((ss) => ss.map((s) => s.id === submissionId ? { ...s, status } : s));
      toast.success(status === "APPROVED" ? "Soumission approuvée" : "Soumission rejetée");
    } catch {
      toast.error("Erreur lors de la modération.");
    }
  }

  const activeCount = challenges.filter(c => c.status === "ACTIVE").length;
  const totalSubs   = challenges.reduce((a, c) => a + c._count.submissions, 0);

  return (
    <div className="max-w-6xl space-y-6" onClick={() => setDeleteConfirm(null)}>
      <PageHeader
        title="Défis"
        subtitle={loading ? "Chargement..." : `${challenges.length} défis · ${activeCount} actifs · ${totalSubs} soumissions`}
        icon={Flame}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <Button variant="primary" onClick={openCreate}>
              <Plus size={15} /> Nouveau défi
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["DRAFT", "ACTIVE", "VOTING", "COMPLETED"] as ChallengeStatus[]).map((s) => {
          const count = challenges.filter(c => c.status === s).length;
          return (
            <div key={s} className="glass rounded-[14px] p-4 text-center">
              <p className="text-2xl font-heading font-bold text-slate-100">{count}</p>
              <Badge variant={STATUS_META[s].variant} className="mt-1">{STATUS_META[s].label}</Badge>
            </div>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="glass rounded-[20px] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700/60 rounded w-48" />
                <div className="h-2.5 bg-slate-700/40 rounded w-72" />
              </div>
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState emoji="🔥" title="Aucun défi" description="Crée le premier défi" action={{ label: "Créer un défi", onClick: openCreate }} />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          <div className="divide-y divide-white/5">
            {challenges.map((c) => {
              const statusMeta = STATUS_META[c.status];
              const isOpen     = expanded === c.id;
              return (
                <div key={c.id} className={cn("transition-colors", isOpen ? "bg-white/[0.02]" : "hover:bg-white/[0.01]")}>
                  <div className="flex items-center gap-4 px-6 py-4">
                    <button onClick={() => setExpanded(isOpen ? null : c.id)} className="flex-shrink-0 text-slate-600 hover:text-slate-300">
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-200">{c.title}</p>
                        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                        {c.type === "SPONSORED" && <Badge variant="warning">Sponsorisé</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600 flex-wrap">
                        <span><Tag size={10} className="inline mr-0.5" />{c.category}</span>
                        <span><Users size={10} className="inline mr-0.5" />{c._count.submissions} soumissions</span>
                        {c.prizeAmount && <span className="text-amber-400"><Trophy size={10} className="inline mr-0.5" />{formatMAD(c.prizeAmount)}</span>}
                        {c.brand && <span className="text-pink-400">{c.brand.companyName}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {c.status === "DRAFT"     && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "ACTIVE")}><Play size={12} /> Activer</Button>}
                      {c.status === "ACTIVE"    && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "VOTING")}><Pause size={12} /> Voter</Button>}
                      {c.status === "VOTING"    && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "COMPLETED")}><CheckCircle size={12} /> Terminer</Button>}
                      {c.status === "COMPLETED" && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "DRAFT")}><Edit2 size={12} /> Réouvrir</Button>}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit2 size={13} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setViewSubsFor(c.id); loadSubmissions(c.id); setModal("submissions"); }}>
                        <Eye size={13} />
                      </Button>
                      <div className="relative">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(deleteConfirm === c.id ? null : c.id); }}>
                          <Trash2 size={13} className="text-red-400" />
                        </Button>
                        {deleteConfirm === c.id && (
                          <div className="absolute right-0 top-9 z-20 w-52 glass rounded-[12px] border border-red-500/20 p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs text-slate-300 mb-3">Supprimer &ldquo;{c.title}&rdquo; ?</p>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                              <Button variant="danger" size="sm" className="flex-1" onClick={() => deleteChallenge(c.id)}>Supprimer</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-16 pb-4 space-y-2">
                      <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span><Calendar size={10} className="inline mr-0.5" />
                          Du {new Date(c.startDate).toLocaleDateString("fr-FR")} au {new Date(c.endDate).toLocaleDateString("fr-FR")}
                        </span>
                        {c.brand && <span>Sponsor : <span className="text-pink-400">{c.brand.companyName}</span></span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative glass rounded-[24px] p-7 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-5">
              {modal === "edit" ? "Modifier le défi" : "Nouveau défi"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Titre</label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre du défi" className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all">
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as ChallengeType }))} className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all">
                    <option value="FREE">Gratuit</option>
                    <option value="SPONSORED">Sponsorisé</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Description du défi..." className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Règles</label>
                <textarea value={form.rules} onChange={(e) => setForm(f => ({ ...f, rules: e.target.value }))} rows={2} placeholder="Règles du défi..." className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
              </div>
              {form.type === "SPONSORED" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Prize pool (MAD)</label>
                  <input type="number" value={form.prizeAmount} onChange={(e) => setForm(f => ({ ...f, prizeAmount: e.target.value }))} placeholder="2000" className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Date de début</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Date de fin</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button variant="primary" className="flex-1" loading={saving} onClick={handleSave}>
                {modal === "edit" ? "Enregistrer" : "Créer le défi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions modal */}
      {modal === "submissions" && viewSubsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative glass rounded-[24px] p-7 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Soumissions</h3>
            <p className="text-slate-500 text-sm mb-5">{challenges.find(c => c.id === viewSubsFor)?.title}</p>
            {subsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-sm rounded-[12px] p-4 h-14 animate-pulse bg-slate-700/30" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-center text-slate-600 text-sm py-8">Aucune soumission pour ce défi.</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((s, i) => {
                  const totalVotes = s.votes.reduce((a, v) => a + v.value, 0);
                  return (
                    <div key={s.id} className="flex items-center gap-4 glass-sm rounded-[12px] p-4">
                      <span className="text-xs font-bold text-slate-600 w-5 flex-shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200">{s.creator.name ?? s.creator.id}</p>
                        {s.videoUrl && (
                          <a href={s.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate block">{s.videoUrl}</a>
                        )}
                        {s.caption && <p className="text-xs text-slate-500 truncate">{s.caption}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-amber-400 font-bold">{totalVotes} votes</span>
                        <Badge variant={s.status === "APPROVED" ? "success" : s.status === "REJECTED" ? "error" : "warning"}>
                          {s.status === "APPROVED" ? "Approuvée" : s.status === "REJECTED" ? "Rejetée" : "En attente"}
                        </Badge>
                        {s.status === "PENDING" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => moderateSubmission(viewSubsFor, s.id, "APPROVED")}
                              className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => moderateSubmission(viewSubsFor, s.id, "REJECTED")}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Button variant="secondary" className="w-full mt-5" onClick={() => setModal(null)}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
}
