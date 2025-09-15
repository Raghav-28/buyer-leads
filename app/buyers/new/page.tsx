"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewBuyerForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "One", // Default for Apartment
    purpose: "Buy",
    budgetMin: "",
    budgetMax: "",
    timeline: "M0_3m",
    source: "Website",
    status:"New",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    
    setError(""); // clear error on change
    setMessage("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // convert budget fields to number
    const budgetMin = Number(form.budgetMin);
    const budgetMax = Number(form.budgetMax);

    // client-side validation for budget
    if (!isNaN(budgetMin) && !isNaN(budgetMax) && budgetMax < budgetMin) {
      setError("Budget Max must be greater than or equal to Budget Min");
      setLoading(false);
      return;
    }

    // BHK validation for Apartment and Villa
    if ((form.propertyType === "Apartment" || form.propertyType === "Villa") && !form.bhk) {
      setError("BHK is required for Apartment and Villa property types");
      setLoading(false);
      return;
    }

    // Full name validation
    if (form.fullName.length < 2) {
      setError("Full Name must be at least 2 characters");
      setLoading(false);
      return;
    }

    // Phone validation
    if (form.phone.length < 10 || form.phone.length > 15) {
      setError("Phone number must be between 10 and 15 digits");
      setLoading(false);
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
        bhk: "One", // Default for Apartment
        purpose: "Buy",
        budgetMin: "",
        budgetMax: "",
        timeline: "M0_3m",
        source: "Website",
        status:"New",
        notes: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "800px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #0070f3 0%, #0051a2 100%)", 
          color: "white", 
          padding: "24px",
          textAlign: "center"
        }}>
          <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "600" }}>
            Create New Buyer Lead
          </h1>
          <p style={{ margin: "8px 0 0 0", opacity: "0.9" }}>
            Fill in the details to add a new buyer lead
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: "32px" }}>
          {message && (
            <div style={{ 
              color: "green", 
              background: "#f0f8f0", 
              padding: "12px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              border: "1px solid #c3e6c3"
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ 
              color: "red", 
              background: "#ffe6e6", 
              padding: "12px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              border: "1px solid #ffb3b3"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Full Name *
              </label>
              <input
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={80}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Phone *
              </label>
              <input
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={15}
                pattern="[0-9]{10,15}"
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                City *
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              >
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Zirakpur">Zirakpur</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Property Type *
              </label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Office">Office</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                BHK {(form.propertyType === "Apartment" || form.propertyType === "Villa") && <span style={{ color: "red" }}>*</span>}
              </label>
              <select
                name="bhk"
                value={form.bhk}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
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
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Purpose *
              </label>
              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              >
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Timeline *
              </label>
              <select
                name="timeline"
                value={form.timeline}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              >
                <option value="M0_3m">0-3 months</option>
                <option value="M3_6m">3-6 months</option>
                <option value="MoreThan6m">More than 6 months</option>
                <option value="Exploring">Exploring</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Source *
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk_in">Walk-in</option>
                <option value="Call">Call</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Budget Min (INR)
              </label>
              <input
                name="budgetMin"
                type="number"
                value={form.budgetMin}
                onChange={handleChange}
                min="0"
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Budget Max (INR)
              </label>
              <input
                name="budgetMax"
                type="number"
                value={form.budgetMax}
                onChange={handleChange}
                min="0"
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.2s",
                  resize: "vertical"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "16px", justifyContent: "center", marginTop: "20px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "16px 32px",
                  background: loading ? "#ccc" : "linear-gradient(135deg, #0070f3 0%, #0051a2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  minWidth: "150px"
                }}
                onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.transform = "translateY(-2px)")}
                onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.transform = "translateY(0)")}
              >
                {loading ? "Creating..." : "Create Buyer"}
              </button>
              
              <Link 
                href="/buyers"
                style={{
                  padding: "16px 32px",
                  background: "transparent",
                  color: "#0070f3",
                  border: "2px solid #0070f3",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  minWidth: "150px",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.background = "#0070f3";
                  (e.target as HTMLElement).style.color = "white";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.color = "#0070f3";
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
