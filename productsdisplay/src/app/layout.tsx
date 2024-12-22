import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollProvider } from "@/context/ScrollContext";

export const metadata: Metadata = {
	title: "",
	description: "",
};

export default function RootLayout({ children }: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="h-full">
			<body className="bg-white antialiased h-full flex flex-col overflow-hidden">
				<Navbar />
				<ScrollProvider>
					<div className="flex-grow flex flex-col overflow-y-auto">
						<div className="flex-grow">
							{children}
						</div>
						<Footer />
					</div>
				</ScrollProvider>
			</body>
		</html>
	);
}
