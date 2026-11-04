// ============================================================
// MASTER EDITOR ENGINE — AUDIT ENGINE
// Comprehensive accessibility, SEO, performance, and UX audit engine
// (spec §6, §65, §66).
// ============================================================

import type {
  AuditIssue,
  AuditResult,
  EditorType,
  HeaderRow,
  FooterRow,
  GlobalHeaderSettings,
  GlobalFooterSettings,
} from './types';

export function runEditorAudit(
  editorType: EditorType,
  data: {
    headerRows?: HeaderRow[];
    headerSettings?: GlobalHeaderSettings;
    footerRows?: FooterRow[];
    footerSettings?: GlobalFooterSettings;
  }
): AuditResult {
  const issues: AuditIssue[] = [];

  if (editorType === 'header') {
    const rows = data.headerRows || [];
    const settings = data.headerSettings;

    // 1. Accessibility Checks
    if (!settings?.accessibility.ariaLabels) {
      issues.push({
        id: 'hdr-a11y-aria',
        category: 'accessibility',
        severity: 'warning',
        message: 'ARIA labels are currently disabled in global header settings.',
        suggestion: 'Enable ARIA labels in Header Settings → Accessibility to assist screen readers.',
      });
    }

    if (!settings?.accessibility.skipToContent) {
      issues.push({
        id: 'hdr-a11y-skip',
        category: 'accessibility',
        severity: 'info',
        message: 'Skip to Main Content link is disabled.',
        suggestion: 'Enable Skip to Content for better keyboard accessibility compliance (WCAG 2.1).',
      });
    }

    // Check rows & elements
    let hasLogo = false;
    let hasNavigation = false;

    for (const row of rows) {
      if (!row.isVisible) continue;

      for (const el of row.elements) {
        if (el.type === 'logo') {
          hasLogo = true;
          if (!el.props.altText && el.props.sourceType === 'image') {
            issues.push({
              id: `hdr-logo-alt-${el.id}`,
              category: 'accessibility',
              severity: 'error',
              message: `Logo in "${row.name}" has no image alt text.`,
              componentId: el.id,
              componentName: el.name,
              suggestion: 'Provide descriptive alt text for visual screen readers.',
            });
          }
        }

        if (el.type === 'navigation') {
          hasNavigation = true;
        }

        if (el.type === 'promo-text') {
          if (!el.props.text || el.props.text.trim() === '') {
            issues.push({
              id: `hdr-promo-empty-${el.id}`,
              category: 'missing-content',
              severity: 'warning',
              message: `Announcement banner in "${row.name}" has empty text.`,
              componentId: el.id,
              componentName: el.name,
              suggestion: 'Add promo text or toggle row visibility off.',
            });
          }
        }
      }
    }

    if (!hasLogo) {
      issues.push({
        id: 'hdr-no-logo',
        category: 'ux',
        severity: 'warning',
        message: 'No active Logo element detected in visible header rows.',
        suggestion: 'Add a Brand Logo to help customers recognize your storefront.',
      });
    }

    if (!hasNavigation) {
      issues.push({
        id: 'hdr-no-nav',
        category: 'navigation',
        severity: 'error',
        message: 'No navigation menu found in visible header rows.',
        suggestion: 'Add a Primary Navigation element so visitors can browse categories.',
      });
    }

    // Performance & Mobile checks
    if (settings?.mobileMenuType === 'full-screen' && settings.searchMode === 'inline') {
      issues.push({
        id: 'hdr-mobile-overflow',
        category: 'mobile',
        severity: 'info',
        message: 'Inline search with full-screen menu may crowd compact mobile screens.',
        suggestion: 'Consider using dropdown or overlay search mode for mobile devices.',
      });
    }
  } else if (editorType === 'footer') {
    const rows = data.footerRows || [];
    const settings = data.footerSettings;

    // 1. Accessibility Checks
    if (!settings?.accessibility.landmarkRole) {
      issues.push({
        id: 'ftr-a11y-landmark',
        category: 'accessibility',
        severity: 'warning',
        message: 'Missing landmark role="contentinfo" on footer wrapper.',
        suggestion: 'Ensure landmark role is configured in Footer Settings.',
      });
    }

    let hasCopyright = false;
    let hasPrivacyLink = false;

    for (const row of rows) {
      if (!row.isVisible) continue;

      for (const col of row.columns) {
        for (const el of col.elements) {
          if (el.type === 'copyright') {
            hasCopyright = true;
          }

          if (el.type === 'policy-links') {
            const links = el.props.links || [];
            if (links.some((l: any) => l.label?.toLowerCase().includes('privacy'))) {
              hasPrivacyLink = true;
            }
          }

          if (el.type === 'newsletter-form') {
            if (!el.props.showConsent) {
              issues.push({
                id: `ftr-gdpr-${el.id}`,
                category: 'invalid-config',
                severity: 'warning',
                message: 'Newsletter form has GDPR consent checkbox disabled.',
                componentId: el.id,
                componentName: el.name,
                suggestion: 'Enable consent disclaimer to comply with privacy regulations.',
              });
            }
          }
        }
      }
    }

    if (!hasCopyright) {
      issues.push({
        id: 'ftr-no-copyright',
        category: 'missing-content',
        severity: 'warning',
        message: 'No copyright notice found in visible footer rows.',
        suggestion: 'Add a Copyright element to legally protect intellectual property.',
      });
    }

    if (!hasPrivacyLink) {
      issues.push({
        id: 'ftr-no-privacy',
        category: 'broken-links',
        severity: 'error',
        message: 'No Privacy Policy link detected in footer.',
        suggestion: 'Storefronts require an accessible Privacy Policy link for legal compliance.',
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return {
    timestamp: Date.now(),
    issues,
    errorCount,
    warningCount,
    infoCount,
    passed: errorCount === 0,
  };
}
