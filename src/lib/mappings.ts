import { AREA_MAPPINGS } from "../constants/areas";

/**
 * Returns the correct area_key for a given Thai label from the dictionary.
 * If the area is unknown, returns "unknown".
 */
export function getAreaKey(areaLabel: string): string {
  const normalizedLabel = areaLabel.trim();
  return AREA_MAPPINGS[normalizedLabel] ?? "unknown";
}
