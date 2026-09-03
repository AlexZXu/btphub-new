import dayjs from "dayjs";
import { Availability, IAvailability } from "@/models";

export interface ScheduleSlot {
  availabilityId: string;
  kind: "recurring" | "oneTime";
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
}

/**
 * Expand a provider's availability rules into concrete per-date slots
 * (the port of the original vwProviderSchedules SQL view): recurring rules
 * emit one slot per matching weekday inside [from, to], one-time rules a
 * single slot, and exclusion rules remove matching dates.
 */
export function expandRules(rules: IAvailability[], from: string, to: string): ScheduleSlot[] {
  const start = dayjs(from);
  const end = dayjs(to);
  const excluded = new Set(
    rules.filter((r) => r.kind === "exclusion" && r.date).map((r) => r.date as string),
  );
  const slots: ScheduleSlot[] = [];

  for (const rule of rules) {
    if (rule.kind === "oneTime" && rule.date) {
      const d = dayjs(rule.date);
      if (!d.isBefore(start) && !d.isAfter(end) && !excluded.has(rule.date)) {
        slots.push({
          availabilityId: String(rule._id),
          kind: "oneTime",
          date: rule.date,
          startTime: rule.startTime,
          endTime: rule.endTime,
        });
      }
    } else if (rule.kind === "recurring" && rule.weekday !== undefined && rule.startDate && rule.endDate) {
      const rangeStart = dayjs(rule.startDate);
      const lo = rangeStart.isAfter(start) ? rangeStart : start;
      const hi = dayjs(rule.endDate).isBefore(end) ? dayjs(rule.endDate) : end;
      // First occurrence of the rule's weekday at or after `lo`.
      let d = lo.add((rule.weekday - lo.day() + 7) % 7, "day");
      const stepDays = rule.repeats === "biweekly" ? 14 : 7;
      if (rule.repeats === "biweekly") {
        // Biweekly cadence anchors on the first occurrence after startDate.
        const anchor = rangeStart.add((rule.weekday - rangeStart.day() + 7) % 7, "day");
        if (d.diff(anchor, "day") % 14 !== 0) d = d.add(7, "day");
      }
      while (!d.isAfter(hi)) {
        const iso = d.format("YYYY-MM-DD");
        if (!excluded.has(iso)) {
          slots.push({
            availabilityId: String(rule._id),
            kind: "recurring",
            date: iso,
            startTime: rule.startTime,
            endTime: rule.endTime,
          });
        }
        d = d.add(stepDays, "day");
      }
    }
  }
  return slots.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
}

/** All expanded slots for one provider in [from, to]. */
export async function expandProviderSchedule(
  providerId: string,
  from: string,
  to: string,
): Promise<ScheduleSlot[]> {
  const rules = await Availability.find({ provider: providerId }).lean<IAvailability[]>();
  return expandRules(rules, from, to);
}

/** True when [startTime, endTime) fits inside any expanded slot on `date`. */
export function coversWindow(
  slots: ScheduleSlot[],
  date: string,
  startTime: string,
  endTime: string,
): boolean {
  return slots.some(
    (s) => s.date === date && s.startTime <= startTime && s.endTime >= endTime,
  );
}
