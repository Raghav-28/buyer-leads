import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await prisma.buyerHistory.findMany({
      where: { buyerId: params.id },
      orderBy: { changedAt: "desc" },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /buyers/[id]/history error:", error);
    return NextResponse.json({ error: "Error fetching history" }, { status: 500 });
  }
}
