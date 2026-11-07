/**
 * The branch a first-time visitor is served by.
 *
 * `GET /web-page/branches` deliberately does not mark a default — the response
 * is just a list ordered by name — so the frontend configures one. If this id
 * is not in the list (deactivated, or SIAT billing switched off), the first
 * branch is used instead, which is what the backend docs ask for: never keep a
 * `branchId` the backend will reject.
 */
export const DEFAULT_BRANCH_ID = 4;
