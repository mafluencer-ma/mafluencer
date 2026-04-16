import type { Metadata } from "next";
import ExplorerClient from "./explorer-client";

export const metadata: Metadata = {
  title: "Explorer — Classement des créateurs",
  description:
    "Découvre les meilleurs créateurs de contenu marocains. Filtre par ville, niche et niveau.",
};

export default function ExplorerPage() {
  return <ExplorerClient />;
}
