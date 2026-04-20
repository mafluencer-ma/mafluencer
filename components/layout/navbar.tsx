"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Bell, ChevronDown, LogOut, Settings, User, Compass,
  Sun, Moon, RotateCcw,
} from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, isAuto, toggleTheme, setAuto } = useTheme();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors duration-300"
      style={{
        background:   "var(--theme-nav-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor:  "var(--theme-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
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

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/explorer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          >
            <Compass size={14} />
            Explorer
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          >
            Tarifs
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-1.5">

          {/* ── Theme toggle ── */}
          <div className="relative">
            <button
              onClick={() => { setThemeOpen((v) => !v); setMenuOpen(false); }}
              className={cn(
                "relative p-2 rounded-lg transition-all",
                isDark
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : "text-indigo-500 hover:bg-indigo-500/10"
              )}
              aria-label="Changer le thème"
              title={isAuto
                ? `Mode automatique (actuellement ${isDark ? "sombre" : "clair"}, change à ${isDark ? "7h" : "20h"})`
                : `Mode ${isDark ? "sombre" : "clair"} (manuel)`}
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
              {isAuto && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>

            {themeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-[14px] border shadow-xl z-20 py-1.5 overflow-hidden"
                  style={{
                    background:  "var(--theme-dropdown-bg)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <p className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Thème
                  </p>
                  <button
                    onClick={() => { if (isDark) return; toggleTheme(); setThemeOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                      !isDark
                        ? "text-indigo-400 bg-indigo-500/10 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <Sun size={15} />
                    <span>Mode clair</span>
                    {!isDark && !isAuto && (
                      <span className="ml-auto text-[10px] text-indigo-400 font-semibold">Actif</span>
                    )}
                  </button>
                  <button
                    onClick={() => { if (isDark && !isAuto) return; toggleTheme(); setThemeOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                      isDark && !isAuto
                        ? "text-amber-400 bg-amber-500/10 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <Moon size={15} />
                    <span>Mode sombre</span>
                    {isDark && !isAuto && (
                      <span className="ml-auto text-[10px] text-amber-400 font-semibold">Actif</span>
                    )}
                  </button>
                  <div className="border-t my-1" style={{ borderColor: "var(--theme-border)" }} />
                  <button
                    onClick={() => { setAuto(); setThemeOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                      isAuto
                        ? "text-emerald-400 bg-emerald-500/10 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <RotateCcw size={15} />
                    <div className="flex-1 text-left">
                      <p>Automatique</p>
                      <p className="text-[10px] text-slate-500 font-normal">Clair 7h–20h · Sombre 20h–7h</p>
                    </div>
                    {isAuto && (
                      <span className="ml-auto text-[10px] text-emerald-400 font-semibold">Actif</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {session ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => { setMenuOpen((v) => !v); setThemeOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-slate-200 max-w-[100px] truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn("text-slate-500 transition-transform duration-200", menuOpen && "rotate-180")}
                  />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl shadow-black/30 z-20 py-1.5 overflow-hidden border"
                      style={{
                        background:  "var(--theme-dropdown-bg)",
                        borderColor: "var(--theme-border)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                      }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--theme-border)" }}>
                        <p className="text-sm font-semibold text-slate-200 truncate">{session.user?.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{session.user?.email}</p>
                      </div>
                      <Link
                        href={`/dashboard/${(session.user as { role?: string }).role?.toLowerCase() ?? "creator"}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/[0.06] transition-all"
                      >
                        <User size={14} className="text-slate-500" />
                        Dashboard
                      </Link>
                      <Link
                        href="/explorer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/[0.06] transition-all"
                      >
                        <Compass size={14} className="text-slate-500" />
                        Explorer les créateurs
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/[0.06] transition-all"
                      >
                        <Settings size={14} className="text-slate-500" />
                        Paramètres
                      </Link>
                      <div className="mt-1 pt-1" style={{ borderTop: "1px solid var(--theme-border)" }}>
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
                        >
                          <LogOut size={14} />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/25"
              >
                Commencer
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
