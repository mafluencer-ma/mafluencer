import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/lib/youcanpay";

type Props = { params: Promise<{ linkId: string }> };

export default async function Page({ params }: Props) {
  const { linkId } = await params;
  const lien = await prisma.lienPaiement.findUnique({ where: { id: linkId } });
  if (!lien || lien.statut !== "ACTIF") redirect("/paiement/echec?reason=link_inactive");

  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";

    const checkoutUrl = await createTransaction({
      amount: lien.montant,
      currency: "MAD",
      orderId: lien.id,
      customerName: lien.nom,
      customerEmail: `paiement-${lien.id}@mafluencer.ma`,
      successUrl: `https://mafluencer.ma/paiement/succes?lienId=${lien.id}`,
      failureUrl: `https://mafluencer.ma/paiement/echec?lienId=${lien.id}`,
      customerIp: ip,
    });

    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0;url=${checkoutUrl}`} />
          <script
            dangerouslySetInnerHTML={{ __html: `window.location.href='${checkoutUrl}'` }}
          />
        </head>
        <body style={{ fontFamily: "sans-serif", textAlign: "center", paddingTop: "100px" }}>
          <p>Redirection vers le paiement...</p>
        </body>
      </html>
    );
  } catch {
    redirect("/paiement/echec?reason=payment_unavailable");
  }
}
