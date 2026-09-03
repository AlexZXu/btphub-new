import { redirect } from "next/navigation";
import { getViewer } from "@/lib/data";
import type { INeighborhood } from "@/models";
import ProfileCard from "./ProfileCard";

export default async function ProviderProfilePage() {
  const viewer = await getViewer();
  if (!viewer?.provider) redirect("/login");
  const p = viewer.provider;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <ProfileCard
        profile={{
          firstName: viewer.session.firstName,
          lastName: viewer.session.lastName,
          email: viewer.session.email,
          neighborhood: (p.neighborhood as INeighborhood).name,
          birthday: p.birthday,
          phone: p.phone,
          startDate: p.startDate,
          bio: p.bio,
          rates: (p.rates ?? []).map((r) => ({ serviceType: r.serviceType, rate: r.rate })),
        }}
      />
    </div>
  );
}
