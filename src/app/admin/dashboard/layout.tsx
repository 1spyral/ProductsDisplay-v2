"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-slate-800 border-b-4 border-slate-900">
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold uppercase tracking-wide">
            Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-6 uppercase tracking-wide transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

