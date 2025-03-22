"use client";

import { useEffect } from "react";

/**
 * ResetDemo component that listens for Ctrl+Shift+Alt+\ key combination
 * and clears localStorage and navigates to the root when triggered
 */
export function ResetDemo() {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.ctrlKey &&
				event.shiftKey &&
				event.altKey &&
				event.key === "|"
			) {
				console.log(
					"Reset shortcut detected! Clearing localStorage and resetting..."
				);

				// Clear local storage
				localStorage.clear();

				// Navigate to root
				window.location.href = "/";
			}
		};

		// Add event listener
		window.addEventListener("keydown", handleKeyDown);

		// Clean up the event listener when component unmounts
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	console.log("ResetDemo is enabled");

	// This component doesn't render anything visible
	return null;
}

export default ResetDemo;
