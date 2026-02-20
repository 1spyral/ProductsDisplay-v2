"use client";

import Link from "next/link";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border-2 border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-4 text-base text-slate-700">
          We could not load store information right now. Please try again.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-slate-800 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-5 py-2.5 font-semibold text-slate-800 transition-colors hover:bg-slate-100"
          >
            Go home
          </Link>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-6 text-left text-xs text-slate-500">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
