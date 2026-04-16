"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, ArrowRight, Video, Briefcase, Check, Sparkles, TrendingUp } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Role = "CREATOR" | "BRAND";

const roleOptions = [
  {
    value: "CREATOR" as Role,
    label: "Creator",
    subtitle: "Influenceur / Créateur de contenu",
    icon: Video,
    gradient: "from-indigo-500 to-pink-500",
    perks: [
      "Relève des défis hebdomadaires",
      "Construis ton Mafluencer Score",
      "Reçois des missions payantes",
      "Accède au leaderboard public",
    ],
    emoji: "🎬",
  },
  {
    value: "BRAND" as Role,
    label: "Brand",
    subtitle: "Marque / Agence marketing",
    icon: Briefcase,
    gradient: "from-amber-500 to-orange-500",
    perks: [
      "Découvre les meilleurs creators",
      "Lance des défis sponsorisés",
      "Crée des missions ciblées",
      "Mesure le ROI en temps réel",
    ],
    emoji: "🏢",
  },
];

export default function RegisterForm() {
  const [role, setRole] = useState<Role>("CREATOR");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"role" | "auth">("role");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoadingEmail(true);
    try {
      // Store role in cookie/session to set after auth
      document.cookie = `pending_role=${role};path=/;max-age=600`;
      const res = await signIn("resend", { email, redirect: false });
      if (res?.error) {
        toast.error("Erreur lors de l'envoi du lien.");
      } else {
        setEmailSent(true);
        toast.success("Lien magique envoyé !");
      }
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogleSignup() {
    setLoadingGoogle(true);
    document.cookie = `pending_role=${role};path=/;max-age=600`;
    try {
      await signIn("google", { callbackUrl: `/auth/setup?role=${role}` });
    } catch {
      toast.error("Erreur lors de la connexion Google.");
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="w-full max-w-lg fade-in">
      {step === "role" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
              <Sparkles size={12} /> Rejoins la communauté
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-100">
              Tu es Creator ou Brand ?
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Choisis ton rôle pour personnaliser ton expérience
            </p>
          </div>

          {/* Role cards */}
          <div className="grid gap-4">
            {roleOptions.map((option) => {
              const selected = role === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "relative glass rounded-[16px] p-5 text-left transition-all duration-200 hover:scale-[1.01]",
                    selected
                      ? "border-indigo-500/40 ring-2 ring-indigo-500/20"
                      : "border-white/8 hover:border-white/15"
                  )}
                >
                  {/* Selected indicator */}
                  {selected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0",
                      selected
                        ? `bg-gradient-to-br ${option.gradient}`
                        : "bg-slate-800"
                    )}>
                      {option.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100 text-lg">{option.label}</p>
                        {selected && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-medium">
                            Sélectionné
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{option.subtitle}</p>

                      <ul className="mt-3 space-y-1.5">
                        {option.perks.map((perk) => (
                          <li key={perk} className="flex items-center gap-2 text-xs text-slate-400">
                            <TrendingUp size={10} className="text-emerald-500 flex-shrink-0" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setStep("auth")}
          >
            Continuer en tant que {role === "CREATOR" ? "Creator" : "Brand"}
            <ArrowRight size={16} />
          </Button>

          <p className="text-center text-xs text-slate-600">
            Déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      ) : (
        <div className="glass rounded-[20px] p-8 shadow-2xl shadow-indigo-500/5">
          {/* Back + Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => setStep("role")}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-5"
            >
              ← Changer de rôle
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium mb-3">
              <span>{role === "CREATOR" ? "🎬" : "🏢"}</span>
              <span className="text-indigo-400">
                Inscription {role === "CREATOR" ? "Creator" : "Brand"}
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-100">
              Crée ton compte
            </h2>
            <p className="text-sm text-slate-500 mt-1">C&apos;est gratuit, promis 🤝</p>
          </div>

          {emailSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Mail size={28} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Vérifie ta boîte mail !</p>
                <p className="text-sm text-slate-500 mt-1">
                  Lien magique envoyé à <span className="text-indigo-400">{email}</span>
                </p>
              </div>
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <>
              {/* Google */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full mb-4"
                onClick={handleGoogleSignup}
                loading={loadingGoogle}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                S&apos;inscrire avec Google
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-slate-600">ou par email</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="toi@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loadingEmail}
                >
                  Créer mon compte gratuitement
                  <ArrowRight size={16} />
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-slate-600 mt-6">
            Déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
