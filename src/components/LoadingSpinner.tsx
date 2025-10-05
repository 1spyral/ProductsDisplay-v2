export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-50">
      <div className="bg-white border-4 border-slate-700 p-8">
        {/* Spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-gray-300"></div>
          <div className="absolute inset-0 border-4 border-slate-700 border-t-transparent animate-spin"></div>
        </div>
        {/* Loading text */}
        <p className="text-xl font-bold text-gray-900 uppercase tracking-wide text-center">
          Loading...
        </p>
      </div>
    </div>
  );
}
