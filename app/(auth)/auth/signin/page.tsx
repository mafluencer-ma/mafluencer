import type { Metadata } from "next";
import SigninForm from "./signin-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à ton compte Mafluencer",
};

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verified?: string }>;
}) {
  const { error, verified } = await searchParams;
  return <SigninForm errorParam={verified === "true" ? "verified" : error} />;
}
