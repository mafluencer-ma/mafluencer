import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreatorProfileClient from "./creator-profile-client";

// Mock data — replaced by Prisma query later
const MOCK_CREATORS: Record<string, CreatorData> = {
  yassinecreates: {
    username: "yassinecreates",
    name: "Yassine Benali",
    city: "Casablanca",
    bio: "Creator de contenu humour & lifestyle 🎬 | TikTok @yassinecreates | Je fais rire le Maroc depuis 2021",
    niches: ["Humour", "Lifestyle"],
    score: 847,
    followersCount: 156000,
    engagementRate: 7.2,
    tiktokHandle: "yassinecreates",
    instagramHandle: "yassine.creates",
    challengesCount: 24,
    missionsCount: 8,
    pricePerPost: 1500,
    pricePerVideo: 3000,
    portfolio: [
      { id: "1", thumbnail: null, views: 450000, title: "Défi #humourmaroc Semaine 12" },
      { id: "2", thumbnail: null, views: 280000, title: "Défi #lifestyle Semaine 10" },
      { id: "3", thumbnail: null, views: 180000, title: "Défi #food Semaine 8" },
      { id: "4", thumbnail: null, views: 95000, title: "Défi #humour Semaine 6" },
      { id: "5", thumbnail: null, views: 67000, title: "Défi #trending Semaine 4" },
      { id: "6", thumbnail: null, views: 41000, title: "Défi #viral Semaine 2" },
    ],
    reviews: [
      { brand: "Marjane Market", rating: 5, text: "Excellent creator, livraison rapide et engagement au rendez-vous. On renouvelle !", avatar: "MM" },
      { brand: "Jumia Maroc", rating: 5, text: "Très professionnel et créatif. Le contenu a généré un vrai ROI pour notre campagne.", avatar: "JM" },
      { brand: "Inwi", rating: 4, text: "Bonne collaboration. Quelques allers-retours sur le brief mais résultat final excellent.", avatar: "IN" },
    ],
    challenges: [
      { id: "1", title: "Défi Humour du Ramadan", date: "Mars 2025", rank: 1, score: 98 },
      { id: "2", title: "Challenge Lifestyle Hiver", date: "Fév 2025", rank: 2, score: 87 },
      { id: "3", title: "Défi Food & Culture", date: "Jan 2025", rank: 3, score: 82 },
      { id: "4", title: "Viral Challenge #1", date: "Déc 2024", rank: 1, score: 95 },
    ],
  },
  samia_beauty: {
    username: "samia_beauty",
    name: "Samia Lahlou",
    city: "Rabat",
    bio: "Beauty & lifestyle creator 💄 | Revues honnêtes de produits marocains et internationaux | Rabat 🇲🇦",
    niches: ["Beauté", "Lifestyle"],
    score: 712,
    followersCount: 89000,
    engagementRate: 9.1,
    tiktokHandle: "samia.beauty",
    instagramHandle: "samia_lahlou_beauty",
    challengesCount: 19,
    missionsCount: 5,
    pricePerPost: 1200,
    pricePerVideo: 2500,
    portfolio: [
      { id: "1", thumbnail: null, views: 320000, title: "Routine skincare marocaine" },
      { id: "2", thumbnail: null, views: 190000, title: "Défi beauté minimaliste" },
      { id: "3", thumbnail: null, views: 145000, title: "Top 5 produits locaux" },
      { id: "4", thumbnail: null, views: 78000, title: "Maquillage pour l'Aïd" },
    ],
    reviews: [
      { brand: "Zara Beauty MA", rating: 5, text: "Collaboration au top ! Samia a une vraie authenticité qui résonne avec son audience.", avatar: "ZB" },
      { brand: "L'Oréal Maroc", rating: 5, text: "Profil parfait pour notre cible. Contenu de qualité et super réactivité.", avatar: "LO" },
    ],
    challenges: [
      { id: "1", title: "Défi Beauté Naturelle", date: "Avr 2025", rank: 1, score: 96 },
      { id: "2", title: "Challenge Skincare Local", date: "Mars 2025", rank: 2, score: 88 },
      { id: "3", title: "Défi Lifestyle Printemps", date: "Fév 2025", rank: 1, score: 91 },
    ],
  },
};

type PortfolioItem = { id: string; thumbnail: null | string; views: number; title: string };
type Review = { brand: string; rating: number; text: string; avatar: string };
type Challenge = { id: string; title: string; date: string; rank: number; score: number };
type CreatorData = {
  username: string; name: string; city: string; bio: string;
  niches: string[]; score: number; followersCount: number; engagementRate: number;
  tiktokHandle: string; instagramHandle: string; challengesCount: number; missionsCount: number;
  pricePerPost: number; pricePerVideo: number; portfolio: PortfolioItem[];
  reviews: Review[]; challenges: Challenge[];
};

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const creator = MOCK_CREATORS[username];
  if (!creator) return { title: "Creator introuvable" };
  return {
    title: `${creator.name} — Profil Creator`,
    description: creator.bio,
  };
}

export default async function CreatorPage({ params }: Props) {
  const { username } = await params;
  const creator = MOCK_CREATORS[username];
  if (!creator) notFound();
  return <CreatorProfileClient creator={creator} />;
}
