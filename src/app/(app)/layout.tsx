import type { Metadata } from "next";
import React from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoreInfo } from "@/db/queries/storeInfoQueries";

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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <Navbar />
      <div className="flex grow flex-col overflow-x-hidden overflow-y-auto">
        <div className="flex grow flex-col">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
