import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buyerSchema } from "@/lib/validations/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";  // ✅ fixed import

// ✅ Create new buyer
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();

    // ✅ parse the body without ownerId
    const { ownerId, ...rest } = json; // ignore if sent by client
    const parsed = buyerSchema.parse(rest);

    const buyer = await prisma.buyer.create({
      data: {
        ...parsed,
        ownerId: session.user.id, // inject logged-in user ID
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
// ✅ Get all buyers
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buyers = await prisma.buyer.findMany({
      orderBy: { updatedAt: "desc" }, // ✅ fixed (your model has updatedAt, not createdAt)
    });
    return NextResponse.json(buyers, { status: 200 });
  } catch (error) {
    console.error("GET /buyers error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
