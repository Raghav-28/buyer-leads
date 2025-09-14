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
    bhk: "One",
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: "28px", 
            fontWeight: "600",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
             New Buyer Registration
          </h1>
          <p style={{ 
            margin: "8px 0 0 0", 
            fontSize: "16px", 
            opacity: 0.9 
          }}>
            Add a new buyer lead to your system
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: "40px" }}>
          
          {/* Personal Information Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ 
              color: "#0070f3", 
              marginBottom: "20px", 
              fontSize: "18px",
              fontWeight: "600",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "8px"
            }}>
               Personal Information
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
              gap: "20px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Full Name *
                </label>
                <input 
                  name="fullName" 
                  type="text" 
                  value={form.fullName} 
                  onChange={handleChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Email
                </label>
                <input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Phone *
                </label>
                <input 
                  name="phone" 
                  type="text" 
                  value={form.phone} 
                  onChange={handleChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>
            </div>
          </div>

          {/* Property Information Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ 
              color: "#0070f3", 
              marginBottom: "20px", 
              fontSize: "18px",
              fontWeight: "600",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "8px"
            }}>
               Property Information
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "20px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  City *
                </label>
                <select 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Zirakpur">Zirakpur</option>
                  <option value="Panchkula">Panchkula</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Property Type *
                </label>
                <select 
                  name="propertyType" 
                  value={form.propertyType} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  BHK
                </label>
                <select 
                  name="bhk" 
                  value={form.bhk} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="Studio">Studio</option>
                  <option value="One">One</option>
                  <option value="Two">Two</option>
                  <option value="Three">Three</option>
                  <option value="Four">Four</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Purpose *
                </label>
                <select 
                  name="purpose" 
                  value={form.purpose} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ 
              color: "#0070f3", 
              marginBottom: "20px", 
              fontSize: "18px",
              fontWeight: "600",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "8px"
            }}>
               Budget Information
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "20px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Budget Min (?)
                </label>
                <input 
                  name="budgetMin" 
                  type="number" 
                  value={form.budgetMin} 
                  onChange={handleChange}
                  placeholder="e.g., 500000"
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Budget Max (?)
                </label>
                <input 
                  name="budgetMax" 
                  type="number" 
                  value={form.budgetMax} 
                  onChange={handleChange}
                  placeholder="e.g., 1000000"
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ 
              color: "#0070f3", 
              marginBottom: "20px", 
              fontSize: "18px",
              fontWeight: "600",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "8px"
            }}>
               Additional Information
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "20px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Timeline *
                </label>
                <select 
                  name="timeline" 
                  value={form.timeline} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="M0_3m">0-3 months</option>
                  <option value="M3_6m">3-6 months</option>
                  <option value="MoreThan6m">More than 6 months</option>
                  <option value="Exploring">Exploring</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Source *
                </label>
                <select 
                  name="source" 
                  value={form.source} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk_in">Walk-in</option>
                  <option value="Call">Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#495057"
                }}>
                  Status *
                </label>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    border: "2px solid #e9ecef", 
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "white",
                    transition: "border-color 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Visited">Visited</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Converted">Converted</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontSize: "14px", 
                fontWeight: "500",
                color: "#495057"
              }}>
                Notes
              </label>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleChange}
                placeholder="Additional notes about the buyer..."
                rows={4}
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  border: "2px solid #e9ecef", 
                  borderRadius: "8px",
                  fontSize: "16px",
                  resize: "vertical",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{ 
              background: "#f8d7da", 
              color: "#721c24", 
              padding: "15px", 
              borderRadius: "8px", 
              border: "1px solid #f5c6cb",
              marginBottom: "20px",
              fontSize: "14px"
            }}>
               {error}
            </div>
          )}
          
          {message && (
            <div style={{ 
              background: "#d4edda", 
              color: "#155724", 
              padding: "15px", 
              borderRadius: "8px", 
              border: "1px solid #c3e6cb",
              marginBottom: "20px",
              fontSize: "14px"
            }}>
               {message}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "15px", 
            justifyContent: "center",
            marginTop: "30px"
          }}>
            <Link 
              href="/buyers"
              style={{
                padding: "12px 24px",
                background: "#6c757d",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: "none"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#5a6268";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#6c757d";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
               Back to Dashboard
            </Link>
            
            <button 
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "12px 32px",
                background: loading ? "#6c757d" : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(40, 167, 69, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(40, 167, 69, 0.3)";
                }
              }}
            >
              {loading ? " Creating..." : " Add Buyer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
