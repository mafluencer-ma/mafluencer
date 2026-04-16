import type { Metadata } from "next";
import SigninForm from "./signin-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à ton compte Mafluencer",
};

export default function SigninPage() {
  return <SigninForm />;
}
