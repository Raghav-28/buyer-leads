import { z } from "zod";

export const buyerSchema = z
  .object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email().optional(),
    phone: z.string().min(10, "Phone number required"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["Studio", "One", "Two", "Three", "Four"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    timeline: z.enum(["M0_3m", "M3_6m", "MoreThan6m", "Exploring"]),
    source: z.enum(["Website", "Referral", "Walk_in", "Call", "Other"]),
    status: z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.budgetMin === undefined ||
      data.budgetMax === undefined ||
      data.budgetMax >= data.budgetMin,
    {
      message: "budgetMax must be greater than or equal to budgetMin",
      path: ["budgetMax"], // shows error on max field
    }
  );
