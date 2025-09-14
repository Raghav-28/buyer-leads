"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
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
  owner?: {
    name: string;
    email: string;
  };
};

export default function BuyersPage() {
  const { data: session, status } = useSession();
  
  // All hooks must be called at the top level
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
    // Only fetch buyers if user is authenticated
    if (status !== "loading" && session) {
      fetchBuyers();
    }
  }, [session, status]);

  // Handle authentication states
  if (status === "loading") {
    return <p>Checking authentication...</p>;
  }

  if (!session) {
    return (
      <div style={{ padding: "20px" }}>
        <p>You must be signed in to view buyers.</p>
        <button
          onClick={() => signIn()}
          style={{
            padding: "8px 16px",
            background: "#0070f3",
            color: "#fff",
            borderRadius: "4px",
            marginTop: "8px",
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  // --- Filtering + searching ---
  const filteredBuyers = buyers
    .filter(
      (b) =>
        (!filter.status || b.status === filter.status) &&
        (!filter.city || b.city === filter.city) &&
        (!filter.propertyType || b.propertyType === filter.propertyType)
    )
    .filter(
      (b) =>
        b.fullName.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase()) ||
        b.phone.includes(search)
    );

  // --- Sorting ---
  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    const valA = a[sortKey] || "";
    const valB = b[sortKey] || "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // --- Pagination ---
  const totalPages = Math.ceil(sortedBuyers.length / itemsPerPage);
  const paginatedBuyers = sortedBuyers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Export CSV ---
  const exportCSV = () => {
    const csvRows = [
      [
        "ID",
        "Full Name",
        "Email",
        "Phone",
        "City",
        "Property Type",
        "BHK",
        "Purpose",
        "Budget Min",
        "Budget Max",
        "Timeline",
        "Source",
        "Status",
        "Notes",
        "Tags",
        "Updated At",
        "Owner",
      ],
      ...buyers.map((b) => [
        b.id,
        b.fullName,
        b.email,
        b.phone,
        b.city,
        b.propertyType,
        b.bhk || "",
        b.purpose || "",
        b.budgetMin || "",
        b.budgetMax || "",
        b.timeline,
        b.source || "",
        b.status,
        b.notes || "",
        (b.tags || []).join(","),
        b.updatedAt,
        b.owner?.name || "Unknown",
      ]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyers.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>All Buyers</h1>
        <div>
          <span style={{ marginRight: "16px" }}>
            Welcome, {session.user.name || session.user.email} ({session.user.role})
          </span>
          <button
            onClick={() => signIn()}
            style={{
              padding: "6px 12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters + search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search buyers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "8px", padding: "6px" }}
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={{ marginRight: "8px", padding: "6px" }}
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={filter.city}
          onChange={(e) => setFilter({ ...filter, city: e.target.value })}
          style={{ marginRight: "8px", padding: "6px" }}
        >
          <option value="">All Cities</option>
          {[...new Set(buyers.map((b) => b.city))].map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          value={filter.propertyType}
          onChange={(e) =>
            setFilter({ ...filter, propertyType: e.target.value })
          }
          style={{ padding: "6px" }}
        >
          <option value="">All Property Types</option>
          {[...new Set(buyers.map((b) => b.propertyType))].map((pt) => (
            <option key={pt} value={pt}>
              {pt}
            </option>
          ))}
        </select>
      </div>

      {/* Sorting */}
      <div style={{ marginBottom: "16px" }}>
        <label>Sort by:</label>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as keyof Buyer)}
          style={{ marginLeft: "8px", padding: "6px" }}
        >
          <option value="updatedAt">Updated At</option>
          <option value="fullName">Name</option>
          <option value="city">City</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          style={{ marginLeft: "8px", padding: "6px 12px" }}
        >
          {sortOrder === "asc" ? "" : ""}
        </button>
      </div>

      {/* Import + Export */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={exportCSV}
          style={{
            padding: "8px 16px",
            background: "#0070f3",
            color: "white",
            borderRadius: "4px",
            marginRight: "8px",
          }}
        >
          Export CSV
        </button>
        <BuyerCSVImport onSuccess={fetchBuyers} />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading buyers...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : filteredBuyers.length === 0 ? (
        <p>No buyers match the filters/search</p>
      ) : (
        <>
          <table border={1} cellPadding={8} cellSpacing={0} style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Property</th>
                <th>Status</th>
                <th>Updated</th>
                {session.user.role === "ADMIN" && <th>Owner</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBuyers.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/buyers/${b.id}`}>{b.fullName}</Link>
                  </td>
                  <td>{b.email}</td>
                  <td>{b.phone}</td>
                  <td>{b.city}</td>
                  <td>{b.propertyType}</td>
                  <td>{b.status}</td>
                  <td>{new Date(b.updatedAt).toLocaleDateString()}</td>
                  {session.user.role === "ADMIN" && (
                    <td>{b.owner?.name || "Unknown"}</td>
                  )}
                  <td>
                    {/* Show edit button only if user is admin or owns this buyer */}
                    {(session.user.role === "ADMIN" || b.ownerId === session.user.id) && (
                      <Link 
                        href={`/buyers/${b.id}/edit`}
                        style={{ 
                          color: "#0070f3", 
                          textDecoration: "none",
                          fontSize: "14px"
                        }}
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: "16px" }}>
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{ padding: "6px 12px", marginRight: "8px" }}
            >
              Previous
            </button>
            <span style={{ margin: "0 8px" }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{ padding: "6px 12px" }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
