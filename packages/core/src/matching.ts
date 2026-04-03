import type {
  GeneratedMeetingGroup,
  MatchParticipant,
  MeetingRoundDecision,
} from "./domain";

function pairKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

function countPairPenalty(a: MatchParticipant, b: MatchParticipant) {
  if (a.absoluteOptOutUserIds.includes(b.id) || b.absoluteOptOutUserIds.includes(a.id)) {
    return Number.POSITIVE_INFINITY;
  }

  let penalty = 0;

  if (a.weightedOptOutUserIds.includes(b.id) || b.weightedOptOutUserIds.includes(a.id)) {
    penalty += 500;
  }

  penalty += (a.recentPairings[b.id] ?? 0) * 40;
  penalty += (b.recentPairings[a.id] ?? 0) * 40;

  return penalty;
}

function groupPenalty(group: MatchParticipant[]) {
  let penalty = 0;

  for (let index = 0; index < group.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < group.length; otherIndex += 1) {
      penalty += countPairPenalty(group[index], group[otherIndex]);
    }
  }

  return penalty;
}

function compareParticipants(a: MatchParticipant, b: MatchParticipant) {
  const aConstraintScore =
    a.absoluteOptOutUserIds.length * 100 +
    a.weightedOptOutUserIds.length * 10 +
    Object.values(a.recentPairings).reduce((sum, value) => sum + value, 0);
  const bConstraintScore =
    b.absoluteOptOutUserIds.length * 100 +
    b.weightedOptOutUserIds.length * 10 +
    Object.values(b.recentPairings).reduce((sum, value) => sum + value, 0);

  if (aConstraintScore !== bConstraintScore) {
    return bConstraintScore - aConstraintScore;
  }

  if (a.recentMeetingCount !== b.recentMeetingCount) {
    return a.recentMeetingCount - b.recentMeetingCount;
  }

  return a.id.localeCompare(b.id);
}

function chooseSkippedParticipant(participants: MatchParticipant[]) {
  return [...participants].sort((a, b) => {
    const aSkip = a.lastSkippedAt ?? "";
    const bSkip = b.lastSkippedAt ?? "";

    if (aSkip !== bSkip) {
      return aSkip.localeCompare(bSkip);
    }

    if (a.recentMeetingCount !== b.recentMeetingCount) {
      return a.recentMeetingCount - b.recentMeetingCount;
    }

    return a.id.localeCompare(b.id);
  })[0];
}

export function generateMeetingGroups(
  participants: MatchParticipant[],
  targetGroupSize: number,
): MeetingRoundDecision {
  if (targetGroupSize < 2) {
    throw new Error("group size must be at least 2");
  }

  const sorted = [...participants].sort(compareParticipants);
  const skippedParticipantIds: string[] = [];

  if (targetGroupSize === 2 && sorted.length % 2 === 1) {
    const skipped = chooseSkippedParticipant(sorted);
    skippedParticipantIds.push(skipped.id);
  }

  const pool = sorted.filter((participant) => !skippedParticipantIds.includes(participant.id));
  const targetGroupCount = Math.max(1, Math.ceil(pool.length / targetGroupSize));
  const groups: MatchParticipant[][] = Array.from({ length: targetGroupCount }, () => []);

  for (const participant of pool) {
    const sortedCandidates = groups
      .map((group, index) => ({
        index,
        sizePenalty: group.length,
        score:
          Number.isFinite(groupPenalty([...group, participant]))
            ? groupPenalty([...group, participant])
            : Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }

        if (a.sizePenalty !== b.sizePenalty) {
          return a.sizePenalty - b.sizePenalty;
        }

        return a.index - b.index;
      });

    const choice = sortedCandidates[0];
    groups[choice.index].push(participant);
  }

  const result: GeneratedMeetingGroup[] = groups
    .filter((group) => group.length > 0)
    .map((group) => ({
      participantIds: group.map((participant) => participant.id),
      score: groupPenalty(group),
    }));

  return { groups: result, skippedParticipantIds };
}

export function buildPairHistory(participantIds: string[]) {
  const keys = new Set<string>();

  for (let index = 0; index < participantIds.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < participantIds.length; otherIndex += 1) {
      keys.add(pairKey(participantIds[index], participantIds[otherIndex]));
    }
  }

  return [...keys];
}
