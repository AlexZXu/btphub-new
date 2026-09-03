export const dynamic = "force-dynamic";

import { listInfoRequests } from "@/lib/data";
import RequestList from "./RequestList";

export default async function AdminRequestsPage() {
  const requests = await listInfoRequests("pending");
  return (
    <RequestList
      requests={requests.map((r) => ({
        id: r.id,
        email: r.email,
        neighborhoodName: r.neighborhoodName,
        city: r.city,
        stateCode: r.stateCode,
        zip: r.zip,
        comments: r.comments,
      }))}
    />
  );
}
