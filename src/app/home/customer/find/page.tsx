import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { getProviderRoster, getViewer } from "@/lib/data";
import { expandProviderSchedule, ScheduleSlot } from "@/lib/schedule";
import FindBabysitter from "./FindBabysitter";

export default async function CustomerFindPage() {
  const viewer = await getViewer();
  if (!viewer?.customer) redirect("/login");

  const roster = await getProviderRoster(String(viewer.customer.neighborhood._id));
  const from = dayjs().format("YYYY-MM-DD");
  const to = dayjs().add(60, "day").format("YYYY-MM-DD");
  const slotEntries = await Promise.all(
    roster.map(async (p) => [p.id, await expandProviderSchedule(p.id, from, to)] as const),
  );
  const slotsByProvider: Record<string, ScheduleSlot[]> = Object.fromEntries(slotEntries);

  return <FindBabysitter roster={roster} slotsByProvider={slotsByProvider} />;
}
