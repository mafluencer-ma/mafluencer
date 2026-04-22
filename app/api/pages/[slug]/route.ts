import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/page-content";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (slug !== "terms" && slug !== "privacy") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const record = await prisma.pageContent.findUnique({ where: { slug } });

  if (record) {
    return NextResponse.json({ title: record.title, content: record.content, updatedAt: record.updatedAt });
  }

  // Fall back to compiled defaults — page works before admin has saved anything
  const defaults = PAGE_DEFAULTS[slug as PageSlug];
  return NextResponse.json({ title: defaults.title, content: defaults.content, updatedAt: null });
}
