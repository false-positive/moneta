"use client";

import {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useOptimistic,
  startTransition,
} from "react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, type Profile } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import invariant from "tiny-invariant";

const LOADING = Symbol.for("loading");

export default function OnboardingScreen() {
  const existingProfile = useLiveQuery(
    async () => {
      const profile = await db.profiles.get(1);
      invariant(profile, "Profile does not exist");
      return profile;
    },
    [],
    LOADING,
  );

  return existingProfile === LOADING ? null : (
    <ProfileEditor existingProfile={existingProfile} />
  );
}

function ProfileEditor(props: { existingProfile: Profile }) {
  const [profile, patchProfile] = useOptimistic(
    props.existingProfile,
    (prev, update: Partial<Profile>) => ({ ...prev, ...update }),
  );

  // Update avatar when nickname changes
  const avatarUrl = useMemo(
    () =>
      profile.nickname.trim()
        ? `https://api.dicebear.com/7.x/big-smile/svg?seed=${encodeURIComponent(profile.nickname)}`
        : "",
    [profile.nickname],
  );

  const handleContinue = async () => {
    if (!profile.nickname.trim()) return;
  };

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
            value={profile.nickname}
            onChange={(e) => {
              const nickname = e.target.value;
              startTransition(async () => {
                patchProfile({ nickname });
                await db.profiles.update(1, { nickname });
              });
            }}
            className="w-full"
          />

          {/* Continue Button */}
          <Button onClick={handleContinue} disabled={!profile.nickname.trim()}>
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
