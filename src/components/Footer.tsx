export default function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-slate-900 bg-slate-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div className="text-center">
          <p className="text-base text-gray-200">
            &copy; {process.env.COPYRIGHT}
          </p>
        </div>
      </div>
    </footer>
  );
}
