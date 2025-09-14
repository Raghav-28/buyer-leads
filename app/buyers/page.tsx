"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

const filteredBuyers = buyers.filter((b) => {
  return (
    (filter.status === "" || b.status === filter.status) &&
    (filter.city === "" || b.city === filter.city)
  );
});

  useEffect(() => {
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

    fetchBuyers();
  }, []);

  if (loading) return <p>Loading buyers...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (buyers.length === 0) return <p>No buyers found</p>;

  return (
    <div>
      <h1>All Buyers</h1>
      <div style={{ marginBottom: "16px" }}>
  <select
    value={filter.status}
    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
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

  <select
    value={filter.city}
    onChange={(e) => setFilter({ ...filter, city: e.target.value })}
  >
    <option value="">All Cities</option>
    <option value="Chandigarh">Chandigarh</option>
    <option value="Mohali">Mohali</option>
    <option value="Zirakpur">Zirakpur</option>
    <option value="Panchkula">Panchkula</option>
    <option value="Other">Other</option>
  </select>
</div>

      <ul>
        {filteredBuyers.map((buyer) => (
          <li key={buyer.id} style={{ marginBottom: "8px" }}>
            <Link href={`/buyers/${buyer.id}`}>
              {buyer.fullName} | {buyer.email} | Status: {buyer.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
