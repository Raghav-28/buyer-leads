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
  const itemsPerPage = 10;

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
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px"
      }}>
        Checking authentication...
      </div>
    );
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
    <div style={{ 
      minHeight: "100vh", 
      background: "#f8f9fa",
      padding: "20px"
    }}>
      {/* Dashboard Container */}
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        
        {/* Header */}
        <div style={{ 
          background: "#0070f3", 
          color: "white", 
          padding: "20px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Buyer Leads Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "14px" }}>
              Welcome, {session.user.name || session.user.email} ({session.user.role})
            </span>
            <button
              onClick={() => signIn()}
              style={{
                padding: "8px 16px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: "30px" }}>
          
          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "15px", 
            marginBottom: "30px",
            flexWrap: "wrap"
          }}>
            <Link 
              href="/buyers/new"
              style={{
                padding: "12px 24px",
                background: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "500",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
               Add New Buyer
            </Link>
            
            <button
              onClick={exportCSV}
              style={{
                padding: "12px 24px",
                background: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
               Export CSV
            </button>
            
            <div style={{ flex: 1 }}>
              <BuyerCSVImport onSuccess={fetchBuyers} />
            </div>
          </div>

          {/* Filters Section */}
          <div style={{ 
            background: "#f8f9fa", 
            padding: "20px", 
            borderRadius: "6px", 
            marginBottom: "20px",
            border: "1px solid #e9ecef"
          }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#495057" }}>
              Filters & Search
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "15px",
              alignItems: "end"
            }}>
              {/* Search */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Visited">Visited</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Converted">Converted</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  City
                </label>
                <select
                  value={filter.city}
                  onChange={(e) => setFilter({ ...filter, city: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Cities</option>
                  {[...new Set(buyers.map((b) => b.city))].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Property Type
                </label>
                <select
                  value={filter.propertyType}
                  onChange={(e) => setFilter({ ...filter, propertyType: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Property Types</option>
                  {[...new Set(buyers.map((b) => b.propertyType))].map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Sort By
                </label>
                <div style={{ display: "flex", gap: "5px" }}>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as keyof Buyer)}
                    style={{ 
                      flex: 1,
                      padding: "10px", 
                      border: "1px solid #ced4da", 
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="updatedAt">Updated At</option>
                    <option value="fullName">Name</option>
                    <option value="city">City</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    style={{ 
                      padding: "10px 12px", 
                      border: "1px solid #ced4da", 
                      borderRadius: "4px",
                      background: "white",
                      cursor: "pointer"
                    }}
                    title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                  >
                    {sortOrder === "asc" ? "" : ""}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "15px",
            padding: "10px 0"
          }}>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              Showing {paginatedBuyers.length} of {filteredBuyers.length} buyers
              {filteredBuyers.length !== buyers.length && ` (filtered from ${buyers.length} total)`}
            </div>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              Page {currentPage} of {totalPages || 1}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              fontSize: "16px", 
              color: "#6c757d" 
            }}>
              Loading buyers...
            </div>
          ) : error ? (
            <div style={{ 
              background: "#f8d7da", 
              color: "#721c24", 
              padding: "15px", 
              borderRadius: "4px", 
              border: "1px solid #f5c6cb" 
            }}>
              {error}
            </div>
          ) : filteredBuyers.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              fontSize: "16px", 
              color: "#6c757d" 
            }}>
              {buyers.length === 0 ? "No buyers found. Create your first buyer!" : "No buyers match the current filters."}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div style={{ 
                overflowX: "auto",
                border: "1px solid #dee2e6",
                borderRadius: "6px"
              }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  fontSize: "14px"
                }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Name
                      </th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Contact
                      </th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Property
                      </th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Budget
                      </th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Timeline
                      </th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Status
                      </th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Updated
                      </th>
                      {session.user.role === "ADMIN" && (
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                          Owner
                        </th>
                      )}
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontWeight: "600" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBuyers.map((b) => (
                      <tr key={b.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "12px" }}>
                          <Link 
                            href={`/buyers/${b.id}`}
                            style={{ 
                              color: "#0070f3", 
                              textDecoration: "none", 
                              fontWeight: "500" 
                            }}
                          >
                            {b.fullName}
                          </Link>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ fontSize: "13px" }}>
                            <div>{b.phone}</div>
                            {b.email && <div style={{ color: "#6c757d" }}>{b.email}</div>}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ fontSize: "13px" }}>
                            <div>{b.city}</div>
                            <div style={{ color: "#6c757d" }}>{b.propertyType} {b.bhk && `(${b.bhk})`}</div>
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {b.budgetMin || b.budgetMax ? (
                            <div style={{ fontSize: "13px" }}>
                              {b.budgetMin && `?${b.budgetMin.toLocaleString()}`}
                              {b.budgetMin && b.budgetMax && " - "}
                              {b.budgetMax && `?${b.budgetMax.toLocaleString()}`}
                            </div>
                          ) : (
                            <span style={{ color: "#6c757d", fontSize: "13px" }}>Not specified</span>
                          )}
                        </td>
                        <td style={{ padding: "12px", fontSize: "13px" }}>
                          {b.timeline === "M0_3m" && "0-3 months"}
                          {b.timeline === "M3_6m" && "3-6 months"}
                          {b.timeline === "MoreThan6m" && ">6 months"}
                          {b.timeline === "Exploring" && "Exploring"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            background: b.status === "New" ? "#e3f2fd" : 
                                       b.status === "Contacted" ? "#fff3e0" :
                                       b.status === "Converted" ? "#e8f5e8" :
                                       b.status === "Dropped" ? "#ffebee" : "#f3e5f5",
                            color: b.status === "New" ? "#1976d2" : 
                                   b.status === "Contacted" ? "#f57c00" :
                                   b.status === "Converted" ? "#388e3c" :
                                   b.status === "Dropped" ? "#d32f2f" : "#7b1fa2"
                          }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "13px", color: "#6c757d" }}>
                          {new Date(b.updatedAt).toLocaleDateString()}
                        </td>
                        {session.user.role === "ADMIN" && (
                          <td style={{ padding: "12px", fontSize: "13px", color: "#6c757d" }}>
                            {b.owner?.name || "Unknown"}
                          </td>
                        )}
                        <td style={{ padding: "12px" }}>
                          {(session.user.role === "ADMIN" || b.ownerId === session.user.id) && (
                            <Link 
                              href={`/buyers/${b.id}/edit`}
                              style={{ 
                                color: "#0070f3", 
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: "500"
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  gap: "10px", 
                  marginTop: "20px" 
                }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      background: currentPage === 1 ? "#f8f9fa" : "white",
                      color: currentPage === 1 ? "#6c757d" : "#495057",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Previous
                  </button>
                  
                  <div style={{ display: "flex", gap: "5px" }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                            background: currentPage === page ? "#0070f3" : "white",
                            color: currentPage === page ? "white" : "#495057",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      background: currentPage === totalPages ? "#f8f9fa" : "white",
                      color: currentPage === totalPages ? "#6c757d" : "#495057",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
