"use client";
import BuyerCSVImport from "@/components/BuyerCSVImport";

export default function ImportBuyersPage() {
  return (
    <div>
      <h1>Import Buyers (CSV)</h1>
      <p>Upload a CSV file to insert new buyers.</p>
      <BuyerCSVImport />
    </div>
  );
}
