export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="bg-white border-4 border-slate-700 p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide mb-4">
          Admin Dashboard
        </h1>
        <p className="text-gray-700 text-lg">
          Welcome to the admin panel. Product and image management coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border-3 border-gray-400 p-6">
          <h2 className="text-xl font-bold text-gray-900 uppercase mb-2">
            Products
          </h2>
          <p className="text-gray-600">Manage your product catalog</p>
          <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>

        <div className="bg-white border-3 border-gray-400 p-6">
          <h2 className="text-xl font-bold text-gray-900 uppercase mb-2">
            Images
          </h2>
          <p className="text-gray-600">Upload and manage product images</p>
          <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>

        <div className="bg-white border-3 border-gray-400 p-6">
          <h2 className="text-xl font-bold text-gray-900 uppercase mb-2">
            Categories
          </h2>
          <p className="text-gray-600">Organize product categories</p>
          <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}

