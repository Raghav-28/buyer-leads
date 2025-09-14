"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/signup" });
  };

  return (
    <header style={{ 
      padding: "16px", 
      background: "#f4f4f4", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center" 
    }}>
      <div>
        <h1 style={{ margin: 0 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            Buyer Leads Dashboard
          </Link>
        </h1>
      </div>
      
      {status === "loading" ? (
        <div>Loading...</div>
      ) : session ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>
            Welcome, {session.user.name || session.user.email} ({session.user.role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <Link 
            href="/login" 
            style={{ 
              padding: "6px 12px", 
              background: "#0070f3", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: "4px" 
            }}
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            style={{ 
              padding: "6px 12px", 
              background: "#28a745", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: "4px" 
            }}
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}
