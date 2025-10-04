export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-800 border-t-4 border-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="text-center">
          <p className="text-gray-200 text-base">
            &copy; {process.env.COPYRIGHT}
          </p>
        </div>
      </div>
    </footer>
  );
}
