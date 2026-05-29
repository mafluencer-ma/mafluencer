import { z } from "zod";

// ── Creators ──────────────────────────────────────────────────────────────────

export const CreatorQuerySchema = z.object({
  search:  z.string().optional(),
  city:    z.string().optional(),
  niche:   z.string().optional(),
  level:   z.string().optional(),
  page:    z.coerce.number().int().min(1).default(1),
  limit:   z.coerce.number().int().min(1).max(50).default(20),
});

export const UpdateCreatorProfileSchema = z.object({
  bio:             z.string().max(500).optional(),
  city:            z.string().optional(),
  niches:          z.array(z.string()).max(5).optional(),
  tiktokHandle:    z.string().optional(),
  instagramHandle: z.string().optional(),
  pricePerPost:    z.number().positive().optional(),
  pricePerStory:   z.number().positive().optional(),
  pricePerVideo:   z.number().positive().optional(),
});

// ── Challenges ────────────────────────────────────────────────────────────────

export const CreateChallengeSchema = z.object({
  title:            z.string().min(3).max(100),
  description:      z.string().min(10).max(2000),
  brief:            z.string().max(3000).optional(),
  category:         z.string().min(1),
  type:             z.enum(["FREE", "SPONSORED"]).default("FREE"),
  startDate:        z.coerce.date(),
  endDate:          z.coerce.date(),
  prizeAmount:      z.number().positive().optional(),
  rules:            z.string().min(10).max(2000),
  hashtag:          z.string().max(100).optional(),
  allowedPlatforms: z.array(z.enum(["instagram", "tiktok"])).min(1).default(["instagram", "tiktok"]),
  contentTypes:     z.array(z.enum(["video", "image", "reel", "post"])).min(1).default(["video"]),
  brandId:          z.string().optional(),
});

export const UpdateChallengeSchema = CreateChallengeSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "VOTING", "COMPLETED"]).optional(),
});

export const SubmitChallengeSchema = z.object({
  platform:       z.enum(["instagram", "tiktok"]),
  postUrl:        z.string().url("URL du post invalide"),
  uploadedFileUrl:z.string().url().nullish(),
  caption:        z.string().max(2200).nullish(),
  // kept for legacy support
  videoUrl:       z.string().url().nullish(),
  thumbnailUrl:   z.string().url().nullish(),
});

export const VoteSchema = z.object({
  submissionId: z.string().cuid("ID de soumission invalide"),
  value:        z.number().int().min(1).max(1).default(1),
});

// ── Missions ──────────────────────────────────────────────────────────────────

export const CreateMissionSchema = z.object({
  creatorId:   z.string().cuid(),
  title:       z.string().min(3).max(150),
  brief:       z.string().min(30).max(3000),
  budget:      z.number().positive().min(100, "Budget minimum : 100 MAD"),
  type:        z.enum(["POST", "STORY", "VIDEO", "UGC"]),
  deliveryDate:z.coerce.date(),
  dos:         z.array(z.string()).max(10).optional(),
  donts:       z.array(z.string()).max(10).optional(),
});

export const DeliverMissionSchema = z.object({
  contentUrl: z.string().url("URL du contenu livré invalide"),
});

// ── Payments ──────────────────────────────────────────────────────────────────

export const WithdrawSchema = z.object({
  amount:       z.number().positive().min(200, "Retrait minimum : 200 MAD"),
  bankAccount:  z.string().min(5).max(100),
});

export const DepositSchema = z.object({
  amount:       z.number().positive().min(500, "Dépôt minimum : 500 MAD"),
  paymentMethod:z.string().min(2).max(100),
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const AdminUpdateUserSchema = z.object({
  role:   z.enum(["CREATOR", "BRAND", "ADMIN", "MANAGER"]).optional(),
  banned: z.boolean().optional(),
});

export const AdminPaymentActionSchema = z.object({
  action: z.enum(["PAID", "REJECTED"]),
  note:   z.string().max(300).optional(),
});

// ── Notifications ─────────────────────────────────────────────────────────────

export const MarkNotificationsReadSchema = z.object({
  ids: z.array(z.string().cuid()).optional(), // empty = mark all
});

// ── Upload ────────────────────────────────────────────────────────────────────

export const UploadQuerySchema = z.object({
  fileName:    z.string().min(1).max(200),
  contentType: z.string().refine(
    (t) => ["video/mp4", "video/webm", "video/quicktime", "image/jpeg", "image/png", "image/webp"].includes(t),
    "Type de fichier non autorisé"
  ),
  folder: z.enum(["videos", "thumbnails", "avatars", "portfolios", "challenges"]).default("videos"),
});
