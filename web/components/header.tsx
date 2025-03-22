"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

export function Header() {
	return (
		<header className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-3 flex justify-center items-center">
				<Link href="/" className="flex items-center gap-3">
					<div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg flex items-center justify-center">
						<Trophy className="h-6 w-6 text-white" />
					</div>
					<span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
						MONETA
					</span>
				</Link>
			</div>
		</header>
	);
}
