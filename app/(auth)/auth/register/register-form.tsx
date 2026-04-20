"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, ArrowRight, Video, Briefcase, Check, TrendingUp, CheckCircle, ChevronLeft, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Role = "CREATOR" | "BRAND";


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
  const [step,          setStep]          = useState<"role" | "auth">("role");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [emailSent,     setEmailSent]     = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);

  // Form fields
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");

  // Role is encoded in callbackUrl for OAuth providers
  const callbackUrl = `/auth/complete?role=${role}`;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password || !confirm) return;
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) {
        if (data.error === "email_taken") {
          toast.error("Un compte vérifié existe déjà avec cet email.");
        } else {
          toast.error(data.error ?? "Une erreur est survenue.");
        }
        return;
      }

      setEmailSent(true);
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function handleOAuth(
    provider: "google",
    setLoading: (v: boolean) => void
  ) {
    setLoading(true);
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
                  Lien de vérification envoyé à{" "}
                  <span className="text-indigo-400 font-medium">{email}</span>
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  Clique sur le lien dans l'email pour activer ton compte.
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
              {/* OAuth buttons */}
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


              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-slate-600 font-medium">ou avec un mot de passe</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Email + Password registration form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Nom complet"
                  type="text"
                  placeholder="Youssef Alami"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User size={16} />}
                  required
                />
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="toi@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                  required
                />
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    placeholder="8 caractères minimum"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock size={16} />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirmer le mot de passe"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Répète ton mot de passe"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    leftIcon={<Lock size={16} />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={loadingSubmit}>
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
