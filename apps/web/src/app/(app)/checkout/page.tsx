import type { Metadata } from "next";
import CheckoutPage from "@/components/Cart/CheckoutPage";

export const metadata: Metadata = {
  title: "Get Quote",
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}
