"use client";

import { useState } from "react";
import {
  Flame, Plus, Edit2, CheckCircle, XCircle, Eye,
  Play, Pause, Trash2, Calendar, Users, Trophy,
  Tag, Hash, ChevronDown, ChevronUp, AlertCircle,
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
  id: string;
  title: string;
  category: string;
  type: ChallengeType;
  status: ChallengeStatus;
  sponsor?: string;
  prizeAmount?: number;
  startDate: string;
  endDate: string;
  submissionsCount: number;
  participantsCount: number;
  description: string;
  hashtag: string;
};

const INITIAL_CHALLENGES: Challenge[] = [
  { id: "c1", title: "Humour du Ramadan",          category: "Humour",    type: "FREE",      status: "ACTIVE",    startDate: "7 Avr 2025",  endDate: "14 Avr 2025", submissionsCount: 89, participantsCount: 74, description: "Fais rire la communauté avec ton humour du Ramadan.",        hashtag: "HumourRamadan2025" },
  { id: "c2", title: "Street Food Casablanca",      category: "Food",      type: "FREE",      status: "ACTIVE",    startDate: "10 Avr 2025", endDate: "17 Avr 2025", submissionsCount: 42, participantsCount: 38, description: "Explore et documente la street food de Casablanca.",          hashtag: "StreetFoodCasa" },
  { id: "c3", title: "Beauté Naturelle Maroc",      category: "Beauté",    type: "SPONSORED", status: "ACTIVE",    startDate: "12 Avr 2025", endDate: "19 Avr 2025", submissionsCount: 56, participantsCount: 49, description: "Valorise la beauté naturelle marocaine.", sponsor: "Zara Beauty", prizeAmount: 3000, hashtag: "BeauteNaturelleMA" },
  { id: "c4", title: "Tech en Darija",              category: "Tech",      type: "FREE",      status: "VOTING",    startDate: "1 Avr 2025",  endDate: "8 Avr 2025",  submissionsCount: 33, participantsCount: 29, description: "Explique une notion tech en darija marocain.",               hashtag: "TechDarija" },
  { id: "c5", title: "Lifestyle Printemps",         category: "Lifestyle", type: "SPONSORED", status: "COMPLETED", startDate: "20 Mar 2025", endDate: "27 Mar 2025", submissionsCount: 71, participantsCount: 65, description: "Capture le lifestyle printanier.", sponsor: "Marjane Market", prizeAmount: 2000, hashtag: "LifestylePrintemps" },
  { id: "c6", title: "Gaming Maroc Challenge",      category: "Gaming",    type: "FREE",      status: "DRAFT",     startDate: "20 Avr 2025", endDate: "27 Avr 2025", submissionsCount: 0,  participantsCount: 0,  description: "Les meilleurs moments de gaming marocain.",                  hashtag: "GamingMaroc2025" },
];

const STATUS_META: Record<ChallengeStatus, { label: string; variant: "success" | "primary" | "warning" | "default" }> = {
  DRAFT:     { label: "Brouillon",   variant: "default" },
  ACTIVE:    { label: "Actif",       variant: "success" },
  VOTING:    { label: "Vote en cours", variant: "primary" },
  COMPLETED: { label: "Terminé",     variant: "warning" },
};

const CATEGORIES = ["Humour", "Food", "Beauté", "Lifestyle", "Tech", "Sport", "Mode", "Gaming", "Voyage"];

type ModalMode = "create" | "edit" | "submissions" | null;

type FormState = {
  title: string; category: string; type: ChallengeType;
  description: string; hashtag: string; prizeAmount: string;
  sponsor: string; startDate: string; endDate: string;
};

const EMPTY_FORM: FormState = {
  title: "", category: "Humour", type: "FREE", description: "",
  hashtag: "", prizeAmount: "", sponsor: "", startDate: "", endDate: "",
};

const MOCK_SUBMISSIONS = [
  { id: "s1", creator: "@yassine_create", url: "https://tiktok.com/demo1", votes: 142, status: "APPROVED" as const },
  { id: "s2", creator: "@sarabeauty",     url: "https://tiktok.com/demo2", votes: 98,  status: "APPROVED" as const },
  { id: "s3", creator: "@techmaroc",      url: "https://tiktok.com/demo3", votes: 76,  status: "PENDING"  as const },
  { id: "s4", creator: "@fatima_food",    url: "https://tiktok.com/demo4", votes: 61,  status: "APPROVED" as const },
  { id: "s5", creator: "@driss_gamer",    url: "https://tiktok.com/demo5", votes: 23,  status: "REJECTED" as const },
];

