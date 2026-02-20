import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
