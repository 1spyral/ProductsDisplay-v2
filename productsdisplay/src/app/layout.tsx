import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import { ScrollProvider } from "@/context/ScrollContext";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-white antialiased"
      >
        <Navbar />
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}
