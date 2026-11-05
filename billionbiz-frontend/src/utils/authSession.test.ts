import { describe, expect, it } from 'vitest';
import { hasVerifiedAuthSession } from './authSession';

describe('verified auth session guard', () => {
  it('rejects a stored token before a user profile is verified', () => {
    expect(hasVerifiedAuthSession(true, null)).toBe(false);
    expect(hasVerifiedAuthSession(false, { id: 'user-1' })).toBe(false);
  });

  it('accepts an authenticated, verified user', () => {
    expect(hasVerifiedAuthSession(true, { id: 'user-1' })).toBe(true);
  });
});
