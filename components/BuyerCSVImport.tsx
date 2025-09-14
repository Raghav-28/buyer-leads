"use client";

import { useState, useRef, useEffect } from "react";
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
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRegionRef = useRef<HTMLDivElement>(null);
  const successRegionRef = useRef<HTMLDivElement>(null);

  // Announce errors and success messages to screen readers
  useEffect(() => {
    if (errors.length > 0 && errorRegionRef.current) {
      errorRegionRef.current.setAttribute('aria-live', 'polite');
      errorRegionRef.current.focus();
    }
  }, [errors]);

  useEffect(() => {
    if (successMsg && successRegionRef.current) {
      successRegionRef.current.setAttribute('aria-live', 'polite');
    }
  }, [successMsg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
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
            setFileName("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  return (
    <div 
      style={{ 
        border: "1px solid #ccc", 
        padding: "12px", 
        marginBottom: "16px",
        borderRadius: "6px",
        backgroundColor: "#f8f9fa"
      }}
      role="region"
      aria-labelledby="csv-import-heading"
    >
      <h3 id="csv-import-heading" style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
        Import Buyers CSV
      </h3>
      
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <label 
          htmlFor="csv-file-input"
          style={{ 
            display: "inline-block",
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="button"
          aria-describedby="file-help"
        >
          Choose CSV File
        </label>
        
        <input
          ref={fileInputRef}
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
          aria-describedby="file-help"
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!file || loading} 
          style={{ 
            padding: "8px 16px",
            backgroundColor: !file || loading ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !file || loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          aria-describedby="upload-help"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div id="file-help" style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>
        Select a CSV file with buyer data. Maximum 200 rows allowed.
      </div>

      <div id="upload-help" style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>
        {!file ? "Please select a file first" : `Selected: ${fileName}`}
      </div>

      {successMsg && (
        <div 
          ref={successRegionRef}
          role="alert"
          aria-live="polite"
          style={{ 
            color: "green", 
            marginTop: "12px",
            padding: "8px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {errors.length > 0 && (
        <div 
          ref={errorRegionRef}
          role="alert"
          aria-live="polite"
          style={{ marginTop: "12px" }}
          tabIndex={-1}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#dc3545", fontSize: "14px" }}>
            Import Errors ({errors.length} error{errors.length !== 1 ? 's' : ''}):
          </h4>
          <div style={{ 
            maxHeight: "200px", 
            overflowY: "auto",
            border: "1px solid #dc3545",
            borderRadius: "4px"
          }}>
            <table 
              style={{ 
                borderCollapse: "collapse", 
                width: "100%",
                fontSize: "12px"
              }}
              role="table"
              aria-label="Import errors"
            >
              <thead>
                <tr style={{ backgroundColor: "#f8d7da" }}>
                  <th 
                    style={{ 
                      border: "1px solid #dc3545", 
                      padding: "8px", 
                      textAlign: "left",
                      fontWeight: "600"
                    }}
                  >
                    Row
                  </th>
                  <th 
                    style={{ 
                      border: "1px solid #dc3545", 
                      padding: "8px", 
                      textAlign: "left",
                      fontWeight: "600"
                    }}
                  >
                    Error Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e, idx) => (
                  <tr key={idx}>
                    <td 
                      style={{ 
                        border: "1px solid #dc3545", 
                        padding: "8px",
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                      }}
                    >
                      {e.row}
                    </td>
                    <td 
                      style={{ 
                        border: "1px solid #dc3545", 
                        padding: "8px",
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                      }}
                    >
                      {e.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}