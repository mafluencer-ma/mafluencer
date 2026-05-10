"use client";

import { useRouter } from "next/navigation";

const WA_URL =
  "https://wa.me/212601569387?text=J'ai un problème avec mon paiement sur mafluencer.ma, pouvez-vous m'aider?";

export default function PaiementEchecPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(30,41,59,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "48px 32px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 50px rgba(239,68,68,0.1)",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>❌</div>

        <h1
          style={{
            color: "#EF4444",
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 12px",
          }}
        >
          Paiement échoué
        </h1>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "16px",
            margin: "0 0 36px",
            lineHeight: "1.6",
          }}
        >
          Votre paiement n&apos;a pas pu être traité.
          <br />
          Réessayez ou contactez le support sur WhatsApp.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "linear-gradient(135deg, #6366F1, #EC4899)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              padding: "14px 32px",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            Réessayer
          </button>

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.3)",
              color: "#25D366",
              fontWeight: 600,
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "9999px",
              textDecoration: "none",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Support WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
