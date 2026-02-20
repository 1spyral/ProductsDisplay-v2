import type { Metadata } from "next";
import DashboardCard from "./DashboardCard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboard() {
  return (
    <div className="h-full p-8">
      <div className="mb-8 border-4 border-slate-700 bg-white p-8">
        <h1 className="mb-4 text-4xl font-bold tracking-wide text-gray-900 uppercase">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-700">
          Welcome to the admin panel. Product and image management coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Products"
          description="Manage your product catalog"
          href="/admin/dashboard/products"
          cta="View Products →"
        />
        <DashboardCard
          title="PDFs"
          description="Build and compile product PDFs"
          href="/admin/dashboard/pdf"
          cta="Generate PDFs →"
        />
        <DashboardCard
          title="Categories"
          description="Organize product categories"
          href="/admin/dashboard/categories"
          cta="View Categories →"
        />
      </div>
    </div>
  );
}
