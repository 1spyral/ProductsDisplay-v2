import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quote Submitted",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[] }>;
}) {
  const { reference } = await searchParams;
  const quoteReference = Array.isArray(reference) ? reference[0] : reference;

  return (
    <div className="min-h-full bg-gray-50 px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl border-4 border-slate-700 bg-white p-8 text-center sm:p-10">
        <p className="text-sm font-bold tracking-[0.3em] text-green-700 uppercase">
          Quote Request Received
        </p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Quote submitted successfully
        </h1>
        <p className="mt-4 text-base text-gray-700">
          We&apos;ve saved your cart and contact details. Keep this quote
          reference for follow-up.
        </p>

        {quoteReference && (
          <div className="mt-6 border-2 border-gray-300 bg-gray-50 px-6 py-4">
            <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
              Reference Number
            </p>
            <p className="mt-2 break-all text-xl font-semibold text-gray-900">
              {quoteReference}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex bg-slate-700 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-slate-900"
        >
          Return to Shopping
        </Link>
      </div>
    </div>
  );
}
