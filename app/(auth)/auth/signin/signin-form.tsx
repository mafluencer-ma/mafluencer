"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import toast from "react-hot-toast";

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

export default function SigninForm({ errorParam }: { errorParam?: string }) {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [loadingCreds,  setLoadingCreds]  = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTikTok, setLoadingTikTok] = useState(false);
  const [loadingInsta,  setLoadingInsta]  = useState(false);

  async function handleCredentialsSignin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoadingCreds(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect:    false,
      });
      if (res?.error === "EmailNotVerified") {
        toast.error("Vérifie ta boîte mail pour activer ton compte.");
      } else if (res?.error) {
        toast.error("Email ou mot de passe incorrect.");
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoadingCreds(false);
    }
  }

  async function handleOAuth(
    provider: "google" | "tiktok" | "instagram",
    setLoading: (v: boolean) => void
  ) {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Erreur lors de la connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1E293B]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">

        {/* Banners */}
        {(errorParam === "EmailExists" || errorParam === "OAuthAccountNotLinked") && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300 leading-relaxed">
              Un compte existe déjà avec cet email. Utilise le mot de passe ou une autre méthode.
            </p>
          </div>
        )}
        {errorParam === "Verification" && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 leading-relaxed">
              Erreur de vérification. Réessaie.
            </p>
          </div>
        )}
        {errorParam === "InvalidToken" && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 leading-relaxed">
              Lien invalide ou expiré. Inscris-toi à nouveau.
            </p>
          </div>
        )}
        {errorParam === "TokenExpired" && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300 leading-relaxed">
              Le lien de vérification a expiré. Inscris-toi à nouveau pour recevoir un nouveau lien.
            </p>
          </div>
        )}
        {(errorParam as string) === "verified" && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-300 leading-relaxed">
              Email vérifié ! Tu peux maintenant te connecter.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative h-10 w-36">
              <Image src="/logo.png" alt="Mafluencer" fill className="object-contain" priority />
            </div>
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-100 tracking-tight">
            Content de te revoir
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Connecte-toi pour accéder à ton dashboard
          </p>
        </div>

        {/* Email + Password form */}
        <form onSubmit={handleCredentialsSignin} className="space-y-4 mb-5">
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
              placeholder="Ton mot de passe"
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
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loadingCreds}
          >
            Se connecter
            <ArrowRight size={16} />
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-slate-600 font-medium">ou via</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => handleOAuth("google", setLoadingGoogle)}
            loading={loadingGoogle}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full bg-black/60 border-white/[0.1] hover:bg-black/80"
            onClick={() => handleOAuth("tiktok", setLoadingTikTok)}
            loading={loadingTikTok}
          >
            <TikTokIcon />
            Continuer avec TikTok
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-pink-500/20 hover:from-purple-900/60 hover:to-pink-900/60"
            onClick={() => handleOAuth("instagram", setLoadingInsta)}
            loading={loadingInsta}
          >
            <InstagramIcon />
            Continuer avec Instagram
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-slate-700 mt-4">
        En continuant, tu acceptes nos{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-slate-500 transition-colors">CGU</Link>{" "}
        et notre{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-500 transition-colors">Politique de confidentialité</Link>
      </p>
    </div>
  );
}
