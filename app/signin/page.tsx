"use client";

import { useState } from "react";
import { delay } from "@/lib/slow";
import { bumpSignup } from "./actions";

type Result = "none" | "success" | "fail";

export default function SignInPage() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>("none");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult("none");
    await delay(800);

    if (Math.random() < 0.5) {
      await bumpSignup();
      setResult("success");
      setPending(false);
      return;
    }

    setResult("fail");
    setPending(false);
    throw new Error("Authentication failed: invalid credentials");
  }

  return (
    <div className="max-w-sm mx-auto min-h-[60vh] flex flex-col justify-center cascade">
      <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)] mb-4">
        ACCESS &middot; CHALLENGE
      </p>
      <h1 className="font-display text-5xl mb-8">Specimen sign-in.</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block">
          <span className="block text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)] mb-1">
            EMAIL
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            defaultValue="specimen@lab.test"
            className="block w-full bg-transparent border-0 border-b border-[var(--color-ink)] focus:border-b-2 focus:border-[var(--color-signal)] focus:outline-none py-2 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)] mb-1">
            PASSWORD
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            defaultValue="hunter2"
            className="block w-full bg-transparent border-0 border-b border-[var(--color-ink)] focus:border-b-2 focus:border-[var(--color-signal)] focus:outline-none py-2 text-[14px]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-action w-full"
        >
          {pending ? "AUTHENTICATING …" : "AUTHENTICATE"}
        </button>
      </form>
      {result === "success" ? (
        <p className="mt-6 text-[12px] tracking-[0.16em] uppercase text-[var(--color-signal-dim)] dark:text-[var(--color-signal)]">
          RESULT · AUTHENTICATED ✓
        </p>
      ) : null}
      {result === "fail" ? (
        <p className="mt-6 text-[12px] tracking-[0.16em] uppercase text-[var(--color-crit)]">
          RESULT · REJECTED ✗
        </p>
      ) : null}
      <p className="mt-10 text-[10px] tracking-[0.18em] uppercase text-[var(--color-mute)]">
        50 / 50 success rate &middot; password input is masked for replay
      </p>
    </div>
  );
}
