import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/page-content";
import { revalidatePath } from "next/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { slug } = await params;
  if (slug !== "terms" && slug !== "privacy") {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const record = await prisma.pageContent.findUnique({ where: { slug } });
  if (record) {
    return NextResponse.json({ title: record.title, content: record.content, updatedAt: record.updatedAt });
  }

  const defaults = PAGE_DEFAULTS[slug as PageSlug];
  return NextResponse.json({ title: defaults.title, content: defaults.content, updatedAt: null });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { slug } = await params;
  if (slug !== "terms" && slug !== "privacy") {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const body = await req.json() as { title?: string; content?: string };
  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Le contenu est requis" }, { status: 400 });
  }

  const title = body.title?.trim() || PAGE_DEFAULTS[slug as PageSlug].title;

  const record = await prisma.pageContent.upsert({
    where:  { slug },
    update: { title, content: body.content },
    create: { slug, title, content: body.content },
  });

  // Invalidate the public page cache
  revalidatePath(`/${slug}`);

  return NextResponse.json({ title: record.title, content: record.content, updatedAt: record.updatedAt });
}
