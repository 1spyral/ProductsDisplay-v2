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
		<html lang="en" className="h-full">
			<body className="bg-white antialiased h-full flex flex-col overflow-hidden">
				<Navbar />
				<ScrollProvider>
					<div className="flex-grow overflow-y-auto">
						{children}
					</div>
				</ScrollProvider>
			</body>
		</html>
	);
}
