import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Categories",
};

export default function AdminCategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
