import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Trophy,
  Zap,
  Star,
  TrendingUp,
  Users,
  Award,
  ShieldCheck,
  Play,
  Check,
} from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Mafluencer — La plateforme qui récompense les vrais créateurs",
  description:
    "Relève des défis créatifs hebdomadaires, construis ton Mafluencer Score et décroche des missions payantes avec les meilleures marques marocaines.",
};

const features = [
  {
    icon: Flame,
    title: "Défis hebdomadaires",
    desc: "Chaque semaine, de nouveaux défis créatifs pour prouver ton talent et gagner des points.",
    gradient: "from-orange-500 to-pink-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Trophy,
    title: "Mafluencer Score",
    desc: "Un score basé sur tes vraies performances : engagement, régularité, votes communautaires.",
    gradient: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: TrendingUp,
    title: "Missions payantes",
    desc: "Les brands te contactent directement sur la base de ton score — pas de followers cachés.",
    gradient: "from-emerald-500 to-cyan-500",
    bg: "bg-emerald-500/10",
  },
];

const steps = [
  {
    num: "01",
    emoji: "🎬",
    title: "Crée ton compte",
    desc: "Inscription gratuite en 2 minutes. Connecte ton TikTok ou Instagram et complète ton profil creator.",
  },
  {
    num: "02",
    emoji: "🎯",
    title: "Relève les défis",
    desc: "Poste ton contenu sur les réseaux, soumets le lien, et la communauté vote pour les meilleurs.",
  },
  {
    num: "03",
    emoji: "💰",
    title: "Décroche des missions",
    desc: "Plus ton score est élevé, plus les brands te contactent. Négocie, livre, et encaisse en MAD.",
  },
];

const levels = [
  { label: "Rookie", range: "0–200", emoji: "🌱", gradient: "from-slate-500 to-slate-400" },
  { label: "Rising", range: "200–400", emoji: "📈", gradient: "from-green-500 to-emerald-400" },
  { label: "Star", range: "400–600", emoji: "⭐", gradient: "from-blue-500 to-cyan-400" },
  { label: "Elite", range: "600–800", emoji: "💎", gradient: "from-purple-500 to-pink-400" },
  { label: "Legend", range: "800–1000", emoji: "👑", gradient: "from-yellow-500 to-orange-400" },
];

const testimonials = [
  {
    name: "Yassine B.",
    city: "Casablanca",
    level: "Elite",
    avatar: "YB",
    score: 720,
    text: "En 3 mois j'ai décroché 4 missions payantes. Le score Mafluencer parle pour moi — les brands font confiance aux chiffres.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Samia L.",
    city: "Rabat",
    level: "Star",
    avatar: "SL",
    score: 510,
    text: "Enfin une plateforme qui valorise la qualité, pas juste le nombre de followers. J'ai 12K abonnés mais un taux d'engagement de 8%.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Amine K.",
    city: "Marrakech",
    level: "Rising",
    avatar: "AK",
    score: 340,
    text: "Les défis m'ont forcé à publier régulièrement. Mon engagement a doublé en un mois. Je suis accro !",
    gradient: "from-green-500 to-emerald-500",
  },
];

const stats = [
  { value: "2 400+", label: "Creators actifs", icon: Users },
  { value: "180+", label: "Défis lancés", icon: Flame },
  { value: "340+", label: "Missions payées", icon: Award },
  { value: "1.2M MAD", label: "Versés aux creators", icon: TrendingUp },
];

