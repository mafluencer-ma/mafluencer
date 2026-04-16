import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Trophy,
  TrendingUp,
  Users,
  Award,
  ShieldCheck,
  Zap,
  Star,
  Check,
  Play,
  Target,
  BarChart3,
  Briefcase,
  Video,
  Sparkles,
  ChevronRight,
  Globe,
} from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Mafluencer — La plateforme qui récompense les vrais créateurs",
  description:
    "Relève des défis créatifs hebdomadaires, construis ton Mafluencer Score et décroche des missions payantes avec les meilleures marques marocaines.",
};

const features = [
  {
    icon:     Flame,
    title:    "Défis hebdomadaires",
    desc:     "Chaque semaine, de nouveaux défis créatifs pour prouver ton talent et gagner des points.",
    gradient: "from-orange-500 to-pink-500",
    bg:       "bg-orange-500/10",
    border:   "border-orange-500/20",
  },
  {
    icon:     Trophy,
    title:    "Mafluencer Score",
    desc:     "Un score basé sur tes vraies performances : engagement, régularité, votes communautaires.",
    gradient: "from-indigo-500 to-purple-500",
    bg:       "bg-indigo-500/10",
    border:   "border-indigo-500/20",
  },
  {
    icon:     TrendingUp,
    title:    "Missions payantes",
    desc:     "Les brands te contactent directement sur la base de ton score — pas de followers cachés.",
    gradient: "from-emerald-500 to-cyan-500",
    bg:       "bg-emerald-500/10",
    border:   "border-emerald-500/20",
  },
];

const steps = [
  {
    num:   "01",
    icon:  Video,
    title: "Crée ton compte",
    desc:  "Inscription gratuite en 2 minutes. Connecte ton TikTok ou Instagram et complète ton profil creator.",
  },
  {
    num:   "02",
    icon:  Target,
    title: "Relève les défis",
    desc:  "Poste ton contenu sur les réseaux, soumets le lien, et la communauté vote pour les meilleurs.",
  },
  {
    num:   "03",
    icon:  Briefcase,
    title: "Décroche des missions",
    desc:  "Plus ton score est élevé, plus les brands te contactent. Négocie, livre, et encaisse en MAD.",
  },
];

const levels = [
  { label: "Rookie",  range: "0–200",    icon: Star,      gradient: "from-slate-500 to-slate-400" },
  { label: "Rising",  range: "200–400",  icon: TrendingUp, gradient: "from-green-500 to-emerald-400" },
  { label: "Star",    range: "400–600",  icon: Sparkles,  gradient: "from-blue-500 to-cyan-400" },
  { label: "Elite",   range: "600–800",  icon: Zap,       gradient: "from-purple-500 to-pink-400" },
  { label: "Legend",  range: "800–1000", icon: Trophy,    gradient: "from-yellow-500 to-orange-400" },
];

const scoreBreakdown = [
  { icon: Target,    label: "+50 pts",  desc: "par défi relevé" },
  { icon: Users,     label: "+100 pts", desc: "votes communauté" },
  { icon: BarChart3, label: "+80 pts",  desc: "engagement réel" },
  { icon: Zap,       label: "+30 pts",  desc: "mission livrée" },
];

const testimonials = [
  {
    name:     "Yassine B.",
    city:     "Casablanca",
    level:    "Elite",
    avatar:   "YB",
    score:    720,
    text:     "En 3 mois j'ai décroché 4 missions payantes. Le score Mafluencer parle pour moi — les brands font confiance aux chiffres.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name:     "Samia L.",
    city:     "Rabat",
    level:    "Star",
    avatar:   "SL",
    score:    510,
    text:     "Enfin une plateforme qui valorise la qualité, pas juste le nombre de followers. J'ai 12K abonnés mais un taux d'engagement de 8%.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name:     "Amine K.",
    city:     "Marrakech",
    level:    "Rising",
    avatar:   "AK",
    score:    340,
    text:     "Les défis m'ont forcé à publier régulièrement. Mon engagement a doublé en un mois. Je progresse vite.",
    gradient: "from-green-500 to-emerald-500",
  },
];

