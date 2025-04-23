import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ResetDemo } from "@/components/reset-demo";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { Footer } from "@/components/footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Moneta",
	description:
		"Interactive financial literacy platform through life simulations",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
			>
				<ResetDemo />
				<TutorialOverlay />
				<div className="flex-1 flex flex-col">{children}</div>
				<Footer />
			</body>
		</html>
	);
}