export default function LandingPage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/20 text-sm text-indigo-300 mb-8 fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Nouvelle vague de défis disponibles
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-slate-100 leading-[1.1] mb-6 fade-in">
            La plateforme qui{" "}
            <span className="relative">
              <span className="gradient-text">récompense</span>
            </span>
            <br />
            les vrais créateurs
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed fade-in">
            Relève des défis créatifs hebdomadaires, construis ton{" "}
            <span className="text-indigo-300 font-medium">Mafluencer Score</span>, et connecte-toi
            aux meilleures marques marocaines qui paient sur la{" "}
            <span className="text-pink-300 font-medium">performance réelle</span>.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 fade-in">
            <Link
              href="/auth/register"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-[14px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
            >
              Créer mon compte — c&apos;est gratuit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/explorer"
              className="flex items-center gap-2.5 px-8 py-4 rounded-[14px] glass border border-white/10 text-slate-300 font-medium text-base hover:border-white/20 hover:text-white transition-all"
            >
              <Play size={16} className="text-indigo-400" />
              Voir le classement
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            {[
              { icon: ShieldCheck, text: "Aucune carte requise" },
              { icon: Zap, text: "Setup en 2 minutes" },
              { icon: Star, text: "Gratuit pour les creators" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon size={13} className="text-slate-500" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="px-4 py-16 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <ScrollReveal key={label} delay={i * 80}>
              <div className="glass rounded-[16px] p-5 text-center hover:scale-[1.02] transition-all duration-300 group">
                <div className="w-10 h-10 mx-auto mb-3 rounded-[10px] bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <p className="text-2xl font-heading font-bold gradient-text">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Pourquoi Mafluencer ?</p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100">
                Tout ce dont tu as besoin pour{" "}
                <span className="gradient-text">briller</span>
              </h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm">
                Une plateforme construite pour les creators marocains, par des gens qui comprennent la scène locale.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, gradient, bg }, i) => (
              <ScrollReveal key={title} delay={i * 100} direction="up">
                <div className="glass rounded-[20px] p-7 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 h-full">
                  {/* Corner gradient */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                  <div className={`relative w-12 h-12 rounded-[14px] ${bg} flex items-center justify-center mb-5`}>
                    <Icon size={22} className={`bg-gradient-to-br ${gradient} bg-clip-text`} style={{ color: "transparent", filter: "none" }} />
                    <div className={`absolute inset-0 rounded-[14px] bg-gradient-to-br ${gradient} opacity-20`} />
                    <Icon size={22} className="absolute text-white" />
                  </div>

                  <h3 className="font-heading font-bold text-slate-100 text-xl mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>

                  <div className={`mt-6 h-0.5 w-12 bg-gradient-to-r ${gradient} rounded-full group-hover:w-full transition-all duration-500`} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">Simple & Transparent</p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100">
                Comment ça marche ?
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%-12px)] right-[calc(16.66%-12px)] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map(({ num, emoji, title, desc }, i) => (
                <ScrollReveal key={num} delay={i * 120} direction="up">
                  <div className="text-center relative group">
                    {/* Step circle */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-pink-500/20 group-hover:from-indigo-500/30 group-hover:to-pink-500/30 transition-all" />
                      <div className="absolute inset-0 rounded-full border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">{emoji}</div>
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{num}</span>
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-slate-100 text-xl mb-3">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal delay={200}>
            <div className="text-center mt-12">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-[14px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/20"
              >
                Je me lance maintenant
                <ArrowRight size={18} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== SCORE LEVELS ========== */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Progression</p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100">
                Le Mafluencer Score
              </h2>
              <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">
                De 0 à 1000 points, 5 niveaux basés sur ta performance réelle — pas tes followers.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {levels.map(({ label, range, emoji, gradient }, i) => (
              <ScrollReveal key={label} delay={i * 80} direction="up">
                <div className="glass rounded-[16px] p-5 text-center hover:scale-[1.04] transition-all duration-200 group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <p className="text-3xl mb-3">{emoji}</p>
                  <div className={`h-1 w-full rounded-full bg-gradient-to-r ${gradient} mb-3`} />
                  <p className="font-heading font-bold text-slate-200 text-sm">{label}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{range} pts</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Score breakdown */}
          <ScrollReveal delay={100}>
            <div className="mt-8 glass rounded-[20px] p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "🎯", label: "+50 pts", desc: "par défi relevé" },
                { icon: "👥", label: "+100 pts", desc: "votes communauté" },
                { icon: "📊", label: "+80 pts", desc: "engagement réel" },
                { icon: "⚡", label: "+30 pts", desc: "mission livrée" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">{label}</p>
                    <p className="text-xs text-slate-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">Social Proof</p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100">
                Ce que disent nos creators
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ name, city, level, avatar, score, text, gradient }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className="glass rounded-[20px] p-6 h-full flex flex-col group hover:scale-[1.01] transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">
                    &ldquo;{text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 border-t border-white/8 pt-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">{name}</p>
                      <p className="text-xs text-slate-600">{city}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{level}</p>
                      <p className="text-xs text-slate-600">{score} pts</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOR BRANDS ========== */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="glass rounded-[24px] p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-5">
                    🏢 Pour les Brands
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-slate-100 mb-4">
                    Trouvez les créateurs qui{" "}
                    <span className="text-amber-400">convertissent vraiment</span>
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Accédez à une base de données de creators marocains avec des métriques d&apos;engagement vérifiées. Lancez des défis sponsorisés ou créez des missions ciblées.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {[
                      "Profils vérifiés avec scores réels",
                      "Filtres par ville, niche, niveau",
                      "Gestion des missions intégrée",
                      "ROI mesurable en temps réel",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check size={14} className="text-amber-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20"
                  >
                    Créer un compte Brand
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "8.3%", label: "Engagement moyen", icon: TrendingUp },
                    { value: "48h", label: "Délai de réponse", icon: Zap },
                    { value: "96%", label: "Missions livrées", icon: Check },
                    { value: "4.8/5", label: "Note moyenne", icon: Star },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={label} className="glass-sm rounded-[14px] p-4 text-center">
                      <Icon size={16} className="mx-auto mb-2 text-amber-400" />
                      <p className="font-heading font-bold text-slate-100 text-lg">{value}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="relative glass rounded-[28px] p-12 sm:p-16 overflow-hidden">
              {/* Animated gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10" />
              <div className="absolute -top-10 -left-10 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-pink-600/15 rounded-full blur-3xl" />

              <div className="relative z-10">
                <p className="text-5xl mb-5">🚀</p>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100 mb-4">
                  Prêt à rejoindre la communauté ?
                </h2>
                <p className="text-slate-400 mb-10 text-base max-w-md mx-auto leading-relaxed">
                  Plus de 2 400 creators marocains ont déjà commencé. La prochaine vague de défis commence cette semaine.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/auth/register"
                    className="group flex items-center gap-2.5 px-8 py-4 rounded-[14px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
                  >
                    Commencer gratuitement
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/explorer"
                    className="px-8 py-4 rounded-[14px] glass border border-white/10 text-slate-400 font-medium text-base hover:text-slate-200 hover:border-white/20 transition-all"
                  >
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
