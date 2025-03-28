"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function OnboardingScreen() {
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Update avatar when nickname changes
  useEffect(() => {
    if (nickname.trim()) {
      setAvatarUrl(
        `https://api.dicebear.com/7.x/big-smile/svg?seed=${encodeURIComponent(nickname)}`,
      );
    } else {
      setAvatarUrl("");
    }
  }, [nickname]);

  const handleContinue = () => {
    if (nickname.trim()) {
      // Navigate to next screen
      console.log(`User nickname: ${nickname}`);
      // Example: router.push('/character-selection')
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50 p-6">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-700">Welcome!</h1>
        </header>

        <Card className="overflow-hidden rounded-2xl border-0 p-6 shadow-md">
          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-purple-400 bg-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl || "/placeholder.svg"}
                  alt="Your avatar"
                  className="h-full w-full"
                />
              ) : (
                <User className="h-12 w-12 text-purple-400" />
              )}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring focus:ring-purple-200"
            />
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!nickname.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-lg font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
