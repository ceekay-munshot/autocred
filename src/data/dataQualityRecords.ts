import type { DataQualityRecord } from "../types/dataQuality";

/**
 * Central store of every dashboard datapoint with its provenance.
 * Each tab that wires up real numbers should append rows here so the
 * Data Quality view stays accurate by construction.
 *
 * Rules (also surfaced in the UI):
 *  - Every record must reference a sourceId from src/data/sourceRegistry.ts
 *    OR be marked dataType: "Paid" / "Manual" with a paidManualRegistry id.
 *  - A record without a sourceUrl is treated as Low confidence.
 *  - Wholesale (company / SIAM) and retail (VAHAN / FADA) numbers must
 *    not be mixed in a single record.
 */
export const dataQualityRecords: DataQualityRecord[] = [];
