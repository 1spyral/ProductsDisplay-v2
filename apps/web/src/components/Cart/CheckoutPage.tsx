"use client";

import type { CreateOrderRequestDto } from "@productsdisplay/contracts";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { submitOrder } from "@/actions/order";
import { useCart } from "@/contexts/CartContext";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/phone";

type CheckoutFormState = {
  name: string;
  email: string;
  phone: string;
  additionalComments: string;
};

const INITIAL_FORM_STATE: CheckoutFormState = {
  name: "",
  email: "",
  phone: "",
  additionalComments: "",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to submit quote request. Please try again.";
}

export default function CheckoutPage() {
  const { items, totalItems, clearCart, setCartOpen } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange =
    (field: keyof CheckoutFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const additionalComments = form.additionalComments.trim();
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : "";

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!email && !phone) {
      setError("Please provide an email address or phone number.");
      return;
    }

    if (phone && !isValidPhoneNumber(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload: CreateOrderRequestDto = {
        name,
        email: email || null,
        phone: normalizedPhone || null,
        additionalComments: additionalComments || null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const result = await submitOrder(payload);

      clearCart();
      setCartOpen(false);
      router.push(
        `/checkout/success?reference=${encodeURIComponent(result.id)}`
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-full bg-gray-50 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl border-4 border-gray-300 bg-white p-8">
          <h1 className="text-3xl font-bold text-gray-900">Get Quote</h1>
          <p className="mt-4 text-base text-gray-700">
            Your cart is empty. Add products before requesting a quote.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex bg-slate-700 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-slate-900"
          >
            Return to Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border-4 border-gray-300 bg-white p-6 sm:p-8">
          <div className="border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Get Quote</h1>
            <p className="mt-2 text-sm font-medium tracking-wide text-gray-600 uppercase">
              Review your cart before requesting a quote
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={88}
                    height={88}
                    className="h-24 w-24 shrink-0 border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-gray-200 bg-gray-100 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
                    No Image
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {item.productName}
                    </h2>
                    <span className="text-sm font-bold tracking-wide text-gray-500 uppercase">
                      Qty {item.quantity}
                    </span>
                  </div>
                  {item.price && (
                    <p className="mt-1 text-base font-semibold text-orange-600">
                      {item.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t-2 border-gray-300 pt-4">
            <p className="text-sm font-bold tracking-wide text-gray-700 uppercase">
              Total Items: {totalItems}
            </p>
          </div>
        </section>

        <section className="border-4 border-slate-700 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
          <p className="mt-2 text-sm text-gray-600">
            Include at least one way for us to reach you.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="checkout-name"
                className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
              >
                Name
              </label>
              <input
                id="checkout-name"
                type="text"
                value={form.name}
                onChange={handleFieldChange("name")}
                className="w-full border-2 border-gray-300 px-4 py-3 focus:border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="checkout-email"
                className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
              >
                Email Address
              </label>
              <input
                id="checkout-email"
                type="email"
                value={form.email}
                onChange={handleFieldChange("email")}
                className="w-full border-2 border-gray-300 px-4 py-3 focus:border-slate-700 focus:outline-none"
              />
            </div>

            <p className="-my-1 text-center text-xs text-gray-400">or</p>

            <div>
              <label
                htmlFor="checkout-phone"
                className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
              >
                Phone Number
              </label>
              <input
                id="checkout-phone"
                type="tel"
                value={form.phone}
                onChange={handleFieldChange("phone")}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 123-4567"
                className="w-full border-2 border-gray-300 px-4 py-3 focus:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-comments"
                className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
              >
                Additional Comments
              </label>
              <textarea
                id="checkout-comments"
                value={form.additionalComments}
                onChange={handleFieldChange("additionalComments")}
                rows={5}
                className="w-full border-2 border-gray-300 px-4 py-3 focus:border-slate-700 focus:outline-none"
              />
            </div>

            {error && (
              <div className="border-2 border-red-600 bg-red-100 px-4 py-3">
                <p className="text-sm font-bold text-red-900">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-700 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Quote"}
            </button>
            <p className="text-center text-sm text-gray-600">
              We&apos;ll follow up with you shortly.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
