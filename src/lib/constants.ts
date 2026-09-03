export const SERVICE_TYPES = ["1 Kid", "2 Kids", "1 Pet", "2 Pets"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];
