"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explorer", label: "Explorer", icon: Compass },
  { href: "/pricing",  label: "Tarifs" },
];

export default function PublicNavbar() {
  const pathname                  = usePathname();
  const { data: session }         = useSession();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const role = (session?.user as { role?: string })?.role?.toLowerCase() ?? "creator";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-xl shadow-black/30"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 group">
          <div className="relative h-10 w-32">
            <Image
              src="/logo.png"
              alt="Mafluencer"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "text-indigo-300 bg-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              )}
            >
              {Icon && <Icon size={14} />}
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Link
              href={`/dashboard/${role}`}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-indigo-500/25"
            >
              Mon Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-indigo-500/25"
              >
                Commencer gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-white/[0.06] transition-all"
            >
              {Icon && <Icon size={15} className="text-slate-500" />}
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            {session ? (
              <Link
                href={`/dashboard/${role}`}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
              >
                Mon Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm text-center font-medium text-slate-300 hover:bg-white/[0.06] transition-all"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
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
