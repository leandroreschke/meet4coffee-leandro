import type {
  AvailabilityWindow,
  RoundFrequency,
  TimeSlotCandidate,
  Weekday,
  WorkspaceHours,
} from "./domain";
import { WEEKDAYS } from "./domain";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function slotKey(weekday: Weekday, startTime: string) {
  return `${weekday}:${startTime}`;
}

export function getPeriodKey(frequency: RoundFrequency, date: Date) {
  const year = date.getUTCFullYear();

  if (frequency === "monthly") {
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
    return `${year}-M${month}`;
  }

  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOfYear =
    Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const week = Math.ceil(dayOfYear / 7);

  if (frequency === "biweekly") {
    return `${year}-BW${Math.ceil(week / 2)
      .toString()
      .padStart(2, "0")}`;
  }

  return `${year}-W${week.toString().padStart(2, "0")}`;
}

export function buildWorkspaceSlots(
  workspaceHours: WorkspaceHours,
  durationMinutes: number,
  weekdays: Weekday[] = WEEKDAYS.slice(0, 5),
) {
  const start = timeToMinutes(workspaceHours.startTime);
  const end = timeToMinutes(workspaceHours.endTime);
  const slots: TimeSlotCandidate[] = [];

  for (const weekday of weekdays) {
    for (let current = start; current + durationMinutes <= end; current += 30) {
      slots.push({
        weekday,
        startTime: minutesToTime(current),
        endTime: minutesToTime(current + durationMinutes),
        score: 0,
      });
    }
  }

  return slots;
}

export function chooseBestTimeSlot(
  workspaceHours: WorkspaceHours,
  participantAvailability: AvailabilityWindow[][],
  durationMinutes: number,
  weekdays: Weekday[] = WEEKDAYS.slice(0, 5),
) {
  const candidateSlots = buildWorkspaceSlots(workspaceHours, durationMinutes, weekdays);

  const scored = candidateSlots.map((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    let score = 0;

    for (const memberAvailability of participantAvailability) {
      if (memberAvailability.length === 0) {
        score += 1;
        continue;
      }

      const matchingWindows = memberAvailability.filter((window) => {
        if (window.weekday !== slot.weekday) {
          return false;
        }

        const windowStart = timeToMinutes(window.startTime);
        const windowEnd = timeToMinutes(window.endTime);

        return windowStart <= slotStart && slotEnd <= windowEnd;
      });

      score += matchingWindows.length > 0 ? 5 : 0;
    }

    return {
      ...slot,
      score,
    };
  });

  scored.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    return slotKey(a.weekday, a.startTime).localeCompare(slotKey(b.weekday, b.startTime));
  });

  return scored[0] ?? null;
}
