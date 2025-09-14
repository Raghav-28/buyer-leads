// app/api/buyers/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const buyerSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters").max(80, "Full Name must be at most 80 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["Studio", "One", "Two", "Three", "Four"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.number().min(0, "Budget must be non-negative").optional(),
  budgetMax: z.number().min(0, "Budget must be non-negative").optional(),
  timeline: z.enum(["M0_3m", "M3_6m", "MoreThan6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk_in", "Call", "Other"]),
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]),
  notes: z.string().max(1000, "Notes must be at most 1000 characters").optional(),
  tags: z.string().optional(), // Keep as string for CSV parsing
}).refine((data) => {
  if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, { message: "budgetMax should be >= budgetMin" })
.refine((data) => {
  // BHK is required for Apartment and Villa property types
  if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
    return false;
  }
  return true;
}, { message: "BHK is required for Apartment and Villa property types" });

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
