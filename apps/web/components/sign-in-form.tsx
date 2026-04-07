"use client";

import { useTransition } from "react";

import {
  googleAuthAction,
  magicLinkAction,
  signInAction,
} from "@/lib/actions/auth";

interface SignInFormProps {
  next: string;
  labels: {
    email: string;
    password: string;
    signIn: string;
    magicLink: string;
    google: string;
  };
}

export function SignInForm({ next, labels }: SignInFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(action: (fd: FormData) => Promise<void>) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      startTransition(() => action(fd));
    };
  }

  function handleButtonAction(action: (fd: FormData) => Promise<void>) {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const form = e.currentTarget.closest("form") as HTMLFormElement;
      const fd = new FormData(form);
      startTransition(() => action(fd));
    };
  }

  return (
    <form onSubmit={handleSubmit(signInAction)} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block space-y-2">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-mocha-earth">
          {labels.email}
        </span>
        <input
          name="email"
          type="email"
          required
          disabled={pending}
          className="w-full px-4 py-3 disabled:opacity-60"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-mocha-earth">
          {labels.password}
        </span>
        <input
          name="password"
          type="password"
          required
          disabled={pending}
          className="w-full px-4 py-3 disabled:opacity-60"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border-4 border-mocha-earth bg-mocha-earth px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-vanilla-cream whitespace-nowrap transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-banana-split hover:text-mocha-earth hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:translate-x-0 disabled:translate-y-0"
        style={{ boxShadow: "4px 4px 0px var(--banana-split)" }}
      >
        {pending ? "..." : labels.signIn}
      </button>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={handleButtonAction(magicLinkAction)}
          className="rounded-full border-4 border-mocha-earth bg-lavender-haze px-5 py-3 text-sm font-black whitespace-nowrap text-mocha-earth transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
          style={{ boxShadow: "4px 4px 0px var(--mocha-earth)" }}
        >
          {labels.magicLink}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={handleButtonAction(googleAuthAction)}
          className="rounded-full border-4 border-mocha-earth bg-strawberry-milk px-5 py-3 text-sm font-black whitespace-nowrap text-mocha-earth transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
          style={{ boxShadow: "4px 4px 0px var(--mocha-earth)" }}
        >
          {labels.google}
        </button>
      </div>
    </form>
  );
}
