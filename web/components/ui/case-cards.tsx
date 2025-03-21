"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Clock, Heart } from "lucide-react";

export type Step = {
    tick: number;
    budget: number;
    isBudgetKnown: boolean;
    joy: number;
    isJoyKnown: boolean;
    freeTime: number;
    isFreeTimeKnown: boolean;
};

export type Case = {
    id: number;
    personName: string;
    profilePic: string;
    caseLLMDescription: string;
    initialStep: Step;
};

// Case data
const caseData: Case[] = [
    {
        id: 1,
        personName: "John Doe",
        profilePic: "/avatars/john.png",
        caseLLMDescription: "John is facing financial difficulties after a recent job loss.",
        initialStep: {
            tick: 1,
            budget: 5000,
            isBudgetKnown: true,
            joy: 75,
            isJoyKnown: true,
            freeTime: 20,
            isFreeTimeKnown: true,
        },
    },
    {
        id: 2,
        personName: "Jane Smith",
        profilePic: "/avatars/jane.png",
        caseLLMDescription: "Jane is balancing her studies with a part-time job.",
        initialStep: {
            tick: 1,
            budget: 2000,
            isBudgetKnown: true,
            joy: 85,
            isJoyKnown: true,
            freeTime: 15,
            isFreeTimeKnown: false,
        },
    },
    {
        id: 3,
        personName: "Alex Johnson",
        profilePic: "/avatars/alex.png",
        caseLLMDescription: "Alex recently moved to a new city and is adjusting to the change.",
        initialStep: {
            tick: 1,
            budget: 3000,
            isBudgetKnown: false,
            joy: 60,
            isJoyKnown: true,
            freeTime: 10,
            isFreeTimeKnown: true,
        },
    },
];

export function CaseCards() {
    const [hoveredCase, setHoveredCase] = useState<number | null>(null);

    return (
        <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
            {caseData.map((caseItem, index) => (
                <Card
                    key={caseItem.id}
                    className="cursor-pointer transition-all duration-1000 hover:shadow-lg relative overflow-hidden h-60 w-full"
                    onMouseEnter={() => setHoveredCase(caseItem.id)}
                    onMouseLeave={() => setHoveredCase(null)}
                >
                    <CardContent className="p-6 h-full flex flex-row items-center space-x-6">
                        {/* Profile Picture */}
                        <img src={caseItem.profilePic} alt={`Case ${index + 1} profile`} className="w-48 h-48 rounded-full object-cover" />

                        {/* Case Info */}
                        <div className="flex flex-col flex-grow">
                            <h3 className="text-2xl font-bold">{hoveredCase === caseItem.id ? caseItem.personName : `Case ${index + 1}`}</h3>

                            <div className={`transition-opacity duration-300 ${hoveredCase === caseItem.id ? "opacity-100" : "opacity-0 hidden"}`}>
                                <p className="text-lg">{caseItem.caseLLMDescription}</p>

                                {/* Step Info */}
                                <div className="flex space-x-6 mt-3">
                                    {caseItem.initialStep.isBudgetKnown && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-14 h-14 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
                                                <PiggyBank className="h-7 w-7 text-[#58CC02]" />
                                            </div>
                                            <span className="text-lg font-medium">${caseItem.initialStep.budget}</span>
                                        </div>
                                    )}
                                    {caseItem.initialStep.isJoyKnown && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-14 h-14 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
                                                <Heart className="h-7 w-7 text-[#58CC02]" />
                                            </div>
                                            <span className="text-lg font-medium">{caseItem.initialStep.joy}</span>
                                        </div>
                                    )}
                                    {caseItem.initialStep.isFreeTimeKnown && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-14 h-14 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-7 w-7 text-[#58CC02]" />
                                            </div>
                                            <span className="text-lg font-medium">{caseItem.initialStep.freeTime}h</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
