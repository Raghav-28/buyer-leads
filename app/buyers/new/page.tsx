"use client";

import { useState } from "react";

export default function NewBuyerForm() {
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
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on change
    setMessage("");
  };

  const handleSubmit = async () => {
    // convert budget fields to number
    const budgetMin = Number(form.budgetMin);
    const budgetMax = Number(form.budgetMax);

    // client-side validation for budget
    if (!isNaN(budgetMin) && !isNaN(budgetMax) && budgetMax < budgetMin) {
      setError("Budget Max must be greater than or equal to Budget Min");
      return;
    }

    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, budgetMin, budgetMax }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create buyer");
      setMessage("Buyer created successfully!");
      setForm({
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
        notes: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>New Buyer</h1>
      <div>
        <label>
          Full Name:
          <input name="fullName" type="text" value={form.fullName} onChange={handleChange} />
        </label>
      </div>

      <div>
        <label>
          Email:
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </label>
      </div>

      <div>
        <label>
          Phone:
          <input name="phone" type="text" value={form.phone} onChange={handleChange} />
        </label>
      </div>

      <div>
        <label>
          City:
          <select name="city" value={form.city} onChange={handleChange}>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Property Type:
          <select name="propertyType" value={form.propertyType} onChange={handleChange}>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          BHK:
          <select name="bhk" value={form.bhk} onChange={handleChange}>
            <option>Studio</option>
            <option>One</option>
            <option>Two</option>
            <option>Three</option>
            <option>Four</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Purpose:
          <select name="purpose" value={form.purpose} onChange={handleChange}>
            <option>Buy</option>
            <option>Rent</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Budget Min:
          <input name="budgetMin" type="number" value={form.budgetMin} onChange={handleChange} />
        </label>
      </div>

      <div>
        <label>
          Budget Max:
          <input name="budgetMax" type="number" value={form.budgetMax} onChange={handleChange} />
        </label>
      </div>

      <div>
        <label>
          Timeline:
          <select name="timeline" value={form.timeline} onChange={handleChange}>
            <option>M0_3m</option>
            <option>M3_6m</option>
            <option>MoreThan6m</option>
            <option>Exploring</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Source:
          <select name="source" value={form.source} onChange={handleChange}>
            <option>Website</option>
            <option>Referral</option>
            <option>Walk_in</option>
            <option>Call</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Notes:
          <textarea name="notes" value={form.notes} onChange={handleChange}></textarea>
        </label>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <button onClick={handleSubmit}>Add Buyer</button>
    </div>
  );
}
