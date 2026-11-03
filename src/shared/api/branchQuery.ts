/**
 * Builds the `?branchId=` suffix for the public catalog endpoints.
 *
 * Returns an empty string when there is no branch, which makes the backend
 * answer with stock summed across every sellable branch. That number is fine
 * for browsing but is NOT purchasable from a single store, so only fall back to
 * it when the branch genuinely could not be resolved.
 *
 * `0`, negative and non-numeric values are rejected by the backend with a 400,
 * hence the positive check.
 */
export const branchQuery = (branchId: number | null | undefined): string =>
  typeof branchId === 'number' && branchId > 0 ? `?branchId=${branchId}` : '';
