import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PAGE_DEFAULTS } from "@/lib/page-content";
import { Shield, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Mafluencer",
  description: "Découvrez comment Mafluencer collecte, utilise et protège vos données personnelles, conformément à la loi 09-08 marocaine.",
};

export const revalidate = 3600;

export default async function PrivacyPage() {
  let record = null;
  try {
    record = await prisma.pageContent.findUnique({ where: { slug: "privacy" } });
  } catch { /* table may not exist yet — fall back to defaults */ }

  const { title, content } = record ?? PAGE_DEFAULTS.privacy;
  const updatedAt = record?.updatedAt ?? null;

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-5">
            <Shield size={22} className="text-pink-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100 tracking-tight mb-3">
            {title}
          </h1>
          {updatedAt && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
              <Calendar size={12} />
              Dernière mise à jour : {new Date(updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Content */}
        <div
          className="legal-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        .legal-content h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #e2e8f0;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .legal-content p {
          color: #94a3b8;
          font-size: 0.9375rem;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .legal-content ul {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }
        .legal-content ul li {
          color: #94a3b8;
          font-size: 0.9375rem;
          line-height: 1.75;
          padding-left: 1.25rem;
          position: relative;
          margin-bottom: 0.375rem;
        }
        .legal-content ul li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: #ec4899;
          font-weight: 700;
        }
        .legal-content strong {
          color: #cbd5e1;
          font-weight: 600;
        }
        .legal-content a {
          color: #f472b6;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-content a:hover {
          color: #f9a8d4;
        }
      `}</style>
    </div>
  );
}
