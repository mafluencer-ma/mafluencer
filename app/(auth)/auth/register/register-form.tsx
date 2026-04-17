"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, Video, Briefcase, Check, TrendingUp, CheckCircle, ChevronLeft } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Role = "CREATOR" | "BRAND";

function TikTokIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

const roleOptions = [
  {
    value:    "CREATOR" as Role,
    label:    "Creator",
    subtitle: "Influenceur / Créateur de contenu",
    icon:     Video,
    gradient: "from-indigo-500 to-pink-500",
    perks: [
      "Relève des défis hebdomadaires",
      "Construis ton Mafluencer Score",
      "Reçois des missions payantes",
      "Accède au leaderboard public",
    ],
  },
  {
    value:    "BRAND" as Role,
    label:    "Brand",
    subtitle: "Marque / Agence marketing",
    icon:     Briefcase,
    gradient: "from-amber-500 to-orange-500",
    perks: [
      "Découvre les meilleurs creators",
      "Lance des défis sponsorisés",
      "Crée des missions ciblées",
      "Mesure le ROI en temps réel",
    ],
  },
];

export default function RegisterForm() {
  const [role,          setRole]          = useState<Role>("CREATOR");
  const [email,         setEmail]         = useState("");
  const [step,          setStep]          = useState<"role" | "auth">("role");
  const [loadingEmail,  setLoadingEmail]  = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTikTok, setLoadingTikTok] = useState(false);
  const [loadingInsta,  setLoadingInsta]  = useState(false);
  const [emailSent,     setEmailSent]     = useState(false);

  const callbackUrl = "/dashboard";

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoadingEmail(true);
    try {
      document.cookie = `pending_role=${role};path=/;max-age=600`;
      const res = await signIn("resend", { email, callbackUrl: "/dashboard", redirect: false });
      if (res?.error) {
        toast.error("Erreur lors de l'envoi du lien.");
      } else {
        setEmailSent(true);
        toast.success("Lien de connexion envoyé !");
      }
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleOAuth(
    provider: "google" | "tiktok" | "instagram",
    setLoading: (v: boolean) => void
  ) {
    setLoading(true);
    document.cookie = `pending_role=${role};path=/;max-age=600`;
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast.error("Erreur lors de la connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      {step === "role" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="relative h-10 w-36">
                <Image src="/logo.png" alt="Mafluencer" fill className="object-contain" priority />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              Inscription gratuite
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-100 tracking-tight">
              Tu es Creator ou Brand ?
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Choisis ton rôle pour personnaliser ton expérience
            </p>
          </div>

          {/* Role cards */}
          <div className="grid gap-3">
            {roleOptions.map((option) => {
              const Icon     = option.icon;
              const selected = role === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "relative bg-[#1E293B]/60 backdrop-blur-xl border rounded-2xl p-5 text-left transition-all duration-200",
                    selected
                      ? "border-indigo-500/40 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
                      : "border-white/[0.08] hover:border-white/[0.15] hover:bg-[#1E293B]/80"
                  )}
                >
                  {selected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
                      <Check size={12} className="text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      selected ? `bg-gradient-to-br ${option.gradient}` : "bg-slate-800"
                    )}>
                      <Icon size={20} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-slate-100">{option.label}</p>
                        {selected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold uppercase tracking-wider">
                            Sélectionné
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{option.subtitle}</p>
                      <ul className="space-y-1.5">
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

          <Button variant="primary" size="lg" className="w-full" onClick={() => setStep("auth")}>
            Continuer en tant que {role === "CREATOR" ? "Creator" : "Brand"}
            <ArrowRight size={16} />
          </Button>

          <p className="text-center text-xs text-slate-600">
            Déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-[#1E293B]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="text-center mb-7">
            <button
              onClick={() => setStep("role")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors mb-5"
            >
              <ChevronLeft size={14} />
              Changer de rôle
            </button>
            <div className="flex justify-center mb-4">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br",
                role === "CREATOR" ? "from-indigo-500 to-pink-500" : "from-amber-500 to-orange-500"
              )}>
                {role === "CREATOR" ? <Video size={20} className="text-white" /> : <Briefcase size={20} className="text-white" />}
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-100 tracking-tight">
              Crée ton compte {role === "CREATOR" ? "Creator" : "Brand"}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">Inscription 100% gratuite</p>
          </div>

          {emailSent ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Vérifie ta boîte mail</p>
                <p className="text-sm text-slate-500 mt-1.5">
                  Lien envoyé à{" "}
                  <span className="text-indigo-400 font-medium">{email}</span>
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
                className="w-full mb-3"
                onClick={() => handleOAuth("google", setLoadingGoogle)}
                loading={loadingGoogle}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                S&apos;inscrire avec Google
              </Button>

              {/* TikTok — creators only */}
              {role === "CREATOR" && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mb-3 bg-black/60 border-white/[0.1] hover:bg-black/80"
                  onClick={() => handleOAuth("tiktok", setLoadingTikTok)}
                  loading={loadingTikTok}
                >
                  <TikTokIcon />
                  S&apos;inscrire avec TikTok
                </Button>
              )}

              {/* Instagram — creators only */}
              {role === "CREATOR" && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mb-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-pink-500/20 hover:from-purple-900/60 hover:to-pink-900/60"
                  onClick={() => handleOAuth("instagram", setLoadingInsta)}
                  loading={loadingInsta}
                >
                  <InstagramIcon />
                  S&apos;inscrire avec Instagram
                </Button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-slate-600 font-medium">ou par email</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
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
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={loadingEmail}>
                  Créer mon compte gratuitement
                  <ArrowRight size={16} />
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-slate-600 mt-6">
            Déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
