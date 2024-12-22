import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
				<div className="flex-grow overflow-y-auto flex flex-col">
					<div className="flex-grow flex flex-col">
						{children}
					</div>
					<Footer />
				</div>
			</body>
		</html>
	);
}
