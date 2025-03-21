"use client";

import { useState, useEffect } from "react";
import {
  ActionFactories,
  ActionTypes,
  actions,
  type Step,
  type Action,
} from "@/lib/cases/actions";
import { Case, applyNewAction } from "@/lib/cases/index";

// Sample case
const sampleCase: Case = {
  personName: "Alex",
  caseLLMDescriptipn:
    "Alex is a 25-year-old recent graduate looking to start their financial journey. They have some savings but need to make decisions about jobs, investments, and lifestyle.",
  initialStep: {
    tick: 0,
    budget: 5000,
    isBudgetKnown: true,
    joy: 50,
    isJoyKnown: true,
    freeTime: 100,
    isFreeTimeKnown: true,
    newActions: [],
    appliedActions: [],
  },
};

export default function EngineTestPage() {
  // State for the current case - includes all steps
  const [caseSteps, setCaseSteps] = useState<Step[]>([sampleCase.initialStep]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [availableActions, setAvailableActions] = useState<Action[]>([]);

  // Get the current step
  const currentStep = caseSteps[currentStepIndex];

  // Determine available actions based on current state
  useEffect(() => {
    if (currentStep) {
      const filtered = actions.filter((action) => action.poll(currentStep));
      setAvailableActions(filtered);
    }
  }, [currentStep]);

  // Apply an action to the current case steps
  const applyAction = (action: Action) => {
    // Apply the new action to the current step
    const updatedSteps = applyNewAction([...caseSteps], action);
    const currentUpdatedStep = updatedSteps[currentStepIndex];

    // Create a new step by applying ALL previously applied actions to it
    const appliedActions = [...currentUpdatedStep.appliedActions, action];

    // Start with a clean slate for the next tick
    const baseNextStep: Step = {
      ...currentUpdatedStep,
      tick: currentUpdatedStep.tick + 1,
      newActions: [action],
      appliedActions: [],
    };

    // Apply all accumulated actions to the new step
    let nextStep = baseNextStep;
    appliedActions.forEach((appliedAction) => {
      nextStep = (
        appliedAction.modifier as (
          this: typeof appliedAction,
          state: Step
        ) => Step
      ).call(appliedAction, nextStep);
    });

    // Set the applied actions array for tracking
    nextStep.appliedActions = appliedActions;

    setCaseSteps([...updatedSteps, nextStep]);
    setCurrentStepIndex(updatedSteps.length); // Move to the new step
  };

  const resetSimulation = () => {
    setCaseSteps([sampleCase.initialStep]);
    setCurrentStepIndex(0);
  };

  // Navigation through steps
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < caseSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Color indicators based on values
  const getBudgetColor = (budget: number) =>
    budget > 10000
      ? "text-green-600"
      : budget > 2000
      ? "text-yellow-600"
      : "text-red-600";
  const getJoyColor = (joy: number) =>
    joy > 70 ? "text-green-600" : joy > 30 ? "text-yellow-600" : "text-red-600";
  const getFreeTimeColor = (freeTime: number) =>
    freeTime > 50
      ? "text-green-600"
      : freeTime > 20
      ? "text-yellow-600"
      : "text-red-600";

  // Generate diff display between steps
  const getDiff = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff === 0) return <span className="text-gray-500">0</span>;
    return diff > 0 ? (
      <span className="text-green-600">+{diff.toFixed(2)}</span>
    ) : (
      <span className="text-red-600">{diff.toFixed(2)}</span>
    );
  };

  const getStepDiffs = (index: number) => {
    if (index === 0) return null;

    const current = caseSteps[index];
    const previous = caseSteps[index - 1];

    return {
      budget: getDiff(current.budget, previous.budget),
      joy: getDiff(current.joy, previous.joy),
      freeTime: getDiff(current.freeTime, previous.freeTime),
    };
  };

  const diffs = currentStepIndex > 0 ? getStepDiffs(currentStepIndex) : null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">
        Financial Life Simulator - Case Engine Test
      </h1>
      <h2 className="text-xl mb-6">Case: {sampleCase.personName}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Current State (Step {currentStep?.tick})
          </h2>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span>Budget:</span>
              <div>
                <span
                  className={`font-medium ${getBudgetColor(
                    currentStep?.budget
                  )}`}
                >
                  ${currentStep?.budget.toFixed(2)}
                </span>
                {diffs && <span className="ml-2">{diffs.budget}</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span>Joy:</span>
              <div>
                <span
                  className={`font-medium ${getJoyColor(currentStep?.joy)}`}
                >
                  {currentStep?.joy}
                </span>
                {diffs && <span className="ml-2">{diffs.joy}</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span>Free Time:</span>
              <div>
                <span
                  className={`font-medium ${getFreeTimeColor(
                    currentStep?.freeTime
                  )}`}
                >
                  {currentStep?.freeTime} hours
                </span>
                {diffs && <span className="ml-2">{diffs.freeTime}</span>}
              </div>
            </div>
          </div>

          {/* Step navigation */}
          <div className="flex justify-between mt-4 mb-4">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-md ${
                currentStepIndex === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Previous Step
            </button>
            <button
              onClick={goToNextStep}
              disabled={currentStepIndex === caseSteps.length - 1}
              className={`px-4 py-2 rounded-md ${
                currentStepIndex === caseSteps.length - 1
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Next Step
            </button>
          </div>

          <button
            onClick={resetSimulation}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Reset Simulation
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Available Actions ({availableActions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableActions.length === 0 ? (
              <p className="text-gray-500 italic md:col-span-2">
                No actions available with current resources.
              </p>
            ) : (
              availableActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => applyAction(action)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-3 rounded-md transition-colors text-left"
                >
                  <div className="font-medium">{action.name}</div>
                  <div className="text-sm text-gray-600">
                    {action.shortDescription}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {action.kind}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Case Timeline</h2>
        {caseSteps.length <= 1 ? (
          <p className="text-gray-500 italic">No actions performed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caseSteps.slice(1).map((step, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 ${
                      index + 1 === currentStepIndex ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {step.tick}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {step.newActions.map((action) => (
                        <div key={action.name} className="mb-1">
                          <div className="text-sm font-medium text-gray-900">
                            {action.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {action.shortDescription}
                          </div>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${step.budget.toFixed(2)}{" "}
                      {index > 0 &&
                        getDiff(step.budget, caseSteps[index].budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {step.joy}{" "}
                      {index > 0 && getDiff(step.joy, caseSteps[index].joy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {step.freeTime}{" "}
                      {index > 0 &&
                        getDiff(step.freeTime, caseSteps[index].freeTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-2">Case Description</h2>
        <p className="text-gray-700">{sampleCase.caseLLMDescriptipn}</p>
      </div>
    </div>
  );
}
