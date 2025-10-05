"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else if (response.status === 429) {
        const data = await response.json();
        setError(
          data.error || "Too many login attempts. Please try again later."
        );
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border-4 border-slate-700 p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-6 text-center">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-3 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-600 p-3 text-center">
              <p className="text-red-900 font-bold text-sm uppercase">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-900 text-white font-bold py-3 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
