"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BuyerCSVImport from "@/components/BuyerCSVImport";
import { useDebounce } from "@/hooks/useDebounce";

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

type PaginationInfo = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function BuyersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // All hooks must be called at the top level
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // URL-synced state
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    timeline: searchParams.get("timeline") || "",
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  // Debounced search
  const debouncedSearch = useDebounce(search, 300);

  // Update URL when filters change
  const updateURL = (newFilters: any, newSearch: string, newSortBy: string, newSortOrder: string, newPage: number) => {
    const params = new URLSearchParams();
    
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.city) params.set("city", newFilters.city);
    if (newFilters.propertyType) params.set("propertyType", newFilters.propertyType);
    if (newFilters.timeline) params.set("timeline", newFilters.timeline);
    if (newSearch) params.set("search", newSearch);
    if (newSortBy !== "updatedAt") params.set("sortBy", newSortBy);
    if (newSortOrder !== "desc") params.set("sortOrder", newSortOrder);
    if (newPage > 1) params.set("page", newPage.toString());
    
    const queryString = params.toString();
    const newURL = queryString ? `/buyers?${queryString}` : "/buyers";
    
    router.push(newURL, { scroll: false });
  };

  const fetchBuyers = async (page: number = 1) => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      
      if (filters.status) params.set("status", filters.status);
      if (filters.city) params.set("city", filters.city);
      if (filters.propertyType) params.set("propertyType", filters.propertyType);
      if (filters.timeline) params.set("timeline", filters.timeline);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (sortBy !== "updatedAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      
      const res = await fetch(`/api/buyers?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setBuyers(Array.isArray(data.buyers) ? data.buyers : []);
        setPagination(data.pagination);
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

  // Fetch buyers when dependencies change
  useEffect(() => {
    if (status !== "loading" && session) {
      fetchBuyers(1);
    }
  }, [session, status, filters, debouncedSearch, sortBy, sortOrder]);

  // Update URL when state changes
  useEffect(() => {
    if (status !== "loading" && session) {
      updateURL(filters, debouncedSearch, sortBy, sortOrder, 1);
    }
  }, [filters, debouncedSearch, sortBy, sortOrder]);

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

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchBuyers(newPage);
    updateURL(filters, debouncedSearch, sortBy, sortOrder, newPage);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleSortOrderChange = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

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
          <div style={{ fontSize: "14px" }}>
            Welcome, {session.user.name || session.user.email} ({session.user.role})
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
              <BuyerCSVImport onSuccess={() => fetchBuyers(pagination.page)} />
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
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
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
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Cities</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Zirakpur">Zirakpur</option>
                  <option value="Panchkula">Panchkula</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Property Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>

              {/* Timeline Filter */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Timeline
                </label>
                <select
                  value={filters.timeline}
                  onChange={(e) => handleFilterChange("timeline", e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: "1px solid #ced4da", 
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Timelines</option>
                  <option value="M0_3m">0-3 months</option>
                  <option value="M3_6m">3-6 months</option>
                  <option value="MoreThan6m">More than 6 months</option>
                  <option value="Exploring">Exploring</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                  Sort By
                </label>
                <div style={{ display: "flex", gap: "5px" }}>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
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
                    onClick={handleSortOrderChange}
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
              Showing {buyers.length} of {pagination.totalCount} buyers
              {pagination.totalCount > 0 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
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
          ) : buyers.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              fontSize: "16px", 
              color: "#6c757d" 
            }}>
              {pagination.totalCount === 0 ? "No buyers found. Create your first buyer!" : "No buyers match the current filters."}
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
                    {buyers.map((b) => (
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
              {pagination.totalPages > 1 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  gap: "10px", 
                  marginTop: "20px" 
                }}>
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      background: !pagination.hasPrevPage ? "#f8f9fa" : "white",
                      color: !pagination.hasPrevPage ? "#6c757d" : "#495057",
                      cursor: !pagination.hasPrevPage ? "not-allowed" : "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Previous
                  </button>
                  
                  <div style={{ display: "flex", gap: "5px" }}>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                            background: pagination.page === page ? "#0070f3" : "white",
                            color: pagination.page === page ? "white" : "#495057",
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
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      background: !pagination.hasNextPage ? "#f8f9fa" : "white",
                      color: !pagination.hasNextPage ? "#6c757d" : "#495057",
                      cursor: !pagination.hasNextPage ? "not-allowed" : "pointer",
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
