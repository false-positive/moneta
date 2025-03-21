"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {actions} from "@/lib/cases/actions";

export default function QuizPage() {
	const categorizedActions = actions.reduce((acc, action) => {
		let group = acc.find((g) => g.kind === action.kind);
		if (!group) {
			group = { kind: action.kind, actions: [] };
			acc.push(group);
		}
		// @ts-expect-error because yes
		group.actions.push(action);
		return acc;
	}, [] as { kind: string; actions: never[] }[]);

	const router = useRouter();

	const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string>>({});

	const currentChoice = categorizedActions[currentChoiceIndex];

	const handleOptionSelect = (value: string) => {
		setAnswers((prev) => ({
			...prev,
			[currentChoice.kind]: value,
		}));
	};

	const goToNextChoice = () => {
		if (currentChoiceIndex < categorizedActions.length - 1) {
			setCurrentChoiceIndex(currentChoiceIndex + 1);
		}
	};

	const goToPreviousChoice = () => {
		if (currentChoiceIndex > 0) {
			setCurrentChoiceIndex(currentChoiceIndex - 1);
		}
	};

	const isFirstChoice = currentChoiceIndex === 0;
	const isLastChoice = currentChoiceIndex === categorizedActions.length - 1;
	// @ts-expect-error because yes
	const currentAnswer = answers[currentChoice.kind] || "";

	return (
		<div className="w-full h-screen flex flex-col bg-background">
			<div className="absolute top-4 left-4">
				<Button
					variant="outline"
					onClick={() => {
						router.push("/chat");
					}}
					className="flex items-center gap-2"
				>
					<ChevronLeft className="h-4 w-4" />
					Back
				</Button>
			</div>
			<Card className="flex-1 flex flex-col m-0 rounded-none border-0">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">
						{/* Capitalize */}
						{currentChoice.kind
							.split('_')
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' ')}
					</CardTitle>
					<CardDescription className="text-lg">
						What will Iva do?
					</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
						{currentChoice.actions.map((option) => (
							<div
								key={option.name}
								className={`
                  p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${
						currentAnswer === option.name
							? "border-primary bg-primary/10"
							: "border-border hover:border-primary/50 hover:bg-muted"
					}
                `}
								onClick={() => handleOptionSelect(option.name)}
							>
								<div className="flex items-center justify-between">
									<span className="text-lg font-medium">
										{option.name}
									</span>
									{currentAnswer === option.name && (
										<Check className="h-5 w-5 text-primary" />
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
				<CardFooter className="flex justify-between items-center p-4 sm:p-6">
					<Button
						variant="outline"
						onClick={goToPreviousChoice}
						disabled={isFirstChoice}
						className="px-4 py-2"
					>
						<ChevronLeft className="mr-2 h-4 w-4" />
						Previous
					</Button>

					<div className="flex items-center space-x-2">
						{categorizedActions.map((actionCat, index) => (
							<span
								key={index}
								className={`w-3 h-3 rounded-full ${
									index === currentChoiceIndex
										? "bg-primary"
										: actionCat.kind in answers
											? "bg-muted-foreground"
											: "bg-muted"
								}`}
							/>
						))}
					</div>

					{isLastChoice ? (
						<Button
							onClick={() =>
								alert(
									"Quiz completed! Answers: " +
										JSON.stringify(answers),
								)
							}
							className="px-4 py-2"
						>
							Submit
						</Button>
					) : (
						<Button
							onClick={goToNextChoice}
							className="px-4 py-2"
						>
							Next
							<ChevronRight className="ml-2 h-4 w-4" />
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
