export type FarmTypeOption = "SMALL" | "LARGE" | "MARKET";

export const FARM_TYPE_PRIORITY: FarmTypeOption[] = ["SMALL", "LARGE", "MARKET"];

const FARM_TYPE_ROUTES: Record<FarmTypeOption, string> = {
  SMALL: "/dashboard-farmer?type=SMALL",
  LARGE: "/dashboard-farmer?type=LARGE",
  MARKET: "/dashboard-farmer?type=MARKET",
};

export const resolveFarmType = (value?: string | null): FarmTypeOption | null => {
  if (!value) {
    return null;
  }
  const normalized = value.toUpperCase();
  if (normalized === "SMALL" || normalized === "NURSERY_SMALL") {
    return "SMALL";
  }
  if (normalized === "LARGE" || normalized === "NURSERY_LARGE") {
    return "LARGE";
  }
  if (normalized === "MARKET" || normalized === "GROWOUT") {
    return "MARKET";
  }
  return null;
};

const normalizeFarmTypeList = (value?: unknown): FarmTypeOption[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const dedup = new Set<FarmTypeOption>();
  value.forEach((item) => {
    if (typeof item === "string") {
      const resolved = resolveFarmType(item);
      if (resolved) {
        dedup.add(resolved);
      }
    }
  });
  return Array.from(dedup);
};

export type FarmTypeProfileLike = {
  farmTypes?: unknown;
  selectedFarmTypes?: unknown;
  primaryFarmType?: string | null;
};

export const deriveFarmTypesFromProfile = (profile?: FarmTypeProfileLike): FarmTypeOption[] => {
  if (!profile) {
    return [];
  }

  // Collect all farm types from different sources
  const collected = [
    ...normalizeFarmTypeList(profile.farmTypes),
    ...normalizeFarmTypeList(profile.selectedFarmTypes),
  ];

  const primary = resolveFarmType(profile.primaryFarmType);

  // Always ensure primary farm type is included first
  if (primary && !collected.includes(primary)) {
    collected.unshift(primary); // Add to front instead of push
  }

  // If no farm types collected but has primary, return primary
  if (collected.length === 0 && primary) {
    return [primary];
  }

  const dedupOrdered = Array.from(new Set(collected));

  const sorted = dedupOrdered.sort(
    (a, b) => FARM_TYPE_PRIORITY.indexOf(a) - FARM_TYPE_PRIORITY.indexOf(b),
  );

  if (primary) {
    const withoutPrimary = sorted.filter((value) => value !== primary);
    return [primary, ...withoutPrimary];
  }

  return sorted;
};

export const mapFarmTypeToRoute = (value?: string | null): string => {
  const resolved = resolveFarmType(value);
  if (!resolved) {
    return "/small";
  }
  return FARM_TYPE_ROUTES[resolved];
};