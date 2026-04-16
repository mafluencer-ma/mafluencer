import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Rejoins Mafluencer en tant que Creator ou Brand",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
