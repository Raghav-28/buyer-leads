import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export async function GET() {
//   const users = await prisma.user.findMany();
//   return NextResponse.json(users);
// }
export async function GET() {
  const newUser = await prisma.user.create({
    data: {
      email: "raghav@example.com",
      name: "Raghav",
    },
  });
  return NextResponse.json(newUser);
}
