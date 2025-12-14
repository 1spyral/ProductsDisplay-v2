import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Products",
};

export default function AdminProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