const stats = [
  { value: "2 400+",   label: "Creators actifs",     icon: Users },
  { value: "180+",     label: "Défis lancés",         icon: Flame },
  { value: "340+",     label: "Missions complétées",  icon: Award },
  { value: "1.2M MAD", label: "Versés aux creators",  icon: TrendingUp },
];

const brandMetrics = [
  { value: "8.3%",  label: "Engagement moyen",  icon: TrendingUp },
  { value: "48h",   label: "Délai de réponse",   icon: Zap },
  { value: "96%",   label: "Missions livrées",   icon: Check },
  { value: "4.8/5", label: "Note moyenne",       icon: Star },
];

export default function LandingPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-b from-indigo-600/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
              backgroundSize:  "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Nouvelle vague de défis disponibles — Rejoins maintenant
            <ChevronRight size={13} className="text-indigo-500" />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold text-slate-100 leading-[1.08] tracking-tight mb-6">
            La plateforme qui{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              récompense
            </span>
            <br />
            les vrais créateurs
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Relève des défis créatifs hebdomadaires, construis ton{" "}
            <span className="text-indigo-300 font-semibold">Mafluencer Score</span>, et connecte-toi
            aux meilleures marques marocaines qui paient sur la{" "}
            <span className="text-pink-300 font-semibold">performance réelle</span>.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/auth/register"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
            >
              Créer mon compte — c&apos;est gratuit
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/explorer"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-slate-300 font-medium text-base hover:bg-white/[0.08] hover:border-white/[0.18] hover:text-white transition-all duration-200"
            >
              <Play size={15} className="text-indigo-400" />
              Voir le classement
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            {[
              { icon: ShieldCheck, text: "Aucune carte requise" },
              { icon: Zap,         text: "Setup en 2 minutes" },
              { icon: Globe,       text: "Gratuit pour les creators" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon size={13} className="text-slate-600" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <ScrollReveal key={label} delay={i * 80}>
              <div className="bg-[#1E293B]/50 border border-white/[0.06] rounded-2xl p-5 text-center hover:border-white/[0.12] hover:bg-[#1E293B]/80 transition-all duration-300 group">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <p className="text-2xl font-heading font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
                Pourquoi Mafluencer ?
              </p>
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-slate-100 tracking-tight">
                Tout ce dont tu as besoin{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  pour briller
                </span>
              </h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
                Une plateforme construite pour les créateurs marocains, par des gens qui comprennent la scène locale.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, gradient, bg, border }, i) => (
              <ScrollReveal key={title} delay={i * 100} direction="up">
                <div className="relative bg-[#1E293B]/50 border border-white/[0.06] rounded-2xl p-8 overflow-hidden group hover:border-white/[0.12] transition-all duration-300 h-full">
                  <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${gradient} opacity-[0.06] rounded-full blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`} />

                  <div className={`relative w-12 h-12 rounded-2xl ${bg} border ${border} flex items-center justify-center mb-6`}>
                    <Icon size={22} className="text-white" style={{ filter: `drop-shadow(0 0 6px rgba(99,102,241,0.6))` }} />
                  </div>

                  <h3 className="font-heading font-bold text-slate-100 text-xl mb-3 tracking-tight">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>

                  <div className={`mt-7 h-0.5 w-10 bg-gradient-to-r ${gradient} rounded-full group-hover:w-full transition-all duration-700`} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/[0.04] rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3">
                Simple et transparent
              </p>
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-slate-100 tracking-tight">
                Comment ça marche ?
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-14 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />

            <div className="grid md:grid-cols-3 gap-10">
              {steps.map(({ num, icon: Icon, title, desc }, i) => (
                <ScrollReveal key={num} delay={i * 120} direction="up">
                  <div className="text-center relative group">
                    <div className="relative w-28 h-28 mx-auto mb-7">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 to-pink-500/15 group-hover:from-indigo-500/25 group-hover:to-pink-500/25 transition-all duration-300" />
                      <div className="absolute inset-0 rounded-full border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon size={32} className="text-indigo-300 group-hover:text-indigo-200 transition-colors" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-white text-xs font-bold">{num}</span>
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-slate-100 text-xl mb-3 tracking-tight">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal delay={200}>
            <div className="text-center mt-14">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-xl shadow-indigo-500/25"
              >
                Je me lance maintenant
                <ArrowRight size={18} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SCORE LEVELS ===== */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Progression</p>
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-slate-100 tracking-tight">
                Le Mafluencer Score
              </h2>
              <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">
                De 0 à 1000 points, 5 niveaux basés sur ta performance réelle — pas tes followers.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {levels.map(({ label, range, icon: Icon, gradient }, i) => (
              <ScrollReveal key={label} delay={i * 80} direction="up">
                <div className="bg-[#1E293B]/50 border border-white/[0.06] rounded-2xl p-5 text-center hover:border-white/[0.14] hover:scale-[1.03] transition-all duration-200 group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className={`h-0.5 w-full rounded-full bg-gradient-to-r ${gradient} mb-3`} />
                  <p className="font-heading font-bold text-slate-200 text-sm tracking-tight">{label}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{range} pts</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Score breakdown */}
          <ScrollReveal delay={100}>
            <div className="mt-6 bg-[#1E293B]/50 border border-white/[0.06] rounded-2xl p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {scoreBreakdown.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400">{label}</p>
                    <p className="text-xs text-slate-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3">
                Ils ont franchi le cap
              </p>
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-slate-100 tracking-tight">
                Ce que disent nos creators
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ name, city, level, avatar, score, text, gradient }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className="bg-[#1E293B]/50 border border-white/[0.06] rounded-2xl p-7 h-full flex flex-col group hover:border-white/[0.12] transition-all duration-300">
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md`}>
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">{name}</p>
                      <p className="text-xs text-slate-600">{city}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {level}
                      </p>
                      <p className="text-xs text-slate-600">{score} pts</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOR BRANDS ===== */}
      <section className="px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="bg-[#1E293B]/60 border border-white/[0.06] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-orange-500/[0.04]" />
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-3xl" />

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-5 uppercase tracking-wider">
                    <Briefcase size={12} />
                    Pour les Brands
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-slate-100 tracking-tight mb-4">
                    Trouvez les créateurs qui{" "}
                    <span className="text-amber-400">convertissent vraiment</span>
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-7">
                    Accédez à une base de données de creators marocains avec des métriques d&apos;engagement vérifiées. Lancez des défis sponsorisés ou créez des missions ciblées.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      "Profils vérifiés avec scores réels",
                      "Filtres par ville, niche, niveau",
                      "Gestion des missions intégrée",
                      "ROI mesurable en temps réel",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                        <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-500/15 flex-shrink-0">
                          <Check size={10} className="text-amber-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-amber-500/25"
                  >
                    Créer un compte Brand
                    <ArrowRight size={15} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {brandMetrics.map(({ value, label, icon: Icon }) => (
                    <div key={label} className="bg-[#0F172A]/60 border border-white/[0.06] rounded-xl p-5 text-center hover:border-white/[0.12] transition-all">
                      <div className="w-8 h-8 mx-auto mb-2.5 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Icon size={14} className="text-amber-400" />
                      </div>
                      <p className="font-heading font-bold text-slate-100 text-xl">{value}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="px-4 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="relative bg-[#1E293B]/60 border border-white/[0.06] rounded-3xl p-12 sm:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-pink-500/[0.07]" />
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/25 flex items-center justify-center">
                  <Sparkles size={24} className="text-indigo-300" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100 tracking-tight mb-4">
                  Prêt à rejoindre la communauté ?
                </h2>
                <p className="text-slate-400 mb-10 text-base max-w-md mx-auto leading-relaxed">
                  Plus de 2 400 creators marocains ont déjà commencé. La prochaine vague de défis commence cette semaine.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/auth/register"
                    className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
                  >
                    Commencer gratuitement
                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/explorer"
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-slate-400 font-medium text-base hover:text-slate-200 hover:border-white/[0.18] hover:bg-white/[0.08] transition-all duration-200"
                  >
                    <Play size={15} className="text-indigo-400" />
                    Voir le classement
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
