"use client";

import { useState } from "react";

import { deleteWorkspaceAction } from "@/lib/actions/workspace";
import { appButtonClassName } from "@/components/ui/app-button";

type DangerZoneFormProps = {
  workspaceSlug: string;
};

export function DangerZoneForm({ workspaceSlug }: DangerZoneFormProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation.trim() === workspaceSlug;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={appButtonClassName({ variant: "danger", size: "md" })}
      >
        Delete workspace
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-xl">
            <h3 className="font-display text-2xl text-stone-900">Delete workspace</h3>
            <p className="mt-3 text-sm text-stone-600">
              Type <span className="font-semibold text-stone-900">{workspaceSlug}</span> to
              confirm.
            </p>
            <form action={deleteWorkspaceAction} className="mt-5 grid gap-3">
              <input type="hidden" name="workspace_slug" value={workspaceSlug} />
              <label className="block space-y-1">
                <span className="sr-only">Confirm workspace slug</span>
                <input
                  name="confirm_slug"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={workspaceSlug}
                  className="w-full rounded-2xl border border-rose-300 bg-white px-4 py-3"
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirmation("");
                  }}
                  className={appButtonClassName({ variant: "secondary", size: "sm" })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canDelete}
                  className={appButtonClassName({ variant: "danger", size: "sm" })}
                >
                  Delete permanently
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