export default function AdminChallengesContent() {
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [modal, setModal]           = useState<ModalMode>(null);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState<string | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModal("create");
  }

  function openEdit(c: Challenge) {
    setForm({
      title: c.title, category: c.category, type: c.type,
      description: c.description, hashtag: c.hashtag,
      prizeAmount: c.prizeAmount ? String(c.prizeAmount) : "",
      sponsor: c.sponsor ?? "",
      startDate: c.startDate, endDate: c.endDate,
    });
    setEditingId(c.id);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim() || !form.hashtag.trim()) {
      toast.error("Titre, description et hashtag requis");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (editingId) {
      setChallenges((cs) => cs.map((c) => c.id === editingId ? {
        ...c, title: form.title, category: form.category, type: form.type,
        description: form.description, hashtag: form.hashtag,
        prizeAmount: form.prizeAmount ? Number(form.prizeAmount) : undefined,
        sponsor: form.sponsor || undefined,
        startDate: form.startDate, endDate: form.endDate,
      } : c));
      toast.success("Défi mis à jour !");
    } else {
      const newChallenge: Challenge = {
        id: `c${Date.now()}`, title: form.title, category: form.category,
        type: form.type, status: "DRAFT", description: form.description,
        hashtag: form.hashtag, startDate: form.startDate, endDate: form.endDate,
        submissionsCount: 0, participantsCount: 0,
        prizeAmount: form.prizeAmount ? Number(form.prizeAmount) : undefined,
        sponsor: form.sponsor || undefined,
      };
      setChallenges((cs) => [newChallenge, ...cs]);
      toast.success("Défi créé en brouillon !");
    }
    setLoading(false);
    setModal(null);
  }

  function changeStatus(id: string, status: ChallengeStatus) {
    setChallenges((cs) => cs.map((c) => c.id === id ? { ...c, status } : c));
    toast.success(`Statut → ${STATUS_META[status].label}`);
  }

  function deleteChallenge(id: string) {
    setChallenges((cs) => cs.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    toast.success("Défi supprimé.");
  }

  const activeCount    = challenges.filter(c => c.status === "ACTIVE").length;
  const totalSubs      = challenges.reduce((a, c) => a + c.submissionsCount, 0);

  return (
    <div className="max-w-6xl space-y-6" onClick={() => setDeleteConfirm(null)}>
      <PageHeader
        title="Défis"
        subtitle={`${challenges.length} défis · ${activeCount} actifs · ${totalSubs} soumissions`}
        icon={Flame}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={15} /> Nouveau défi
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["DRAFT", "ACTIVE", "VOTING", "COMPLETED"] as ChallengeStatus[]).map((s) => {
          const count = challenges.filter(c => c.status === s).length;
          const meta  = STATUS_META[s];
          return (
            <div key={s} className="glass rounded-[14px] p-4 text-center">
              <p className="text-2xl font-heading font-bold text-slate-100">{count}</p>
              <Badge variant={meta.variant} className="mt-1">{meta.label}</Badge>
            </div>
          );
        })}
      </div>

      {/* Challenges list */}
      {challenges.length === 0 ? (
        <EmptyState emoji="🔥" title="Aucun défi" description="Crée le premier défi" action={{ label: "Créer un défi", onClick: openCreate }} />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          <div className="divide-y divide-white/5">
            {challenges.map((c) => {
              const statusMeta = STATUS_META[c.status];
              const isOpen     = expanded === c.id;

              return (
                <div key={c.id} className={cn("transition-colors", isOpen ? "bg-white/3" : "hover:bg-white/2")}>
                  {/* Row */}
                  <div className="flex items-center gap-4 px-6 py-4">
                    {/* Expand */}
                    <button onClick={() => setExpanded(isOpen ? null : c.id)} className="flex-shrink-0 text-slate-600 hover:text-slate-300">
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-200">{c.title}</p>
                        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                        {c.type === "SPONSORED" && <Badge variant="warning">Sponsorisé</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600">
                        <span><Tag size={10} className="inline mr-0.5" />{c.category}</span>
                        <span><Hash size={10} className="inline mr-0.5" />{c.hashtag}</span>
                        <span><Users size={10} className="inline mr-0.5" />{c.participantsCount} participants</span>
                        <span><Eye size={10} className="inline mr-0.5" />{c.submissionsCount} soumissions</span>
                        {c.prizeAmount && <span className="text-amber-400"><Trophy size={10} className="inline mr-0.5" />{formatMAD(c.prizeAmount)}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Status transitions */}
                      {c.status === "DRAFT"     && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "ACTIVE")}><Play size={12} /> Activer</Button>}
                      {c.status === "ACTIVE"    && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "VOTING")}><Pause size={12} /> Voter</Button>}
                      {c.status === "VOTING"    && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "COMPLETED")}><CheckCircle size={12} /> Terminer</Button>}
                      {c.status === "COMPLETED" && <Button variant="ghost" size="sm" onClick={() => changeStatus(c.id, "DRAFT")}><Edit2 size={12} /> Réouvrir</Button>}

                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit2 size={13} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setViewSubmissionsFor(c.id); setModal("submissions"); }}><Eye size={13} /></Button>
                      <div className="relative">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(deleteConfirm === c.id ? null : c.id); }}>
                          <Trash2 size={13} className="text-red-400" />
                        </Button>
                        {deleteConfirm === c.id && (
                          <div className="absolute right-0 top-9 z-20 w-52 glass rounded-[12px] border border-red-500/20 p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs text-slate-300 mb-3">Supprimer "{c.title}" ?</p>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                              <Button variant="danger" size="sm" className="flex-1" onClick={() => deleteChallenge(c.id)}>Supprimer</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-16 pb-4 space-y-2">
                      <p className="text-xs text-slate-500">{c.description}</p>
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span><Calendar size={10} className="inline mr-0.5" />Du {c.startDate} au {c.endDate}</span>
                        {c.sponsor && <span>Sponsor : <span className="text-pink-400">{c.sponsor}</span></span>}
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
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Titre</label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre du défi" className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              {/* Category + Type row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as ChallengeType }))} className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all">
                    <option value="FREE">Gratuit</option>
                    <option value="SPONSORED">Sponsorisé</option>
                  </select>
                </div>
              </div>
              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Description du défi..." className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
              </div>
              {/* Hashtag */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Hashtag obligatoire</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">#</span>
                  <input value={form.hashtag} onChange={(e) => setForm(f => ({ ...f, hashtag: e.target.value.replace("#", "").replace(/\s/g, "") }))} placeholder="MonDéfi2025" className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] pl-7 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
              </div>
              {/* Sponsor + Prize (conditional) */}
              {form.type === "SPONSORED" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Sponsor</label>
                    <input value={form.sponsor} onChange={(e) => setForm(f => ({ ...f, sponsor: e.target.value }))} placeholder="Nom de la marque" className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Prize pool (MAD)</label>
                    <input type="number" value={form.prizeAmount} onChange={(e) => setForm(f => ({ ...f, prizeAmount: e.target.value }))} placeholder="2000" className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                </div>
              )}
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Date de début</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Date de fin</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button variant="primary" className="flex-1" loading={loading} onClick={handleSave}>
                {modal === "edit" ? "Enregistrer" : "Créer le défi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions modal */}
      {modal === "submissions" && viewSubmissionsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative glass rounded-[24px] p-7 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Soumissions</h3>
            <p className="text-slate-500 text-sm mb-5">{challenges.find(c => c.id === viewSubmissionsFor)?.title}</p>
            <div className="space-y-2">
              {MOCK_SUBMISSIONS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 glass-sm rounded-[12px] p-4">
                  <span className="text-xs font-bold text-slate-600 w-5 flex-shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{s.creator}</p>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate block">{s.url}</a>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-amber-400 font-bold">{s.votes} votes</span>
                    <Badge variant={s.status === "APPROVED" ? "success" : s.status === "REJECTED" ? "error" : "warning"}>
                      {s.status === "APPROVED" ? "Approuvée" : s.status === "REJECTED" ? "Rejetée" : "En attente"}
                    </Badge>
                    {s.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button onClick={() => toast.success("Soumission approuvée")} className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors"><CheckCircle size={14} /></button>
                        <button onClick={() => toast("Soumission rejetée")} className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"><XCircle size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-5" onClick={() => setModal(null)}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
}
