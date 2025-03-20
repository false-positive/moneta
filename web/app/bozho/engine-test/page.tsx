"use client";

import { useState, useEffect } from "react";
import {
  ActionFactories,
  ActionTypes,
  actions,
  type Step,
  type Action,
} from "@/lib/levels";

const initialState: Step = {
  tick: 0,
  budget: 5000,
  isBudgetKnown: true,
  happiness: 50,
  isHappinessKnown: true,
  freeTime: 100,
  isFreeTimeKnown: true,
  newActions: [],
  appliedActions: [],
};

export default function EngineTestPage() {
  const [state, setState] = useState<Step>(initialState);
  const [history, setHistory] = useState<
    { action: Action; before: Step; after: Step }[]
  >([]);
  const [availableActions, setAvailableActions] = useState<Action[]>([]);

  // Determine available actions based on current state
  useEffect(() => {
    const filtered = actions.filter((action) => action.poll(state));
    setAvailableActions(filtered);
  }, [state]);

  // Apply an action to the current state
  const applyAction = (action: Action) => {
    const stateBefore = { ...state };
    const newState = action.modifier.call(action, state);

    setState({
      ...newState,
      tick: newState.tick + 1,
      appliedActions: [...newState.appliedActions, action],
    });

    setHistory((prev) => [
      ...prev,
      {
        action,
        before: stateBefore,
        after: newState,
      },
    ]);
  };

  const resetSimulation = () => {
    setState(initialState);
    setHistory([]);
  };

  // Color indicators based on values
  const getBudgetColor = (budget: number) =>
    budget > 10000
      ? "text-green-600"
      : budget > 2000
      ? "text-yellow-600"
      : "text-red-600";
  const getHappinessColor = (happiness: number) =>
    happiness > 70
      ? "text-green-600"
      : happiness > 30
      ? "text-yellow-600"
      : "text-red-600";
  const getFreeTimeColor = (freeTime: number) =>
    freeTime > 50
      ? "text-green-600"
      : freeTime > 20
      ? "text-yellow-600"
      : "text-red-600";

  // Generate diff display for history entries
  const getDiff = (before: number, after: number) => {
    const diff = after - before;
    if (diff === 0) return <span className="text-gray-500">0</span>;
    return diff > 0 ? (
      <span className="text-green-600">+{diff.toFixed(2)}</span>
    ) : (
      <span className="text-red-600">{diff.toFixed(2)}</span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Financial Life Simulator - Engine Test
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span>Tick:</span>
              <span className="font-medium">{state.tick}</span>
            </div>
            <div className="flex justify-between">
              <span>Budget:</span>
              <span className={`font-medium ${getBudgetColor(state.budget)}`}>
                ${state.budget.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Happiness:</span>
              <span
                className={`font-medium ${getHappinessColor(state.happiness)}`}
              >
                {state.happiness}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Free Time:</span>
              <span
                className={`font-medium ${getFreeTimeColor(state.freeTime)}`}
              >
                {state.freeTime} hours
              </span>
            </div>
          </div>
          <button
            onClick={resetSimulation}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
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
        <h2 className="text-lg font-semibold mb-4">Action History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 italic">No actions performed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tick
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Happiness
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.before.tick}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.action.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.action.shortDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${entry.before.budget.toFixed(2)}{" "}
                      {getDiff(entry.before.budget, entry.after.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.before.happiness}{" "}
                      {getDiff(entry.before.happiness, entry.after.happiness)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.before.freeTime}{" "}
                      {getDiff(entry.before.freeTime, entry.after.freeTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
