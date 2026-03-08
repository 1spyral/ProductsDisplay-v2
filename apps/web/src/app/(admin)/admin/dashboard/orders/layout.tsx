import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Orders",
};

export default function AdminOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
