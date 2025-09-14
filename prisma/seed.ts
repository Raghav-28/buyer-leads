import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
      password: "admin123", // only for credentials login
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Normal User",
      email: "user@example.com",
      role: "USER",
      password: "user123",
    },
  });

  console.log("Created users:", { admin, user });

  // Create sample buyers
  for (let i = 1; i <= 5; i++) {
    await prisma.buyer.create({
      data: {
        fullName: `Test Buyer ${i}`,
        email: `buyer${i}@example.com`,
        phone: `98765432${i}0`,
        city: "Chandigarh",
        propertyType: i % 2 === 0 ? "Apartment" : "Villa",
        bhk: i % 2 === 0 ? "Two" : "Three",
        purpose: "Buy",
        budgetMin: 50000 * i,
        budgetMax: 70000 * i,
        timeline: "M0_3m",
        source: "Website",
        status: "New",
        notes: `Sample note ${i}`,
        tags: ["VIP"],
        ownerId: user.id,
      },
    });
  }

  console.log("Sample buyers created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
