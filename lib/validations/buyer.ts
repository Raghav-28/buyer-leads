import { z } from "zod";

export const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["Studio", "One", "Two", "Three", "Four"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.enum(["M0_3m", "M3_6m", "MoreThan6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk_in", "Call", "Other"]),
  status: z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
});
