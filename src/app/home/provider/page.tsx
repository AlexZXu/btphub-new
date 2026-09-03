import { redirect } from "next/navigation";
import DashboardHome from "@/components/DashboardHome";
import { getCalendarEvents, getProviderBookings, getViewer } from "@/lib/data";
import type { INeighborhood } from "@/models";

export default async function ProviderHomePage() {
  const viewer = await getViewer();
  if (!viewer?.provider) redirect("/login");
  const providerId = String(viewer.provider._id);

  const [upcoming, past, pending, events] = await Promise.all([
    getProviderBookings(providerId, "upcoming"),
    getProviderBookings(providerId, "past"),
    getProviderBookings(providerId, "pending"),
    getCalendarEvents("provider", providerId),
  ]);

  return (
    <DashboardHome
      firstName={viewer.session.firstName}
      neighborhoodName={(viewer.provider.neighborhood as INeighborhood).name}
      who="provider"
      upcoming={upcoming}
      past={past}
      pending={pending}
      events={events}
    />
  );
}
