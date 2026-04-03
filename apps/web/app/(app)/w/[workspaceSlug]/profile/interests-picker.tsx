"use client";

import { useMemo, useState } from "react";

type InterestOption = {
  id: string;
  name: string;
};

type InterestsPickerProps = {
  interests: InterestOption[];
  selectedInterestIds: string[];
};

function normalizeInterestName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function InterestsPicker({ interests, selectedInterestIds }: InterestsPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedExistingIds, setSelectedExistingIds] = useState(() => new Set(selectedInterestIds));
  const [customInterests, setCustomInterests] = useState<string[]>([]);

  const existingByLowerName = useMemo(
    () => new Map(interests.map((interest) => [interest.name.toLowerCase(), interest] as const)),
    [interests],
  );

  const filteredInterests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return interests;
    }

    return interests.filter((interest) => interest.name.toLowerCase().includes(normalizedQuery));
  }, [interests, query]);

  function toggleExistingInterest(interestId: string) {
    setSelectedExistingIds((current) => {
      const next = new Set(current);

      if (next.has(interestId)) {
        next.delete(interestId);
      } else {
        next.add(interestId);
      }

      return next;
    });
  }

  function addInterestFromQuery() {
    const normalizedName = normalizeInterestName(query);

    if (!normalizedName) {
      return;
    }

    const existing = existingByLowerName.get(normalizedName.toLowerCase());

    if (existing) {
      setSelectedExistingIds((current) => {
        const next = new Set(current);
        next.add(existing.id);
        return next;
      });
      setQuery("");
      return;
    }

    setCustomInterests((current) => {
      if (current.some((interest) => interest.toLowerCase() === normalizedName.toLowerCase())) {
        return current;
      }

      return [...current, normalizedName];
    });
    setQuery("");
  }

  function removeCustomInterest(name: string) {
    setCustomInterests((current) => current.filter((interest) => interest !== name));
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-800">Interests</p>
        <div className="flex min-w-[280px] flex-1 items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addInterestFromQuery();
              }
            }}
            placeholder="Search interests"
            className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-2.5"
          />
          <button
            type="button"
            onClick={addInterestFromQuery}
            className="rounded-full border border-stone-900/10 bg-white px-4 py-2.5 text-sm font-medium text-stone-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredInterests.map((interest) => {
          const selected = selectedExistingIds.has(interest.id);

          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggleExistingInterest(interest.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selected
                  ? "border-stone-900 bg-stone-900 text-stone-50"
                  : "border-stone-900/15 bg-white text-stone-700"
              }`}
            >
              {interest.name}
            </button>
          );
        })}
      </div>

      {customInterests.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            New interests to add
          </p>
          <div className="flex flex-wrap gap-2">
            {customInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => removeCustomInterest(interest)}
                className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              >
                {interest} ×
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {Array.from(selectedExistingIds).map((interestId) => (
        <input key={interestId} type="hidden" name="interest_ids" value={interestId} />
      ))}
      <input type="hidden" name="new_interests" value={customInterests.join(", ")} />
    </div>
  );
}

