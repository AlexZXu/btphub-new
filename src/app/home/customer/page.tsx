import { redirect } from "next/navigation";
import DashboardHome from "@/components/DashboardHome";
import { getCalendarEvents, getCustomerBookings, getViewer } from "@/lib/data";
import type { INeighborhood } from "@/models";

export default async function CustomerHomePage() {
  const viewer = await getViewer();
  if (!viewer?.customer) redirect("/login");
  const customerId = String(viewer.customer._id);

  const [upcoming, past, pending, events] = await Promise.all([
    getCustomerBookings(customerId, "upcoming"),
    getCustomerBookings(customerId, "past"),
    getCustomerBookings(customerId, "pending"),
    getCalendarEvents("customer", customerId),
  ]);

  return (
    <DashboardHome
      firstName={viewer.session.firstName}
      neighborhoodName={(viewer.customer.neighborhood as INeighborhood).name}
      who="customer"
      upcoming={upcoming}
      past={past}
      pending={pending}
      events={events}
    />
  );
}
