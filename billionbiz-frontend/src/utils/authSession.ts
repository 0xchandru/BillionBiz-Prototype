/** A stored token is only a candidate until `/auth/me` verifies its user. */
export function hasVerifiedAuthSession(isAuthenticated: boolean, user: unknown): boolean {
  return isAuthenticated && Boolean(user);
}
