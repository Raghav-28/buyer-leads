import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buyerSchema } from "@/lib/validations/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimitConfigs } from "@/lib/rateLimit";

//  Create new buyer
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting for create operations
  const rateLimitResult = rateLimitConfigs.createUpdate(session.user.id);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: "Too many requests", 
        message: "Please wait before creating another buyer",
        resetTime: rateLimitResult.resetTime 
      }, 
      { status: 429 }
    );
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

    // Create initial history entry for new buyer
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: session.user.id,
        diff: {
          created: { old: null, new: "Buyer created" }
        },
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

// GET all buyers with server-side pagination, filtering, and search
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting for general API access
  const rateLimitResult = rateLimitConfigs.general(session.user.id);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: "Too many requests", 
        message: "Please wait before making more requests",
        resetTime: rateLimitResult.resetTime 
      }, 
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const status = searchParams.get("status") || "";
    const city = searchParams.get("city") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const timeline = searchParams.get("timeline") || "";
    
    // Search parameter
    const search = searchParams.get("search") || "";
    
    // Sort parameters
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
    
    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Get total count for pagination
    const totalCount = await prisma.buyer.count({ where });
    
   // Get buyers with pagination - always include owner information
const buyers = await prisma.buyer.findMany({
  where,
  orderBy,
  skip: offset,
  take: limit,
  include: {
    owner: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      buyers: Array.isArray(buyers) ? buyers : [],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("GET /buyers error:", error);
    return NextResponse.json(
      { 
        buyers: [], 
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }
      }, 
      { status: 500 }
    );
  }
}
