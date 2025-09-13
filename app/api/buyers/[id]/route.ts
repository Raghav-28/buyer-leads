import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const buyerId = params.id;
    const data = await req.json();

    // Fetch old buyer
    const oldBuyer = await prisma.buyer.findUnique({ where: { id: buyerId } });
    if (!oldBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Update buyer
    const updatedBuyer = await prisma.buyer.update({
      where: { id: buyerId },
      data,
    });

    // Build diff JSON (only changed fields)
    const diff: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(data)) {
      const oldValue = oldBuyer[key as keyof typeof oldBuyer];
      const newValue = data[key];

      if (oldValue !== newValue) {
        diff[key] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    // Save history only if there are changes
    if (Object.keys(diff).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId,
          changedBy: "system", // 🔹 replace with logged-in user ID when you add NextAuth
          diff,
        },
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Error updating buyer" }, { status: 500 });
  }
}