"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  useEffect(() => {
    if (message) {
      // Show success message for a few seconds
      const timer = setTimeout(() => {
        // Clear the message from URL
        window.history.replaceState({}, "", "/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Redirect to dashboard on successful login
        window.location.href = "/buyers";
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Login</h1>
      
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </label>
        </div>

        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </label>
        </div>

        {error && (
          <div style={{ color: "red", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "#0070f3" }}>
            Sign up here
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div style={{ 
        marginTop: "30px", 
        padding: "16px", 
        background: "#f5f5f5", 
        borderRadius: "4px",
        fontSize: "14px"
      }}>
        <h3>Demo Credentials:</h3>
        <p><strong>Admin:</strong> admin@example.com / admin123</p>
        <p><strong>User:</strong> user@example.com / user123</p>
      </div>
    </div>
  );
}
