import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Zap, ArrowRight, Star, Shield, Flame } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Tarifs — Mafluencer",
  description:
    "Plans flexibles pour les creators et les brands. Commence gratuitement, évolue selon tes besoins.",
};

const CREATOR_PLANS = [
  {
    id: "free",
    name: "Free",
    subtitle: "Pour commencer",
    price: 0,
    period: "toujours",
    gradient: "from-slate-600 to-slate-500",
    border: "border-white/8",
    highlight: false,
    badge: null,
    features: [
      { text: "Profil public creator", included: true },
      { text: "Participer aux défis hebdomadaires", included: true },
      { text: "Mafluencer Score", included: true },
      { text: "Apparaître dans le classement", included: true },
      { text: "3 soumissions / mois", included: true },
      { text: "Recevoir des missions de brands", included: true },
      { text: "Portfolio (3 vidéos max)", included: true },
      { text: "Statistiques avancées", included: false },
      { text: "Soumissions illimitées", included: false },
      { text: "Badge Pro visible", included: false },
      { text: "Priorité dans la recherche brands", included: false },
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/auth/register",
    ctaStyle: "ghost",
  },
  {
    id: "pro",
    name: "Pro Creator",
    subtitle: "Pour progresser sérieusement",
    price: 49,
    period: "mois",
    gradient: "from-indigo-500 to-pink-500",
    border: "border-indigo-500/40",
    highlight: true,
    badge: "Le plus populaire",
    features: [
      { text: "Tout le plan Free", included: true },
      { text: "Soumissions illimitées", included: true },
      { text: "Statistiques avancées & analytics", included: true },
      { text: "Badge Pro visible sur le profil", included: true },
      { text: "Priorité dans la recherche brands", included: true },
      { text: "Portfolio illimité", included: true },
      { text: "Boosts de score x1.5", included: true },
      { text: "Accès aux défis exclusifs Pro", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Export des stats (PDF/CSV)", included: true },
      { text: "Dashboard brand dédié", included: false },
    ],
    cta: "Commencer l'essai gratuit 14j",
    ctaHref: "/auth/register?plan=pro",
    ctaStyle: "primary",
  },
];

const BRAND_PLAN = {
  id: "brand",
  name: "Brand",
  subtitle: "Pour les marques & agences",
  price: 199,
  period: "mois",
  gradient: "from-amber-500 to-orange-500",
  border: "border-amber-500/30",
  badge: "Pour les marques",
  features: [
    { text: "Accès complet au leaderboard creators", included: true },
    { text: "Filtres avancés (ville, niche, score, KPIs)", included: true },
    { text: "Créer des missions illimitées", included: true },
    { text: "Lancer des défis sponsorisés", included: true },
    { text: "Dashboard ROI en temps réel", included: true },
    { text: "Gestion des paiements creators", included: true },
    { text: "Contrats & briefs intégrés", included: true },
    { text: "Rapports de performance", included: true },
    { text: "5 comptes utilisateurs", included: true },
    { text: "Support dédié", included: true },
    { text: "API access", included: true },
  ],
  cta: "Démarrer 14 jours gratuits",
  ctaHref: "/auth/register?role=brand",
};

const FAQ = [
  {
    q: "Est-ce vraiment gratuit pour les creators ?",
    a: "Oui, le plan Free est 100% gratuit et le reste pour toujours. Tu peux participer aux défis, recevoir des missions et construire ton score sans payer.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Absolument. Pas d'engagement. Tu peux annuler ton abonnement en 1 clic depuis ton dashboard, sans frais de résiliation.",
  },
  {
    q: "Comment fonctionne l'essai gratuit de 14 jours ?",
    a: "Tu accèdes à toutes les fonctionnalités Pro ou Brand pendant 14 jours. Aucune carte bancaire requise pour démarrer.",
  },
  {
    q: "Les paiements sont-ils sécurisés ?",
    a: "Oui. Nous utilisons des méthodes de paiement locales sécurisées (CMI, Stripe MAD) et toutes les transactions sont chiffrées.",
  },
  {
    q: "Que se passe-t-il à la fin de mon essai ?",
    a: "Tu repasses automatiquement sur le plan Free. Tes données et ton score sont conservés. Tu peux upgrader à tout moment.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative pt-12 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/15 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
              <Zap size={12} className="text-pink-400" />
              Essai gratuit 14 jours sans carte
            </div>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-slate-100 mb-4">
              Tarifs simples &{" "}
              <span className="gradient-text">transparents</span>
            </h1>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Commence gratuitement. Passe au niveau supérieur quand tu es prêt.
              Aucun engagement, annulation en 1 clic.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== Creator Plans ===== */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-8">
            <Flame size={16} className="text-pink-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pour les Creators</h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {CREATOR_PLANS.map(({ id, name, subtitle, price, period, gradient, border, highlight, badge, features, cta, ctaHref, ctaStyle }, i) => (
            <ScrollReveal key={id} delay={i * 80}>
              <div className={cn(
                "glass rounded-[20px] p-8 relative overflow-hidden h-full flex flex-col",
                `border ${border}`,
                highlight && "ring-2 ring-indigo-500/20"
              )}>
                {/* Highlight glow */}
                {highlight && (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-pink-500/5 pointer-events-none" />
                )}

                {/* Badge */}
                {badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                    {badge}
                  </div>
                )}

                {/* Header */}
                <div className="mb-8">
                  <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${gradient} opacity-20 mb-4`} />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{subtitle}</p>
                  <h3 className="text-2xl font-heading font-bold text-slate-100">{name}</h3>
                  <div className="flex items-end gap-1.5 mt-4">
                    {price === 0 ? (
                      <span className="text-4xl font-heading font-bold text-slate-100">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-4xl font-heading font-bold text-slate-100">{price}</span>
                        <span className="text-xl font-bold text-slate-500">DH</span>
                        <span className="text-slate-600 text-sm mb-1">/{period}</span>
                      </>
                    )}
                  </div>
                  {period === "toujours" && (
                    <p className="text-xs text-slate-600 mt-1">Pour toujours gratuit</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {features.map(({ text, included }) => (
                    <li key={text} className={cn("flex items-start gap-2.5 text-sm", included ? "text-slate-300" : "text-slate-700")}>
                      {included ? (
                        <Check size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={15} className="text-slate-700 flex-shrink-0 mt-0.5" />
                      )}
                      {text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={ctaHref}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold transition-all hover:scale-[1.01]",
                    ctaStyle === "primary"
                      ? `bg-gradient-to-r ${gradient} text-white hover:shadow-lg hover:shadow-indigo-500/20`
                      : "glass border border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                  )}
                >
                  {cta}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== Brand Plan ===== */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-sm">🏢</span>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pour les Brands & Agences</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={`glass rounded-[20px] border ${BRAND_PLAN.border} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8 md:p-10 grid md:grid-cols-2 gap-10 items-start">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-5">
                  🏢 {BRAND_PLAN.badge}
                </div>
                <h3 className="text-3xl font-heading font-bold text-slate-100 mb-2">{BRAND_PLAN.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{BRAND_PLAN.subtitle}</p>

                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-5xl font-heading font-bold text-slate-100">{BRAND_PLAN.price}</span>
                  <span className="text-2xl font-bold text-slate-500">DH</span>
                  <span className="text-slate-600 text-sm mb-1">/{BRAND_PLAN.period}</span>
                </div>
                <p className="text-xs text-slate-600 mb-8">Facturé mensuellement · Sans engagement</p>

                <Link
                  href={BRAND_PLAN.ctaHref}
                  className={`flex items-center justify-center gap-2 w-full sm:w-auto sm:inline-flex px-8 py-4 rounded-[12px] bg-gradient-to-r ${BRAND_PLAN.gradient} text-white font-semibold text-sm hover:shadow-xl hover:shadow-amber-500/20 transition-all hover:scale-[1.01]`}
                >
                  {BRAND_PLAN.cta}
                  <ArrowRight size={16} />
                </Link>

                <div className="mt-6 flex flex-col gap-2">
                  {[
                    { icon: Shield, text: "Paiements 100% sécurisés" },
                    { icon: Star, text: "Support dédié 24h/24" },
                    { icon: Zap, text: "Setup en moins de 10 minutes" },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-2 text-xs text-slate-600">
                      <Icon size={12} className="text-amber-500" /> {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — features */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">Tout inclus :</p>
                <ul className="space-y-3">
                  {BRAND_PLAN.features.map(({ text, included }) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== Comparison table ===== */}
      <section className="px-4 pb-20 max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-heading font-bold text-slate-100 text-center mb-8">
            Comparaison détaillée
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="glass rounded-[20px] overflow-hidden">
            <div className="grid grid-cols-4 bg-slate-800/40 px-6 py-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fonctionnalité</div>
              {["Free", "Pro 49 DH", "Brand 199 DH"].map((h) => (
                <div key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{h}</div>
              ))}
            </div>
            {[
              ["Profil creator", true, true, false],
              ["Participation aux défis", true, true, false],
              ["Mafluencer Score", true, true, false],
              ["Soumissions", "3/mois", "Illimitées", false],
              ["Portfolio vidéos", "3 max", "Illimité", false],
              ["Statistiques avancées", false, true, false],
              ["Badge Pro", false, true, false],
              ["Boosts de score", false, "x1.5", false],
              ["Accès leaderboard brands", false, false, true],
              ["Créer des missions", false, false, true],
              ["Défis sponsorisés", false, false, true],
              ["Dashboard ROI", false, false, true],
              ["Export rapports", false, false, true],
            ].map(([feature, free, pro, brand], i) => (
              <div
                key={String(feature)}
                className={cn(
                  "grid grid-cols-4 px-6 py-3.5 text-sm",
                  i % 2 === 0 ? "bg-transparent" : "bg-slate-800/20"
                )}
              >
                <div className="text-slate-400">{String(feature)}</div>
                {[free, pro, brand].map((val, j) => (
                  <div key={j} className="text-center">
                    {val === true ? (
                      <Check size={16} className="mx-auto text-emerald-400" />
                    ) : val === false ? (
                      <X size={16} className="mx-auto text-slate-700" />
                    ) : (
                      <span className="text-xs font-medium text-indigo-300">{String(val)}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-4 pb-20 max-w-2xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-heading font-bold text-slate-100 text-center mb-10">
            Questions fréquentes
          </h2>
        </ScrollReveal>
        <div className="space-y-3">
          {FAQ.map(({ q, a }, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <FaqItem q={q} a={a} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="px-4 pb-20 max-w-2xl mx-auto">
        <ScrollReveal>
          <div className="glass rounded-[24px] p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-pink-500/8" />
            <div className="relative z-10">
              <p className="text-4xl mb-4">🚀</p>
              <h2 className="text-2xl font-heading font-bold text-slate-100 mb-3">
                Commence aujourd&apos;hui
              </h2>
              <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
                Rejoins la communauté. Plan gratuit, pas de carte requise.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-[14px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/20"
              >
                Créer mon compte — c&apos;est gratuit
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

// ——— inline helper ———
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="glass rounded-[14px] group">
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors">
        <span>{q}</span>
        <span className="text-slate-600 group-open:rotate-180 transition-transform text-lg leading-none">⌄</span>
      </summary>
      <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed border-t border-white/5 pt-3">
        {a}
      </div>
    </details>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
