"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

type HistoryItem = {
  id: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
};

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
  status: string;
  source?: string;
  notes?: string;
  tags?: string;
  updatedAt: string;
  ownerId: string;
  history?: HistoryItem[];
};

export default function BuyerDetailPage() {
  const params = useParams();
  const buyerId = params.id;
  const { data: session, status } = useSession();

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Buyer>>({});
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    fetchBuyer();
  }, [buyerId]);

  useEffect(() => {
    if (!buyer) return;
    setForm({ ...buyer });
    fetchHistory();
  }, [buyer]);

  const fetchBuyer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers/${buyerId}`);
      const data = await res.json();
      setBuyer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/buyers/${buyerId}/history`);
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = (): boolean => {
    if (!form.fullName || form.fullName.length < 2) {
      setValidationError("Full name must be at least 2 characters");
      return false;
    }
    if (!form.phone || !/^\d{10,15}$/.test(form.phone)) {
      setValidationError("Phone must be 10–15 digits");
      return false;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setValidationError("Invalid email format");
      return false;
    }
    if (
      form.budgetMin !== undefined &&
      form.budgetMax !== undefined &&
      form.budgetMax < form.budgetMin
    ) {
      setValidationError("Budget Max must be ≥ Budget Min");
      return false;
    }
    if (
      (form.propertyType === "Apartment" || form.propertyType === "Villa") &&
      !form.bhk
    ) {
      setValidationError("BHK is required for Apartment/Villa");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      const res = await fetch(`/api/buyers/${buyerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setBuyer(data);
      setMessage("Buyer updated successfully!");
      fetchHistory();
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message);
    }
  };

  if (status === "loading") return <p>Checking authentication...</p>;
  if (!session)
    return (
      <div>
        <p>You must sign in to view buyer details.</p>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );

  if (loading) return <p>Loading...</p>;
  if (!buyer) return <p>Buyer not found</p>;

  const isOwnerOrAdmin =
    session.user?.role === "admin" || session.user?.id === buyer.ownerId;

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "16px" }}>
      <h1>Buyer Details</h1>

      <div
        style={{
          marginBottom: "24px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}
      >
        <p>
          <strong>ID:</strong> {buyer.id}
        </p>
        <p>
          <strong>Email:</strong> {buyer.email}
        </p>
        <p>
          <strong>Phone:</strong> {buyer.phone}
        </p>
        <p>
          <strong>City:</strong> {buyer.city}
        </p>
        <p>
          <strong>Property:</strong> {buyer.propertyType}
        </p>
        <p>
          <strong>BHK:</strong> {buyer.bhk}</p>
        <p>
          <strong>Budget:</strong> {buyer.budgetMin} - {buyer.budgetMax}
        </p>
        <p>
          <strong>Timeline:</strong> {buyer.timeline}
        </p>
        <p>
          <strong>Status:</strong> {buyer.status}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {new Date(buyer.updatedAt).toLocaleString()}
        </p>
      </div>

      {isOwnerOrAdmin ? (
        <>
          <h2>Edit Buyer</h2>
          {validationError && (
            <p style={{ color: "red" }}>{validationError}</p>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullName || ""}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="City"
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <select
              value={form.propertyType || ""}
              onChange={(e) =>
                setForm({ ...form, propertyType: e.target.value })
              }
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
            </select>
            <input
              type="text"
              placeholder="BHK"
              value={form.bhk || ""}
              onChange={(e) => setForm({ ...form, bhk: e.target.value })}
            />
            <input
              type="number"
              placeholder="Budget Min"
              value={form.budgetMin ?? ""}
              onChange={(e) =>
                setForm({ ...form, budgetMin: Number(e.target.value) })
              }
            />
            <input
              type="number"
              placeholder="Budget Max"
              value={form.budgetMax ?? ""}
              onChange={(e) =>
                setForm({ ...form, budgetMax: Number(e.target.value) })
              }
            />
            <input
              type="text"
              placeholder="Timeline"
              value={form.timeline || ""}
              onChange={(e) =>
                setForm({ ...form, timeline: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Source"
              value={form.source || ""}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <select
              value={form.status || ""}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Contacted">Contacted</option>
              <option value="Visited">Visited</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Converted">Converted</option>
              <option value="Dropped">Dropped</option>
            </select>
            <button
              onClick={handleUpdate}
              style={{
                padding: "10px",
                borderRadius: "4px",
                backgroundColor: "#0070f3",
                color: "#fff",
              }}
            >
              Update
            </button>
            {message && <p style={{ color: "green" }}>{message}</p>}
          </div>
        </>
      ) : (
        <p style={{ color: "gray" }}>
          You don’t have permission to edit this buyer.
        </p>
      )}

      <h2>Recent Changes</h2>
      {history.length === 0 && <p>No changes yet</p>}
      {history.map((h) => (
        <div
          key={h.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "8px",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>Changed by:</strong> {h.changedBy} | <strong>At:</strong>{" "}
            {new Date(h.changedAt).toLocaleString()}
          </p>
          <ul>
            {Object.entries(h.diff).map(([field, change]) => (
              <li key={field}>
                <strong>{field}:</strong> {change.old} → {change.new}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
