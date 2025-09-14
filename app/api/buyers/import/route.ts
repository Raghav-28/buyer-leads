// app/api/buyers/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const buyerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.string().optional(),
  purpose: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  timeline: z.string(),
  source: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // Keep as string for CSV parsing
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]),
}).refine((data) => {
  if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, { message: "budgetMax should be >= budgetMin" });

// POST handler
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const buyers: unknown[] = body.buyers;
    if (!Array.isArray(buyers)) {
      return NextResponse.json({ error: "Invalid buyers data" }, { status: 400 });
    }

    const validBuyers = [];
    const errors: { index: number; message: string }[] = [];

    buyers.forEach((b, idx) => {
      try {
        validBuyers.push(buyerSchema.parse(b));
      } catch (err: any) {
        if (err.errors) {
          err.errors.forEach((e: any) => {
            errors.push({ index: idx + 1, message: e.message });
          });
        } else {
          errors.push({ index: idx + 1, message: err.message });
        }
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const b of validBuyers) {
        // Convert tags string to array
        const tagsArray = b.tags 
          ? b.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [];
        
        await tx.buyer.create({ 
          data: { 
            ...b, 
            tags: tagsArray, // Convert to array
            ownerId: session.user.id // Use current user as owner
          } 
        });
      }
    });

    return NextResponse.json({ message: `${validBuyers.length} buyers inserted` });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to insert buyers" }, { status: 500 });
  }
}

// Optional GET for testing
export async function GET() {
  return NextResponse.json({ message: "Import endpoint ready" });
}
