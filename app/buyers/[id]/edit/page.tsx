"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  history?: HistoryItem[];
};

type HistoryItem = {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
  changedByUser?: {
    name: string | null;
    email: string;
  } | null;
};

export default function EditBuyerPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const buyerId = params.id as string;

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "One",
    purpose: "Buy",
    budgetMin: "",
    budgetMax: "",
    timeline: "M0_3m",
    source: "Website",
    status: "New",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch buyer data
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchBuyer = async () => {
      try {
        const res = await fetch(`/api/buyers/${buyerId}`);
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 403) {
            setError("You don't have permission to edit this buyer");
          } else {
            setError(data.error || "Failed to fetch buyer");
          }
          return;
        }

        setBuyer(data);
        const isResidential = data.propertyType === "Apartment" || data.propertyType === "Villa";
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "Chandigarh",
          propertyType: data.propertyType || "Apartment",
          bhk: isResidential ? (data.bhk || "One") : "",
          purpose: data.purpose || "Buy",
          budgetMin: data.budgetMin?.toString() || "",
          budgetMax: data.budgetMax?.toString() || "",
          timeline: data.timeline || "M0_3m",
          source: data.source || "Website",
          status: data.status || "New",
          notes: data.notes || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch buyer");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [session, status, buyerId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear BHK when property type changes to non-residential
    if (name === "propertyType") {
      const isResidential = value === "Apartment" || value === "Villa";
      setForm({ 
        ...form, 
        [name]: value,
        bhk: isResidential ? (form.bhk || "One") : ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    // Convert budget fields to number
    const budgetMin = Number(form.budgetMin);
    const budgetMax = Number(form.budgetMax);

    // Client-side validation for budget
    if (!isNaN(budgetMin) && !isNaN(budgetMax) && budgetMax < budgetMin) {
      setError("Budget Max must be greater than or equal to Budget Min");
      setSaving(false);
      return;
    }

    // Full name validation
    if (form.fullName.length < 2) {
      setError("Full Name must be at least 2 characters");
      setSaving(false);
      return;
    }

    // Phone validation
    if (form.phone.length < 10 || form.phone.length > 15) {
      setError("Phone number must be between 10 and 15 digits");
      setSaving(false);
      return;
    }

    // BHK validation for Apartment and Villa
    if ((form.propertyType === "Apartment" || form.propertyType === "Villa") && !form.bhk) {
      setError("BHK is required for Apartment and Villa property types");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/buyers/${buyerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetMin: isNaN(budgetMin) ? undefined : budgetMin,
          budgetMax: isNaN(budgetMax) ? undefined : budgetMax,
          updatedAt: buyer?.updatedAt, // Include updatedAt for concurrency control
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // Concurrency conflict
          setError(data.message || "This record has been modified by another user. Please refresh the page and try again.");
        } else if (res.status === 403) {
          setError("You don't have permission to edit this buyer");
        } else {
          setError(data.error || "Failed to update buyer");
        }
      } else {
        setMessage("Buyer updated successfully!");
        // Refresh buyer data to get updated history
        const refreshRes = await fetch(`/api/buyers/${buyerId}`);
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setBuyer(refreshData);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Redirecting to login...</p>;
  }

  if (error && !buyer) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Error</h1>
        <p style={{ color: "red" }}>{error}</p>
        <Link href="/buyers" style={{ color: "#0070f3" }}>
           Back to Buyers
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/buyers" style={{ color: "#0070f3", textDecoration: "none" }}>
           Back to Buyers
        </Link>
        <h1>Edit Buyer: {buyer?.fullName}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Edit Form */}
        <div>
          {message && (
            <div style={{ 
              color: "green", 
              background: "#f0f8f0", 
              padding: "12px", 
              borderRadius: "4px", 
              marginBottom: "20px" 
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ 
              color: "red", 
              background: "#ffe6e6", 
              padding: "12px", 
              borderRadius: "4px", 
              marginBottom: "20px" 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {/* Hidden field for concurrency control */}
            <input type="hidden" name="updatedAt" value={buyer?.updatedAt || ""} />
            
            <div>
              <label>
                Full Name:
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={80}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div>
              <label>
                Email:
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div>
              <label>
                Phone:
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={15}
                  pattern="[0-9]{10,15}"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div>
              <label>
                City:
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Zirakpur">Zirakpur</option>
                  <option value="Panchkula">Panchkula</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Property Type:
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                BHK {(form.propertyType === "Apartment" || form.propertyType === "Villa") && <span style={{ color: "red" }}>*</span>}:
                <select
                  name="bhk"
                  value={form.bhk}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  {(form.propertyType !== "Apartment" && form.propertyType !== "Villa") && (
                    <option value="">Not applicable</option>
                  )}
                  <option value="Studio">Studio</option>
                  <option value="One">One</option>
                  <option value="Two">Two</option>
                  <option value="Three">Three</option>
                  <option value="Four">Four</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Purpose:
                <select
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Status:
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Visited">Visited</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Converted">Converted</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Budget Min:
                <input
                  name="budgetMin"
                  type="number"
                  value={form.budgetMin}
                  onChange={handleChange}
                  min="0"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div>
              <label>
                Budget Max:
                <input
                  name="budgetMax"
                  type="number"
                  value={form.budgetMax}
                  onChange={handleChange}
                  min="0"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div>
              <label>
                Timeline:
                <select
                  name="timeline"
                  value={form.timeline}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  <option value="M0_3m">0-3 months</option>
                  <option value="M3_6m">3-6 months</option>
                  <option value="MoreThan6m">More than 6 months</option>
                  <option value="Exploring">Exploring</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Source:
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk_in">Walk-in</option>
                  <option value="Call">Call</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Notes:
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={4}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </label>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "12px 24px",
                  background: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "16px",
                }}
              >
                {saving ? "Saving..." : "Update Buyer"}
              </button>
            </div>
          </form>
        </div>

        {/* History Panel */}
        <div>
          <h3>Change History</h3>
          {buyer?.history && buyer.history.length > 0 ? (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {buyer.history.map((item, index) => (
                <div key={item.id} style={{ 
                  border: "1px solid #ddd", 
                  borderRadius: "4px", 
                  padding: "12px", 
                  marginBottom: "12px",
                  background: "#f9f9f9"
                }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                    {new Date(item.changedAt).toLocaleString()}
                    {item.changedByUser && (
                      <span style={{ marginLeft: "8px", fontWeight: "500" }}>
                        by {item.changedByUser.name || item.changedByUser.email}
                      </span>
                    )}
                  </div>
                  {Object.entries(item.diff).map(([field, change]) => (
                    <div key={field} style={{ marginBottom: "4px" }}>
                      <strong>{field}:</strong> 
                      <span style={{ color: "#dc3545" }}> "{change.old || '(empty)'}"</span> 
                      <span style={{ margin: "0 8px", color: "#666" }}>→</span>
                      <span style={{ color: "#28a745" }}>"{change.new || '(empty)'}"</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", fontStyle: "italic" }}>No changes recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
