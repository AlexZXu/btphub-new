import dayjs from "dayjs";

export const WEEKDAYS_SHORT = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "2026-09-09" -> "Wed." */
export function weekdayShort(date: string): string {
  return WEEKDAYS_SHORT[dayjs(date).day()];
}

/** "2026-09-09" -> "Sep. 9, 2026" */
export function formatDate(date: string): string {
  return dayjs(date).format("MMM. D, YYYY");
}

/** "16:00" -> "4:00 PM" */
export function formatTime(time: string): string {
  return dayjs(`2000-01-01 ${time}`).format("h:mm A");
}

/** "16:00" -> "4 PM"; "15:30" -> "3:30 PM" (compact calendar pills) */
export function formatTimeCompact(time: string): string {
  const d = dayjs(`2000-01-01 ${time}`);
  return d.minute() === 0 ? d.format("h A") : d.format("h:mm A");
}

/** ("4", "00", "PM") -> "16:00" */
export function toTime24(hour: string, minute: string, amPm: string): string {
  let h = parseInt(hour, 10) % 12;
  if (amPm === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(parseInt(minute || "0", 10)).padStart(2, "0")}`;
}

/** "16:30" -> { hour: "4", minute: "30", amPm: "PM" } */
export function fromTime24(time: string): { hour: string; minute: string; amPm: string } {
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  return {
    hour: String(h % 12 === 0 ? 12 : h % 12),
    minute: String(m).padStart(2, "0"),
    amPm: h < 12 ? "AM" : "PM",
  };
}

/** "First Last" -> "First L." */
export function shortenName(first: string, last: string): string {
  return `${first} ${last?.[0] ?? ""}.`;
}

export function computeAge(birthday: string): number {
  return dayjs().diff(birthday, "year");
}
