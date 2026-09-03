import { redirect } from "next/navigation";
import Tabs from "@/components/Tabs";
import { getAvailabilityRules, getViewer } from "@/lib/data";
import AvailabilitiesManager from "./AvailabilitiesManager";

const TABS = [
  { key: "recurring", label: "Recurring Availabilities" },
  { key: "oneTime", label: "One-Time Availabilities" },
  { key: "exclusion", label: "Exclusions" },
];

export default async function ProviderAvailabilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer?.provider) redirect("/login");
  const { tab = "recurring" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rules = await getAvailabilityRules(String(viewer.provider._id));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs tabs={TABS} selected={active.key} basePath="/home/provider/availabilities" />
      <AvailabilitiesManager
        kind={active.key as "recurring" | "oneTime" | "exclusion"}
        title={active.label}
        rules={rules.filter((r) => r.kind === active.key)}
      />
    </div>
  );
}
