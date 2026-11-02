import AdminSidebar from "./AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
