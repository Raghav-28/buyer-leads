"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BuyerCSVImport from "@/components/BuyerCSVImport";

type Buyer = {
  id: string;
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
  status: string;
  notes?: string;
  tags?: string[];
  updatedAt: string;
  ownerId: string;
};

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState({
    status: "",
    city: "",
    propertyType: "",
  });

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Buyer>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch buyers from API
  const fetchBuyers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/buyers");
      const data = await res.json();
      if (res.ok) {
        setBuyers(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Failed to fetch buyers");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  // Filters + search
  const filteredBuyers = buyers.filter((b) => {
    return (
      (filter.status === "" || b.status === filter.status) &&
      (filter.city === "" || b.city === filter.city) &&
      (filter.propertyType === "" || b.propertyType === filter.propertyType) &&
      (search === "" ||
        b.fullName.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Sort buyers
  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA === undefined || valB === undefined) return 0;
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBuyers = sortedBuyers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedBuyers.length / itemsPerPage);

  // CSV export helper
  const handleExport = () => {
    const headers = [
      "fullName", "email", "phone", "city", "propertyType", "bhk", "purpose",
      "budgetMin", "budgetMax", "timeline", "source", "notes", "tags", "status"
    ];

    const escapeCsv = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      const escaped = str.replace(/"/g, '""');
      if (/["\n,]/.test(str)) return `"${escaped}"`;
      return str;
    };

    const rows = sortedBuyers.map(b => [
      b.fullName, b.email, b.phone, b.city, b.propertyType, b.bhk || "",
      b.purpose || "", b.budgetMin ?? "", b.budgetMax ?? "",
      b.timeline, b.source || "", b.notes || "", (b.tags || []).join(","), b.status
    ].map(escapeCsv));

    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "buyers.csv");
    link.click();
  };

  return (
    <div>
      <h1>All Buyers</h1>

      {/* Filters, search, sort & export */}
      <div style={{ marginBottom: "16px" }}>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Contacted">Contacted</option>
          <option value="Visited">Visited</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Converted">Converted</option>
          <option value="Dropped">Dropped</option>
        </select>

        <select value={filter.city} onChange={(e) => setFilter({ ...filter, city: e.target.value })}>
          <option value="">All Cities</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Mohali">Mohali</option>
          <option value="Zirakpur">Zirakpur</option>
          <option value="Panchkula">Panchkula</option>
          <option value="Other">Other</option>
        </select>

        <select value={filter.propertyType} onChange={(e) => setFilter({ ...filter, propertyType: e.target.value })}>
          <option value="">All Property Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Plot">Plot</option>
          <option value="Office">Office</option>
          <option value="Retail">Retail</option>
        </select>

        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginLeft: "8px" }} />

        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as keyof Buyer)}>
          <option value="updatedAt">Sort by Updated At</option>
          <option value="fullName">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button onClick={handleExport} style={{ marginLeft: "8px" }}>
          Export CSV
        </button>
      </div>

      
      {/* Buyers List */}
      {loading && <p>Loading buyers...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && filteredBuyers.length === 0 && (
        <p>No buyers match the filters/search. Try uploading CSV to add buyers.</p>
      )}

      {!loading && !error && filteredBuyers.length > 0 && (
        <>
          <ul>
            {currentBuyers.map((buyer) => (
              <li key={buyer.id} style={{ marginBottom: "8px" }}>
                <Link href={`/buyers/${buyer.id}`}>
                  {buyer.fullName} | {buyer.email} | Status: {buyer.status}
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div style={{ marginTop: "16px" }}>
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>
              Previous
            </button>
            <span style={{ margin: "0 8px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
