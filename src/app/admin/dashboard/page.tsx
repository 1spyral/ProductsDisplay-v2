export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8 border-4 border-slate-700 bg-white p-8">
        <h1 className="mb-4 text-4xl font-bold tracking-wide text-gray-900 uppercase">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-700">
          Welcome to the admin panel. Product and image management coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/dashboard/products"
          className="block border-3 border-gray-400 bg-white p-6 transition-colors hover:border-slate-700"
        >
          <h2 className="mb-2 text-xl font-bold text-gray-900 uppercase">
            Products
          </h2>
          <p className="mb-4 text-gray-600">Manage your product catalog</p>
          <p className="text-sm font-bold text-slate-700 uppercase">
            View Products →
          </p>
        </a>

        <div className="border-3 border-gray-400 bg-white p-6">
          <h2 className="mb-2 text-xl font-bold text-gray-900 uppercase">
            Images
          </h2>
          <p className="text-gray-600">Upload and manage product images</p>
          <p className="mt-4 text-sm text-gray-500">Coming soon...</p>
        </div>

        <div className="border-3 border-gray-400 bg-white p-6">
          <h2 className="mb-2 text-xl font-bold text-gray-900 uppercase">
            Categories
          </h2>
          <p className="text-gray-600">Organize product categories</p>
          <p className="mt-4 text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
