/**
 * Type helpers for Supabase queries.
 *
 * Why this file exists:
 * `select('alias:foreign_table!fk_name(...)')` syntax requires Supabase's
 * generated `Relationships: [...]` metadata to type-check. Our hand-written
 * types omit the FK metadata for brevity, so we cast complex select results
 * to known shapes through `cast<T>(result.data)`.
 *
 * Runtime is unaffected — we only annotate the response.
 */

/**
 * Cast a value to a known shape. The compile-time-only escape hatch.
 * Use sparingly and only for results we control.
 */
export function cast<T>(value: unknown): T {
  return value as T;
}
