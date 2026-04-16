import { prisma } from "@/lib/prisma";

type NotificationType =
  | "MISSION_RECEIVED"
  | "MISSION_ACCEPTED"
  | "MISSION_DELIVERED"
  | "MISSION_PAID"
  | "MISSION_REFUSED"
  | "CHALLENGE_SUBMISSION_APPROVED"
  | "CHALLENGE_SUBMISSION_REJECTED"
  | "CHALLENGE_COMPLETED"
  | "VOTE_RECEIVED"
  | "PAYMENT_PROCESSED"
  | "PAYMENT_REJECTED"
  | "LEVEL_UP"
  | "SYSTEM";

interface CreateNotificationInput {
  userId:  string;
  type:    NotificationType;
  title:   string;
  message: string;
  link?:   string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createManyNotifications(inputs: CreateNotificationInput[]) {
  return prisma.notification.createMany({ data: inputs });
}

// ── Domain-specific helpers ───────────────────────────────────────────────────

export async function notifyMissionReceived(
  creatorId: string,
  brandName: string,
  missionTitle: string,
  missionId: string
) {
  return createNotification({
    userId:  creatorId,
    type:    "MISSION_RECEIVED",
    title:   `Nouvelle mission de ${brandName}`,
    message: `"${missionTitle}" — Accepte ou refuse dans les 48h.`,
    link:    `/dashboard/creator/missions`,
  });
}

export async function notifyMissionAccepted(
  brandUserId: string,
  creatorName: string,
  missionTitle: string
) {
  return createNotification({
    userId:  brandUserId,
    type:    "MISSION_ACCEPTED",
    title:   `Mission acceptée par ${creatorName}`,
    message: `"${missionTitle}" a été acceptée. Le creator travaille dessus.`,
    link:    `/dashboard/brand/missions`,
  });
}

export async function notifyMissionDelivered(
  brandUserId: string,
  creatorName: string,
  missionTitle: string
) {
  return createNotification({
    userId:  brandUserId,
    type:    "MISSION_DELIVERED",
    title:   `Contenu livré par ${creatorName}`,
    message: `"${missionTitle}" — Vérifie la livraison et valide le paiement.`,
    link:    `/dashboard/brand/missions`,
  });
}

export async function notifyMissionPaid(
  creatorId: string,
  amount: number,
  missionTitle: string
) {
  return createNotification({
    userId:  creatorId,
    type:    "MISSION_PAID",
    title:   `Paiement reçu 💰`,
    message: `${amount.toLocaleString("fr-MA")} MAD versés pour "${missionTitle}".`,
    link:    `/dashboard/creator/earnings`,
  });
}

export async function notifySubmissionApproved(
  creatorId: string,
  challengeTitle: string,
  challengeId: string
) {
  return createNotification({
    userId:  creatorId,
    type:    "CHALLENGE_SUBMISSION_APPROVED",
    title:   `Soumission approuvée ✓`,
    message: `Ta soumission pour "${challengeTitle}" a été approuvée. Les votes sont ouverts !`,
    link:    `/dashboard/creator/challenges`,
  });
}

export async function notifySubmissionRejected(
  creatorId: string,
  challengeTitle: string,
  reason?: string
) {
  return createNotification({
    userId:  creatorId,
    type:    "CHALLENGE_SUBMISSION_REJECTED",
    title:   `Soumission refusée`,
    message: reason
      ? `Ta soumission pour "${challengeTitle}" a été refusée : ${reason}`
      : `Ta soumission pour "${challengeTitle}" n'est pas conforme aux règles.`,
    link:    `/dashboard/creator/challenges`,
  });
}

export async function notifyPaymentProcessed(
  userId: string,
  amount: number,
  type: "WITHDRAWAL" | "DEPOSIT"
) {
  return createNotification({
    userId,
    type:    "PAYMENT_PROCESSED",
    title:   type === "WITHDRAWAL" ? "Retrait effectué ✓" : "Recharge créditée ✓",
    message: `${amount.toLocaleString("fr-MA")} MAD ${type === "WITHDRAWAL" ? "virés sur ton compte bancaire" : "ajoutés à ton solde"}.`,
    link:    type === "WITHDRAWAL" ? "/dashboard/creator/earnings" : "/dashboard/brand/billing",
  });
}

export async function notifyPaymentRejected(
  userId: string,
  amount: number,
  reason?: string
) {
  return createNotification({
    userId,
    type:    "PAYMENT_REJECTED",
    title:   `Retrait refusé`,
    message: reason
      ? `Ta demande de retrait de ${amount.toLocaleString("fr-MA")} MAD a été refusée : ${reason}`
      : `Ta demande de retrait de ${amount.toLocaleString("fr-MA")} MAD a été refusée.`,
    link:    "/dashboard/creator/earnings",
  });
}
