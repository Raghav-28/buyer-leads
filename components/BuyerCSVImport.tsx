"use client";

import { useState } from "react";
import Papa from "papaparse";

type BuyerRow = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source?: string;
  notes?: string;
  tags?: string;
  status: string;
};

type Props = {
  onImportSuccess?: () => void;
};

export default function BuyerCSVImport({ onImportSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessMsg("");
    }
  };

  const handleUpload = () => {
    if (!file) return;

    Papa.parse<BuyerRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data.map((r) => ({
          ...r,
          budgetMin: r.budgetMin ? Number(r.budgetMin) : undefined,
          budgetMax: r.budgetMax ? Number(r.budgetMax) : undefined,
        }));

        if (rows.length > 200) {
          setErrors([{ row: 0, message: "CSV exceeds 200 rows limit" }]);
          return;
        }

        setLoading(true);
        setErrors([]);
        try {
          const res = await fetch("/api/buyers/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyers: rows }),
          });

          const data = await res.json();
          if (!res.ok) {
            if (data.errors) {
              setErrors(data.errors.map((e: any) => ({ row: e.index, message: e.message })));
            } else {
              setErrors([{ row: 0, message: data.error || "Unknown error" }]);
            }
            setSuccessMsg("");
          } else {
            setSuccessMsg(data.message);
            setFile(null);
            if (onImportSuccess) onImportSuccess();
          }
        } catch (err: any) {
          setErrors([{ row: 0, message: err.message || "Network error" }]);
          setSuccessMsg("");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setErrors([{ row: 0, message: err.message }]);
      },
    });
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "16px" }}>
      <h3>Import Buyers CSV</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || loading} style={{ marginLeft: "8px" }}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      {errors.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <h4>Errors:</h4>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "4px" }}>Row</th>
                <th style={{ border: "1px solid #ccc", padding: "4px" }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #ccc", padding: "4px" }}>{e.row}</td>
                  <td style={{ border: "1px solid #ccc", padding: "4px" }}>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
