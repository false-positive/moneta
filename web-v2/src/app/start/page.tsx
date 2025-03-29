"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";

const LOADING = Symbol.for("loading");

export default function OnboardingScreen() {
  const existingProfile = useLiveQuery(
    () => db.profiles.limit(1).last(),
    [],
    LOADING,
  );

  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (existingProfile !== LOADING && existingProfile) {
      setNickname(existingProfile.nickname);
    }
  }, [existingProfile]);

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

  const handleContinue = async () => {
    if (!nickname.trim()) return;

    if (existingProfile && existingProfile !== LOADING) {
      await db.profiles.update(existingProfile.id, { nickname });
    } else {
      await db.profiles.add({ nickname });
    }

    // router.push("/");
  };

  if (existingProfile === LOADING) {
    return null;
  }

  return (
    <div className="fade-in animate-in flex min-h-screen flex-col items-center justify-center p-6 duration-500">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Welcome to Moneta!</h1>
        </header>

        <Card className="p-6">
          {/* Avatar */}
          <div className="flex justify-center pb-2">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 bg-white p-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="h-full w-full"
                />
              ) : (
                <User className="text-border h-12 w-12" />
              )}
            </div>
          </div>

          {/* Nickname Input */}
          <Input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full"
          />

          {/* Continue Button */}
          <Button onClick={handleContinue} disabled={!nickname.trim()}>
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
