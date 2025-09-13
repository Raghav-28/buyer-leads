import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/buyers/[id]/history
 * Query params:
 *   - limit (optional, default 5)
 *   - page  (optional, default 1)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const buyerId = params.id;

  try {
    // quick existence check
    const exists = await prisma.buyer.findUnique({ where: { id: buyerId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const rawLimit = url.searchParams.get("limit") ?? "5";
    const rawPage = url.searchParams.get("page") ?? "1";
    let limit = parseInt(rawLimit, 10);
    let page = parseInt(rawPage, 10);
    if (Number.isNaN(limit) || limit < 1) limit = 5;
    if (Number.isNaN(page) || page < 1) page = 1;
    const skip = (page - 1) * limit;

    const [total, histories] = await prisma.$transaction([
      prisma.buyerHistory.count({ where: { buyerId } }),
      prisma.buyerHistory.findMany({
        where: { buyerId },
        orderBy: { changedAt: "desc" },
        take: limit,
        skip,
      }),
    ]);

    return NextResponse.json({
      buyerId,
      page,
      limit,
      total,
      histories,
    });
  } catch (err) {
    console.error("GET /api/buyers/[id]/history error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
