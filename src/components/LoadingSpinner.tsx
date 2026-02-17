export default function LoadingSpinner() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-50">
      <div className="border-4 border-slate-700 bg-white p-8">
        {/* Spinner */}
        <div className="relative mx-auto mb-4 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-700 border-t-transparent"></div>
        </div>
        {/* Loading text */}
        <p className="text-center text-xl font-bold tracking-wide text-gray-900 uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
