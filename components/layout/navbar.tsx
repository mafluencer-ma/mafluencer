"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-dark border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-heading font-bold text-lg text-slate-100 hidden sm:block">
            Mafluencer
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/explorer" className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            Explorer
          </Link>
          <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            Tarifs
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[12px] hover:bg-white/5 transition-all"
                >
                  <Avatar
                    src={session.user?.image}
                    name={session.user?.name}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm text-slate-200 max-w-[100px] truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn("text-slate-500 transition-transform", menuOpen && "rotate-180")}
                  />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 glass rounded-[16px] shadow-xl z-20 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href={`/dashboard/${(session.user as { role?: string }).role?.toLowerCase() ?? "creator"}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
                      >
                        <User size={15} /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
                      >
                        <Settings size={15} /> Paramètres
                      </Link>
                      <div className="border-t border-white/8 mt-1 pt-1">
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                        >
                          <LogOut size={15} /> Déconnexion
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
                className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
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
