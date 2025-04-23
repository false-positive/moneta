export function Footer() {
	return (
		<footer className="border-t border-indigo-100 py-3 mt-auto">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
				<p>© {new Date().getFullYear()} MONETA. All rights reserved.</p>
				<p className="mt-1 max-w-2xl mx-auto">
					This platform is for educational purposes only and we are
					not responsible for any decisions you make. All actions and
					choices you make in real life are entirely your personal
					responsibility.
				</p>
			</div>
		</footer>
	);
}
