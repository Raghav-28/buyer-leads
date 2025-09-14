import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Read filters from query params
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const propertyType = searchParams.get("propertyType");
    const timeline = searchParams.get("timeline");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};
    
    // Apply filters
    if (status) where.status = status;
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (timeline) where.timeline = timeline;
    
    // Apply search
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    const fields = [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "notes",
      "tags",
      "status",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(buyers);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Disposition": "attachment; filename=buyers.csv",
        "Content-Type": "text/csv",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
