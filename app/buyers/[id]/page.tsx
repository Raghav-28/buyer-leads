"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  notes?: string;
  updatedAt: string;
  ownerId: string;
  history?: HistoryItem[];
};

export default function BuyerDetailPage() {
  const params = useParams();
  const buyerId = params.id;

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fullName: "", notes: "", status: "" });
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetchBuyer();
  }, [buyerId]);

  useEffect(() => {
    if (!buyer) return;
    setForm({ fullName: buyer.fullName, notes: buyer.notes || "", status: buyer.status });
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

  const handleUpdate = async () => {
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
      fetchHistory(); // refresh history
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!buyer) return <p>Buyer not found</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "16px", fontFamily: "sans-serif" }}>
      <h1>Buyer Details</h1>

      <div style={{ marginBottom: "24px", padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}>
        <p><strong>ID:</strong> {buyer.id}</p>
        <p><strong>Email:</strong> {buyer.email}</p>
        <p><strong>Phone:</strong> {buyer.phone}</p>
        <p><strong>City:</strong> {buyer.city}</p>
        <p><strong>Property:</strong> {buyer.propertyType}</p>
        <p><strong>BHK:</strong> {buyer.bhk}</p>
        <p><strong>Budget:</strong> {buyer.budgetMin} - {buyer.budgetMax}</p>
        <p><strong>Timeline:</strong> {buyer.timeline}</p>
        <p><strong>Status:</strong> {buyer.status}</p>
        <p><strong>Updated At:</strong> {new Date(buyer.updatedAt).toLocaleString()}</p>
      </div>

      <h2>Edit Buyer</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
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
          style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#0070f3", color: "#fff", cursor: "pointer", border: "none" }}
        >
          Update
        </button>
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>

      <h2>Recent Changes</h2>
      {history.length === 0 && <p>No changes yet</p>}
      {history.map((h) => (
        <div key={h.id} style={{ border: "1px solid #ccc", marginBottom: "8px", padding: "8px", borderRadius: "4px" }}>
          <p><strong>Changed by:</strong> {h.changedBy} | <strong>At:</strong> {new Date(h.changedAt).toLocaleString()}</p>
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
