"use client";

import { useRouter } from "next/navigation";
import NeighborhoodFinder from "@/components/NeighborhoodFinder";
import type { NeighborhoodRow } from "@/lib/data";

export default function SeeNeighborhoods({
  neighborhoods,
  states,
}: {
  neighborhoods: NeighborhoodRow[];
  states: { code: string }[];
}) {
  const router = useRouter();
  return (
    <NeighborhoodFinder
      neighborhoods={neighborhoods}
      states={states}
      onJoin={(n) => router.push(`/signup?nbh=${n.id}`)}
    />
  );
}
