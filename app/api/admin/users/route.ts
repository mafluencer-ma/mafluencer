import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

// GET /api/admin/users — list all users
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search");
  const role   = searchParams.get("role");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        creatorProfile: { select: { score: true, level: true, followersCount: true, verified: true } },
        brandProfile:   { select: { companyName: true, balance: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.user.count({ where }),
  ]);

  return ok({
    users: users.map((u) => ({
      id:        u.id,
      name:      u.name,
      email:     u.email,
      role:      u.role,
      image:     u.image,
      banned:    u.banned,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      creatorProfile: u.creatorProfile,
      brandProfile:   u.brandProfile,
    })),
    pagination: { page, limit, total },
  });
}

// POST /api/admin/users — create user manually
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as {
    name?: string; email?: string; password?: string;
    role?: string; companyName?: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.password || !body.role) {
    return err("Champs requis : name, email, password, role");
  }

  const validRoles = ["ADMIN", "MANAGER", "CREATOR", "BRAND"];
  if (!validRoles.includes(body.role)) return err("Rôle invalide");
  if (body.password.length < 8) return err("Mot de passe trop court (8 caractères min)");

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return err("email_taken", 409);

  const hash = await bcrypt.hash(body.password, 12);
  const role = body.role as "ADMIN" | "MANAGER" | "CREATOR" | "BRAND";

  const user = await prisma.user.create({
    data: {
      name:          body.name.trim(),
      email:         body.email.trim().toLowerCase(),
      password:      hash,
      role,
      emailVerified: new Date(), // admin-created users are pre-verified
    },
  });

  // Create profile based on role
  if (role === "CREATOR") {
    await prisma.creatorProfile.create({
      data: { userId: user.id, niches: [], score: 0, level: "Rookie" },
    });
  } else if (role === "BRAND") {
    await prisma.brandProfile.create({
      data: {
        userId:      user.id,
        companyName: body.companyName?.trim() || body.name.trim(),
        balance:     0,
      },
    });
  }

  return ok({
    user: {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      image:     user.image,
      banned:    user.banned,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      creatorProfile: null,
      brandProfile:   null,
    },
  }, 201);
}

export const dynamic = 'force-dynamic'
