import { prisma } from "@/lib/prisma";

// ── Score constants ───────────────────────────────────────────────────────────

export const SCORE = {
  CHALLENGE_PARTICIPATION: 50,      // +50 per challenge submitted & approved
  CHALLENGE_VOTES_MAX:     100,     // votes communautaires max contribution
  CHALLENGE_ENGAGEMENT_MAX:80,      // engagement metrics max contribution
  MISSION_DELIVERED:       30,      // +30 per mission delivered on time
  WEEKLY_SKIP_PENALTY:    -20,      // -20 if no challenge that week
  CHALLENGE_WIN_FIRST:     150,     // bonus 1st place
  CHALLENGE_WIN_SECOND:    100,     // bonus 2nd place
  CHALLENGE_WIN_THIRD:     75,      // bonus 3rd place
} as const;

export const LEVELS = [
  { name: "Rookie", min: 0,   max: 199  },
  { name: "Rising", min: 200, max: 399  },
  { name: "Star",   min: 400, max: 599  },
  { name: "Elite",  min: 600, max: 799  },
  { name: "Legend", min: 800, max: 9999 },
] as const;

export function getLevel(score: number): string {
  return LEVELS.findLast((l) => score >= l.min)?.name ?? "Rookie";
}

export function pointsToNextLevel(score: number): { next: string; needed: number } | null {
  const currentIdx = LEVELS.findIndex((l) => score >= l.min && score <= l.max);
  if (currentIdx === -1 || currentIdx === LEVELS.length - 1) return null;
  const next = LEVELS[currentIdx + 1];
  return { next: next.name, needed: next.min - score };
}

// ── Score calculation after challenge submission approved ─────────────────────

/**
 * Called when a submission is APPROVED.
 * Awards participation points + engagement-based bonus.
 */
export async function awardChallengeParticipation(
  submissionId: string
): Promise<void> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { creator: { include: { creatorProfile: true } } },
  });
  if (!submission || !submission.creator.creatorProfile) return;

  // Engagement score: (likes + shares * 2 + comments * 1.5) / max, capped
  const rawEngagement =
    submission.likes + submission.shares * 2 + submission.comments * 1.5;
  const engagementBonus = Math.min(
    SCORE.CHALLENGE_ENGAGEMENT_MAX,
    Math.floor((rawEngagement / 1000) * SCORE.CHALLENGE_ENGAGEMENT_MAX)
  );

  const delta = SCORE.CHALLENGE_PARTICIPATION + engagementBonus;
  await applyScoreDelta(submission.creatorId, delta);
}

/**
 * Called when a challenge moves to COMPLETED.
 * Recalculates vote-based scores for all approved submissions,
 * assigns ranks, awards winners.
 */
export async function finalizeChallenge(challengeId: string): Promise<void> {
  const submissions = await prisma.submission.findMany({
    where:   { challengeId, status: "APPROVED" },
    include: { votes: true, creator: { include: { creatorProfile: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (submissions.length === 0) return;

  // Sort by vote count descending
  const ranked = submissions
    .map((s) => ({ ...s, voteCount: s.votes.reduce((a, v) => a + v.value, 0) }))
    .sort((a, b) => b.voteCount - a.voteCount);

  const maxVotes = ranked[0].voteCount || 1;

  for (let i = 0; i < ranked.length; i++) {
    const s = ranked[i];
    const rank = i + 1;

    // Vote bonus proportional to max votes
    const voteBonus = Math.floor((s.voteCount / maxVotes) * SCORE.CHALLENGE_VOTES_MAX);

    // Rank bonuses for top 3
    const rankBonus =
      rank === 1 ? SCORE.CHALLENGE_WIN_FIRST :
      rank === 2 ? SCORE.CHALLENGE_WIN_SECOND :
      rank === 3 ? SCORE.CHALLENGE_WIN_THIRD : 0;

    await prisma.submission.update({ where: { id: s.id }, data: { rank, score: voteBonus + rankBonus } });

    if (s.creator.creatorProfile) {
      await applyScoreDelta(s.creatorId, voteBonus + rankBonus);
    }
  }
}

// ── Score calculation after mission paid ──────────────────────────────────────

/**
 * Called when a mission is PAID.
 * Awards reliability bonus if delivered before deadline.
 */
export async function awardMissionDelivery(missionId: string): Promise<void> {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return;

  const deliveredOnTime =
    !mission.deliveryDate ||
    (mission.updatedAt <= mission.deliveryDate);

  const delta = deliveredOnTime ? SCORE.MISSION_DELIVERED : Math.floor(SCORE.MISSION_DELIVERED * 0.5);
  await applyScoreDelta(mission.creatorId, delta);
}

// ── Core delta applier ────────────────────────────────────────────────────────

async function applyScoreDelta(userId: string, delta: number): Promise<void> {
  const profile = await prisma.creatorProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const newScore = Math.max(0, Math.min(1000, profile.score + delta));
  const newLevel = getLevel(newScore);

  await prisma.creatorProfile.update({
    where: { userId },
    data:  { score: newScore, level: newLevel },
  });

  // Notify on level up
  if (newLevel !== profile.level) {
    await prisma.notification.create({
      data: {
        userId,
        type:    "LEVEL_UP",
        title:   `Nouveau niveau : ${newLevel} 🏆`,
        message: `Félicitations ! Tu es passé au niveau ${newLevel} avec ${newScore} points.`,
        link:    "/dashboard/creator",
      },
    });
  }
}
