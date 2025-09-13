import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const buyer = await prisma.buyer.create({
      data,
    });

    return NextResponse.json(buyer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
export async function GET() {
  try {
    const buyers = await prisma.buyer.findMany();
    return NextResponse.json(buyers);
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}