"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, User, Compass } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/[0.06]">
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

        {/* Nav links (desktop) */}
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
        <div className="flex items-center gap-2">
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
                  onClick={() => setMenuOpen((v) => !v)}
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1E293B]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 z-20 py-1.5 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/[0.06]">
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
                      <div className="border-t border-white/[0.06] mt-1 pt-1">
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
