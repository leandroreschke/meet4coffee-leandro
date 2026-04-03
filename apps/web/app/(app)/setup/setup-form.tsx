"use client";

import { useEffect } from "react";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { createWorkspaceAction } from "@/lib/actions/workspace";
import {
  initialCreateWorkspaceFormState,
  type CreateWorkspaceFormState,
} from "@/lib/forms/workspace-form-state";

type SetupFormProps = {
  timezoneLabel: string;
  nameLabel: string;
  slugLabel: string;
  hoursStartLabel: string;
  hoursEndLabel: string;
  submitLabel: string;
  timezones: string[];
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-full bg-stone-900 px-5 py-3 font-medium text-stone-50 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
    >
      {pending ? `${label}...` : label}
    </button>
  );
}

export function SetupForm({
  timezoneLabel,
  nameLabel,
  slugLabel,
  hoursStartLabel,
  hoursEndLabel,
  submitLabel,
  timezones,
}: SetupFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createWorkspaceAction, initialCreateWorkspaceFormState);
  const [values, setValues] = useState(initialCreateWorkspaceFormState.values);
  const message = state?.message ?? null;

  useEffect(() => {
    if (state?.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state?.redirectTo]);

  function updateValue<Key extends keyof CreateWorkspaceFormState["values"]>(
    key: Key,
    value: CreateWorkspaceFormState["values"][Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-stone-700">{nameLabel}</span>
        <input
          name="name"
          required
          value={values.name}
          onChange={(event) => updateValue("name", event.target.value)}
          className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
        />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-stone-700">{slugLabel}</span>
        <input
          name="slug"
          required
          value={values.slug}
          onChange={(event) => updateValue("slug", event.target.value)}
          className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-stone-700">{timezoneLabel}</span>
        <select
          name="timezone"
          value={values.timezone}
          onChange={(event) => updateValue("timezone", event.target.value)}
          className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
        >
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-stone-700">{hoursStartLabel}</span>
        <input
          name="workday_start"
          type="time"
          value={values.workdayStart}
          onChange={(event) => updateValue("workdayStart", event.target.value)}
          className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-stone-700">{hoursEndLabel}</span>
        <input
          name="workday_end"
          type="time"
          value={values.workdayEnd}
          onChange={(event) => updateValue("workdayEnd", event.target.value)}
          className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
        />
      </label>
      {message ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">
          {message}
        </p>
      ) : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
