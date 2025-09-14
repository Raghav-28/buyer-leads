import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Optional: read filters from query params
    const { status, city, propertyType } = req.query;

    const buyers = await prisma.buyer.findMany({
      where: {
        status: status ? String(status) : undefined,
        city: city ? String(city) : undefined,
        propertyType: propertyType ? String(propertyType) : undefined,
      },
      orderBy: { updatedAt: "desc" },
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

    res.setHeader("Content-Disposition", "attachment; filename=buyers.csv");
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
}
