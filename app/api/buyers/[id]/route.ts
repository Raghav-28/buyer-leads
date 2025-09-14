import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buyerSchema } from "@/lib/validations/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// ✅ GET buyer by ID
// GET buyer by ID with last 5 history
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id },
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    const history = await prisma.buyerHistory.findMany({
      where: { buyerId: params.id },
      orderBy: { changedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ ...buyer, history });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Error fetching buyer" }, { status: 500 });
  }
}


// PATCH buyer by ID
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate input with Zod (partial update allowed)
    const parsed = buyerSchema.partial().parse(body);

    // Fetch old buyer
    const oldBuyer = await prisma.buyer.findUnique({ where: { id: params.id } });
    if (!oldBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Ownership / Admin check
    const isOwner = oldBuyer.ownerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update buyer
    const updatedBuyer = await prisma.buyer.update({
      where: { id: params.id },
      data: parsed, // Prisma will auto-update updatedAt
    });

    // Build diff JSON
    const diff: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(parsed)) {
      const oldValue = oldBuyer[key as keyof typeof oldBuyer];
      const newValue = parsed[key as keyof typeof parsed];
      if (oldValue !== newValue) {
        diff[key] = { old: oldValue, new: newValue };
      }
    }

    // Save history only if changes exist
    if (Object.keys(diff).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: params.id,
          changedBy: session.user.id, // record logged-in user
          diff,
        },
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error: any) {
    console.error("PATCH error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Error updating buyer" }, { status: 500 });
  }
}

