"use client";

// /auth/complete — client component that forces JWT refresh after role update.
//
// Flow:
//   1. User picks BRAND/CREATOR on /auth/register
//   2. callbackUrl = /auth/complete?role=BRAND
//   3. NextAuth redirects here after OAuth/magic-link
//   4. This page calls /api/auth/set-role to update DB role
//   5. Calls useSession().update() — triggers jwt callback with trigger="update"
//      which re-reads role from DB and rewrites the JWT cookie
//   6. Redirects to the correct dashboard with the fresh JWT

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Configuration de ton compte...</p>
      </div>
    </div>
  );
}

function CompleteInner() {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const role         = searchParams.get("role") === "BRAND" ? "BRAND" : "CREATOR";

  useEffect(() => {
    async function applyRole() {
      try {
        // 1. Update role in DB via API route
        const res  = await fetch("/api/auth/set-role", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ role }),
        });
        const data = await res.json() as { role?: string };

        const targetRole = data.role ?? role;

        // 2. Force JWT refresh — triggers jwt callback with trigger="update"
        //    which re-reads role from DB and writes fresh token to cookie
        await update({ role: targetRole });

        // 3. Wait for the new JWT cookie to be fully written to the browser
        await new Promise((r) => setTimeout(r, 500));

        // 4. Navigate to correct dashboard using a full page reload so the
        //    browser picks up the freshly-written JWT cookie
        const dest =
          targetRole === "BRAND" ? "/dashboard/brand"  :
          targetRole === "ADMIN" ? "/dashboard/admin"  :
          "/dashboard/creator";

        window.location.href = dest;
      } catch (e) {
        console.error("[auth/complete] error:", e);
        window.location.href = "/dashboard/creator";
      }
    }

    applyRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Spinner />;
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CompleteInner />
    </Suspense>
  );
}
