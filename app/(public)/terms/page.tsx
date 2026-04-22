import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PAGE_DEFAULTS } from "@/lib/page-content";
import { FileText, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Mafluencer",
  description: "Consultez les conditions générales d'utilisation de la plateforme Mafluencer, la plateforme de défis créatifs pour les creators du Maroc.",
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function TermsPage() {
  let record = null;
  try {
    record = await prisma.pageContent.findUnique({ where: { slug: "terms" } });
  } catch { /* table may not exist yet — fall back to defaults */ }

  const { title, content } = record ?? PAGE_DEFAULTS.terms;
  const updatedAt = record?.updatedAt ?? null;

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <FileText size={22} className="text-indigo-400" />
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
          // Content is admin-only — safe to render as HTML
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
          space-y: 0.5rem;
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
          color: #6366f1;
          font-weight: 700;
        }
        .legal-content strong {
          color: #cbd5e1;
          font-weight: 600;
        }
        .legal-content a {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-content a:hover {
          color: #a5b4fc;
        }
      `}</style>
    </div>
  );
}
