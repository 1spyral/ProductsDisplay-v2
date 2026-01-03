import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoreInfo } from "@/db/queries/storeInfoQueries";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreInfo();
  const siteName = store.name || "Store";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full flex-col overflow-hidden bg-white antialiased">
        <Navbar />
        <div className="flex grow flex-col overflow-x-hidden overflow-y-auto">
          <div className="flex grow flex-col">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
