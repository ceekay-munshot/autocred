import type { DataQualityRecord } from "../types/dataQuality";

/**
 * Adapter stubs for public Industry sources.
 *
 * Each source has been probed during scaffolding:
 *   - FADA press releases page    → 403 to server-side fetch
 *   - SIAM statistics page        → 403 to server-side fetch
 *   - VAHAN dashboard             → 403 to server-side fetch
 *
 * None of them can be scraped with a plain HTTP fetch today, so these
 * adapters intentionally throw `NotImplementedError`. They document the
 * contract that the future implementation must honour:
 *   - return DataQualityRecord[] keyed against an existing sourceId
 *   - never invent values; on parse failure, return an empty array
 *   - leave any rate-limit / login handling to the caller
 *
 * The intended next implementation paths:
 *   - FADA: parse the monthly press-release PDF (link is stable, body
 *     structure is consistent).
 *   - VAHAN: scripted browser session against the public dashboard with
 *     vehicle-class = "MOTOR CAR / LMV(NT)" filters; export CSV.
 *   - SIAM: only the public flash press-release covers wholesale /
 *     production / exports headline numbers; everything finer is paid.
 */
export class NotImplementedError extends Error {
  constructor(adapter: string) {
    super(`${adapter} adapter is not implemented yet.`);
    this.name = "NotImplementedError";
  }
}

export interface IndustrySourceFetchOptions {
  /** Inclusive lower bound (e.g. "FY24"). Optional. */
  fromYear?: string;
  /** Inclusive upper bound (e.g. "FY26"). Optional. */
  toYear?: string;
}

/**
 * Fetch Indian PV retail-sale figures published by FADA.
 * Today: not wired up. FADA blocks server-side fetch.
 */
export async function fetchFadaRetailData(
  _opts: IndustrySourceFetchOptions = {}
): Promise<DataQualityRecord[]> {
  throw new NotImplementedError("fetchFadaRetailData");
}

/**
 * Fetch PV registrations from VAHAN (vehicle-class = motor car / LMV).
 * Today: not wired up. VAHAN is a JS-only dashboard; needs a browser
 * automation step or an authorised CSV export pipeline.
 */
export async function fetchVahanRegistrationData(
  _opts: IndustrySourceFetchOptions = {}
): Promise<DataQualityRecord[]> {
  throw new NotImplementedError("fetchVahanRegistrationData");
}

/**
 * Fetch SIAM public headline industry totals (production / domestic /
 * exports). Today: not wired up. SIAM landing page returns 403 to a
 * plain fetch and the headline summary lives inside a flash PDF.
 */
export async function fetchSiamPublicData(
  _opts: IndustrySourceFetchOptions = {}
): Promise<DataQualityRecord[]> {
  throw new NotImplementedError("fetchSiamPublicData");
}

/**
 * Combine the records returned by individual adapters and dedupe by
 * (metricKey, year). Adapters are independent today; once one is
 * wired up, this function lets the Industry tab show actual data
 * without changing UI code.
 */
export function normalizeIndustryData(
  groups: DataQualityRecord[][]
): DataQualityRecord[] {
  const byKey = new Map<string, DataQualityRecord>();
  for (const group of groups) {
    for (const rec of group) {
      const key = `${rec.metricKey}::${rec.year}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, rec);
        continue;
      }
      // Prefer Actual > Calculated > Estimated > Paid > Manual > NotAvailable
      const rank: Record<DataQualityRecord["dataType"], number> = {
        Actual: 5,
        Calculated: 4,
        Estimated: 3,
        Paid: 2,
        Manual: 1,
        NotAvailable: 0,
      };
      if (rank[rec.dataType] > rank[existing.dataType]) {
        byKey.set(key, rec);
      }
    }
  }
  return Array.from(byKey.values());
}
