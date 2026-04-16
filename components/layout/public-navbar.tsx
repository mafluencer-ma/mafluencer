"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explorer", label: "Explorer" },
  { href: "/pricing", label: "Tarifs" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const role = (session?.user as { role?: string })?.role?.toLowerCase() ?? "creator";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-dark border-b border-white/8 shadow-lg shadow-black/20" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-heading font-bold text-lg text-slate-100">Mafluencer</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm transition-all duration-200",
                pathname === href
                  ? "text-indigo-300 bg-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Link
              href={`/dashboard/${role}`}
              className="px-4 py-2 text-sm font-medium rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
            >
              Mon Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
              >
                Commencer gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-white/8 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-[10px] text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/8 space-y-2">
            {session ? (
              <Link
                href={`/dashboard/${role}`}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-[12px] text-center text-sm font-medium bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
              >
                Mon Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-[10px] text-sm text-center text-slate-300 hover:bg-white/5 transition-all"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-[12px] text-sm font-medium text-center bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                >
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
