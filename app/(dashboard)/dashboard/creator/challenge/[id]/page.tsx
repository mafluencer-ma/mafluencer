import type { Metadata } from "next";
import { auth }          from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Suspense }      from "react";
import { prisma }        from "@/lib/prisma";
import { FormSkeleton }  from "@/components/dashboard/skeleton-page";
import ChallengeDetailClient from "./_client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ch = await prisma.challenge.findUnique({ where: { id }, select: { title: true } });
  return { title: ch ? `${ch.title} — Défi` : "Défi introuvable" };
}

export default async function ChallengePage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      brand: { select: { companyName: true } },
    },
  });

  if (!challenge) notFound();

  return (
    <Suspense fallback={<div className="max-w-3xl"><FormSkeleton /></div>}>
      <ChallengeDetailClient
        challenge={{
          id:              challenge.id,
          title:           challenge.title,
          category:        challenge.category,
          description:     challenge.description,
          brief:           challenge.brief,
          rules:           challenge.rules,
          endDate:         challenge.endDate,
          prizeAmount:     challenge.prizeAmount,
          type:            challenge.type,
          hashtag:         challenge.hashtag,
          allowedPlatforms:challenge.allowedPlatforms,
          contentTypes:    challenge.contentTypes,
          sponsor:         challenge.brand?.companyName,
        }}
      />
    </Suspense>
  );
}
