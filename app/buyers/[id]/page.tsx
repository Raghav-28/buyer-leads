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
  const [form, setForm] = useState({ fullName: "", notes: "" });
  const [message, setMessage] = useState("");
const [history, setHistory] = useState([]);

useEffect(() => {
  if (!buyer) return; // only fetch when buyer exists
  fetch(`/api/buyers/${buyer.id}/history`)
    .then(res => res.json())
    .then(setHistory)
    .catch(console.error);
}, [buyer]);


  useEffect(() => {
    fetchBuyer();
  }, [buyerId]);

  const fetchBuyer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers/${buyerId}`);
      const data = await res.json();
      setBuyer(data);
      setForm({ fullName: data.fullName, notes: data.notes || "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      setMessage("Updated successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!buyer) return <p>Buyer not found</p>;

  return (
   <div>
  <h1>Buyer Details</h1>
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

  <h2>Edit Buyer</h2>
  <div>
    <label>
      Full Name:
      <input
        type="text"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
    </label>
  </div>
  <div>
    <label>
      Notes:
      <textarea
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
    </label>
  </div>
  <button onClick={handleUpdate}>Update</button>
  {message && <p>{message}</p>}

 <h2>Recent Changes</h2>
<div>
  {history.length === 0 && <p>No changes yet</p>}
  {history.map((h) => (
    <div key={h.id} style={{ border: '1px solid #ccc', marginBottom: '8px', padding: '4px' }}>
      <p><strong>Changed by:</strong> {h.changedBy} | <strong>At:</strong> {new Date(h.changedAt).toLocaleString()}</p>
      <pre>{JSON.stringify(h.diff, null, 2)}</pre>
    </div>
  ))}
</div>

</div>

  );
}
