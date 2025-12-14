"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
};

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
      const result = await loginAdmin(password);

      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Invalid password");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md border-4 border-slate-700 bg-white p-8">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-wide text-gray-900 uppercase">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-3 border-gray-400 px-4 py-3 transition-colors focus:border-slate-700 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="border-2 border-red-600 bg-red-100 p-3 text-center">
              <p className="text-sm font-bold text-red-900 uppercase">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 py-3 font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-slate-900 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
