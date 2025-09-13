"use client";

import { useEffect, useState } from "react";

type Buyer = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string | null;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  source: string;
  status: string;
  notes: string | null;
  tags: string[];
  ownerId: string;
  updatedAt: string;
};

type BuyerHistory = {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, any>;
};

export default function BuyerDetailPage({ params }: { params: { id: string } }) {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [buyerRes, historyRes] = await Promise.all([
          fetch(`/api/buyers/${params.id}`),
          fetch(`/api/buyers/${params.id}/history?limit=5`),
        ]);

        if (!buyerRes.ok) throw new Error("Failed to fetch buyer");
        if (!historyRes.ok) throw new Error("Failed to fetch history");

        const buyerData = await buyerRes.json();
        const historyData = await historyRes.json();

        setBuyer(buyerData);
        setHistory(historyData.histories ?? []);
      } catch (err) {
        console.error("Error fetching buyer detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!buyer) return <p className="p-4">Buyer not found</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Buyer Info */}
      <section className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold">{buyer.fullName}</h1>
        <p className="text-gray-600">{buyer.email} | {buyer.phone}</p>
        <p className="text-sm text-gray-500">
          {buyer.city} • {buyer.propertyType} • {buyer.bhk}
        </p>
        <p className="mt-2">Status: <span className="font-semibold">{buyer.status}</span></p>
        <p className="mt-1 text-gray-700">Notes: {buyer.notes ?? "—"}</p>
      </section>

      {/* Buyer History */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Changes</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No history yet.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((h) => (
              <li key={h.id} className="border-b pb-3">
                <p className="text-sm text-gray-500">
                  Changed by {h.changedBy} on{" "}
                  {new Date(h.changedAt).toLocaleString()}
                </p>
                <div className="ml-2 mt-1 text-sm">
                  {Object.entries(h.diff).map(([field, change]) => (
                    <p key={field}>
                      <span className="font-medium">{field}</span>:{" "}
                      <span className="line-through text-red-500">{change.old ?? "—"}</span>{" "}
                      → <span className="text-green-600">{change.new ?? "—"}</span>
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
