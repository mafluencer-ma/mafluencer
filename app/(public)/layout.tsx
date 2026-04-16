import PublicNavbar from "@/components/layout/public-navbar";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-10 px-4 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="font-heading font-bold text-slate-100">Mafluencer</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                La plateforme qui récompense les vrais créateurs de contenu au Maroc.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Plateforme</p>
              <ul className="space-y-2">
                {["Explorer", "Tarifs", "Classement"].map((l) => (
                  <li key={l}>
                    <Link href={`/${l.toLowerCase()}`} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Compte</p>
              <ul className="space-y-2">
                {[{ label: "Connexion", href: "/auth/signin" }, { label: "Inscription", href: "/auth/register" }].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Légal</p>
              <ul className="space-y-2">
                {[{ label: "CGU", href: "/terms" }, { label: "Confidentialité", href: "/privacy" }, { label: "Contact", href: "/contact" }].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700">
            <p>© 2025 Mafluencer. Fait avec ❤️ au Maroc 🇲🇦</p>
            <p>Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
