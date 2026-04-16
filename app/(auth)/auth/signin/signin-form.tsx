"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import toast from "react-hot-toast";

export default function SigninForm() {
  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleEmailSignin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoadingEmail(true);
    try {
      const res = await signIn("resend", { email, redirect: false });
      if (res?.error) {
        toast.error("Erreur lors de l'envoi du lien. Réessaie.");
      } else {
        setEmailSent(true);
        toast.success("Lien envoyé ! Vérifie ta boîte mail.");
      }
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogleSignin() {
    setLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard/creator" });
    } catch {
      toast.error("Erreur lors de la connexion Google.");
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="w-full max-w-md fade-in">
      <div className="glass rounded-[20px] p-8 shadow-2xl shadow-indigo-500/5">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[16px] bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/20 mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">
            Content de te revoir
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Connecte-toi pour accéder à ton dashboard
          </p>
        </div>

        {emailSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Mail size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Vérifie ta boîte mail !</p>
              <p className="text-sm text-slate-500 mt-1">
                On a envoyé un lien magique à <span className="text-indigo-400">{email}</span>
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
              onClick={handleGoogleSignin}
              loading={loadingGoogle}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-slate-600">ou par email</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSignin} className="space-y-4">
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
                Recevoir le lien magique
                <ArrowRight size={16} />
              </Button>
            </form>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-slate-700 mt-4">
        En continuant, tu acceptes nos{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-slate-500 transition-colors">
          CGU
        </Link>{" "}
        et notre{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-500 transition-colors">
          Politique de confidentialité
        </Link>
      </p>
    </div>
  );
}
