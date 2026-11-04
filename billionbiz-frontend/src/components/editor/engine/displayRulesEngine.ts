// ============================================================
// MASTER EDITOR ENGINE — DISPLAY RULES ENGINE
// Conditional visibility evaluation based on audience, device,
// country, schedule, and campaigns (spec §56, §57).
// ============================================================

import type { DisplayRules, ViewportDevice } from './types';

export interface RuntimeContext {
  device: ViewportDevice;
  isLoggedIn: boolean;
  country?: string;
  currentTime?: number;
  activeCampaign?: string;
}

export function shouldRenderWithDisplayRules(
  rules: DisplayRules | undefined,
  context: RuntimeContext
): { visible: boolean; reason?: string } {
  if (!rules) return { visible: true };

  // 1. Device check
  if (rules.devices && rules.devices.length > 0) {
    if (!rules.devices.includes(context.device)) {
      return { visible: false, reason: `Hidden on device: ${context.device}` };
    }
  }

  // 2. Audience check
  if (rules.targetAudience === 'logged-in' && !context.isLoggedIn) {
    return { visible: false, reason: 'Visible only to logged-in customers' };
  }
  if (rules.targetAudience === 'guest' && context.isLoggedIn) {
    return { visible: false, reason: 'Visible only to guest visitors' };
  }

  // 3. Country / Geolocation check
  if (rules.countries && rules.countries.length > 0 && context.country) {
    if (!rules.countries.includes(context.country)) {
      return { visible: false, reason: `Hidden for country: ${context.country}` };
    }
  }

  // 4. Schedule check
  if (rules.scheduleEnabled) {
    const now = context.currentTime || Date.now();
    if (rules.scheduleStart) {
      const startTime = new Date(rules.scheduleStart).getTime();
      if (!isNaN(startTime) && now < startTime) {
        return { visible: false, reason: 'Scheduled to start in the future' };
      }
    }
    if (rules.scheduleEnd) {
      const endTime = new Date(rules.scheduleEnd).getTime();
      if (!isNaN(endTime) && now > endTime) {
        return { visible: false, reason: 'Schedule has expired' };
      }
    }
  }

  // 5. Campaign check
  if (rules.campaignName && context.activeCampaign) {
    if (rules.campaignName.toLowerCase() !== context.activeCampaign.toLowerCase()) {
      return { visible: false, reason: `Campaign does not match: ${rules.campaignName}` };
    }
  }

  return { visible: true };
}
