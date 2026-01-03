"use client";

import { logoutAdmin } from "@/actions/admin";
import Link from "next/link";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = async () => {
    await logoutAdmin();
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Admin Header */}
      <header className="border-b-4 border-slate-900 bg-slate-800">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <Link
            href="/admin/dashboard"
            className="text-2xl font-bold tracking-wide text-white uppercase"
          >
            Admin Panel
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-700 px-6 py-2 font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-red-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
