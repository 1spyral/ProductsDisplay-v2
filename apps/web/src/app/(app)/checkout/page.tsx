import CheckoutPage from "@/components/Cart/CheckoutPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}
