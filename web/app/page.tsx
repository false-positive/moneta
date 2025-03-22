import { CaseCards } from "@/components/case-cards";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Trophy, BarChart3, Target } from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-white">
			<Header />
			<main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 flex-1">
				<div className="max-w-4xl mx-auto">
					<div className="mb-12 text-center">
						<h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
							Help your friends and learn along the way!
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Take on financial quests, solve real-world problems,
							and level up your financial knowledge while helping
							others.
						</p>
					</div>

					{/* Decorative elements */}
					<div className="relative">
						<div className="absolute top-10 right-0 w-20 h-20 rounded-full bg-purple-100 opacity-30 -z-10"></div>
						<div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-indigo-100 opacity-30 -z-10"></div>

						{/* Stats summary */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
							<div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 text-center">
								<div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
									<Trophy className="h-6 w-6 text-indigo-600" />
								</div>
								<h3 className="text-lg font-bold text-indigo-900">
									Unique Quests
								</h3>
								<p className="text-sm text-gray-600">
									Solve real financial challenges in simulated
									environments
								</p>
							</div>

							<div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 text-center">
								<div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
									<Target className="h-6 w-6 text-purple-600" />
								</div>
								<h3 className="text-lg font-bold text-purple-900">
									Level Up
								</h3>
								<p className="text-sm text-gray-600">
									Earn experience and unlock new possibilities
								</p>
							</div>

							<div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 text-center">
								<div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
									<BarChart3 className="h-6 w-6 text-emerald-600" />
								</div>
								<h3 className="text-lg font-bold text-emerald-900">
									Track Growth
								</h3>
								<p className="text-sm text-gray-600">
									See your financial knowledge improve and use
									your knowledge
								</p>
							</div>
						</div>

						<div className="mb-8">
							<h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
								<span className="bg-indigo-600 text-white p-1.5 rounded-lg">
									<Target className="h-5 w-5" />
								</span>
								Available Quests
							</h2>
							<p className="text-gray-600 mt-2">
								Your friends need your financial advice. Learn
								by teaching them how its done!
							</p>
						</div>
						<CaseCards />
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
