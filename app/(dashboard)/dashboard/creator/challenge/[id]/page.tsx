import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/dashboard/skeleton-page";
import ChallengeDetailClient from "./_client";

type Props = { params: Promise<{ id: string }> };

const CHALLENGES: Record<string, { id: string; title: string; category: string; description: string; rules: string[]; tips: string[]; endDate: Date; prizeAmount: number | null; type: string; sponsor?: string }> = {
  "ch-12": {
    id: "ch-12",
    title: "Défi Humour du Ramadan",
    category: "Humour",
    description: "Crée une vidéo humoristique sur le thème du Ramadan. Sois créatif, authentique, et fais rire ta communauté ! Le meilleur contenu est celui qui vient du cœur.",
    rules: [
      "Vidéo TikTok ou Instagram Reel minimum 30 secondes",
      "Hashtag #MafluenceurRamadan obligatoire dans la caption",
      "Contenu 100% original — aucun recyclage de vidéos existantes",
      "Pas de contenu offensant ou à caractère religieux irrespectueux",
      "Une seule soumission par creator",
    ],
    tips: [
      "Les vidéos avec des hooks puissants dans les 3 premières secondes performent mieux",
      "Utilise des sous-titres — 85% des vidéos sont regardées sans son",
      "La qualité de l'image compte : bonne luminosité = plus de vues",
    ],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    prizeAmount: null,
    type: "FREE",
  },
  "ch-13": {
    id: "ch-13",
    title: "Challenge Food Fusion Maroc",
    category: "Food",
    description: "Invente une recette qui fusionne la cuisine marocaine traditionnelle avec un style culinaire international. Montre tout le process, de la préparation au résultat final !",
    rules: [
      "Vidéo de la recette complète — minimum 45 secondes",
      "Ingrédients Marjane Market visibles à l'écran",
      "Hashtag #FoodFusionMarjane et #Mafluencer obligatoires",
      "Recette inspirée de la cuisine marocaine",
      "Post sur TikTok et/ou Instagram",
    ],
    tips: [
      "Montre chaque étape de la préparation",
      "Le résultat final doit être appétissant — soigne la présentation",
      "Une voix-off ou des sous-titres expliquant la recette augmente l'engagement",
    ],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    prizeAmount: 2000,
    type: "SPONSORED",
    sponsor: "Marjane Market",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ch = CHALLENGES[id];
  return { title: ch ? `${ch.title} — Défi` : "Défi introuvable" };
}

export default async function ChallengePage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  const { id } = await params;
  const challenge = CHALLENGES[id];
  if (!challenge) notFound();

  return (
    <Suspense fallback={<div className="max-w-3xl"><FormSkeleton /></div>}>
      <ChallengeDetailClient challenge={challenge} />
    </Suspense>
  );
}
