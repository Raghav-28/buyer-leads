import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buyerSchema } from "@/lib/validations/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ Create new buyer
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();

    // ignore ownerId from client
    const { ownerId, ...rest } = json;
    const parsed = buyerSchema.parse(rest);

    const buyer = await prisma.buyer.create({
      data: {
        ...parsed,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error: any) {
    console.error("POST /buyers error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Validation or server error", details: String(error) },
      { status: 500 }
    );
  }
}

// GET all buyers
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buyers = await prisma.buyer.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // Ensure it's always an array
    return NextResponse.json(Array.isArray(buyers) ? buyers : []);
  } catch (error) {
    console.error("GET /buyers error:", error);
    return NextResponse.json([], { status: 500 }); // return empty array on error
  }
}
