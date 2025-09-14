import { z } from "zod";

export const buyerSchema = z
  .object({
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
    status: z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]),
    notes: z.string().max(1000, "Notes must be at most 1000 characters").optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      data.budgetMin === undefined ||
      data.budgetMax === undefined ||
      data.budgetMax >= data.budgetMin,
    {
      message: "budgetMax must be greater than or equal to budgetMin",
      path: ["budgetMax"],
    }
  )
  .refine(
    (data) => {
      // BHK is required for Apartment and Villa property types
      if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
        return false;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment and Villa property types",
      path: ["bhk"],
    }
  );
