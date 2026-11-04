// ============================================================
// PREVIEW SCROLL UTILITY
// Handles smooth scrolling of the editor canvas to specific sections or header rows
// ============================================================

export const scrollPreviewToHeaderSection = (target: string) => {
  setTimeout(() => {
    // 1. Try finding by element ID
    let targetEl: HTMLElement | null =
      document.getElementById(`editor-section-${target}`) ||
      document.getElementById(`header-row-${target}`) ||
      document.getElementById(target);

    // 2. Try finding by data attributes
    if (!targetEl) {
      targetEl =
        document.querySelector(`[data-section-id="${target}"]`) ||
        document.querySelector(`[data-section-type="${target}"]`) ||
        document.querySelector(`[data-header-row-type="${target}"]`);
    }

    // 3. Fallback semantic mappings
    if (!targetEl) {
      const lower = target.toLowerCase();
      if (lower.includes('announcement')) {
        targetEl =
          document.getElementById('editor-section-announcement-bar') ||
          document.getElementById('header-row-row-announcement') ||
          document.querySelector('[data-section-type="AnnouncementBar"]') ||
          document.querySelector('[data-header-row-type="announcement"]');
      } else if (lower.includes('utility')) {
        targetEl =
          document.getElementById('editor-section-utility-bar') ||
          document.getElementById('header-row-row-utility') ||
          document.querySelector('[data-section-type="UtilityBar"]') ||
          document.querySelector('[data-header-row-type="utility"]');
      } else if (lower.includes('secondary') || lower.includes('category')) {
        targetEl =
          document.getElementById('editor-section-category-bar') ||
          document.getElementById('header-row-row-secondary-nav') ||
          document.querySelector('[data-section-type="CategoryBar"]') ||
          document.querySelector('[data-header-row-type="secondary-nav"]');
      } else if (lower.includes('primary') || lower.includes('header')) {
        targetEl =
          document.getElementById('editor-section-header-main') ||
          document.getElementById('header-row-row-primary-nav') ||
          document.querySelector('[data-section-type="Header"]') ||
          document.querySelector('[data-header-row-type="primary-nav"]');
      }
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const scrollContainer =
        document.getElementById('editor-preview-scroll-container') ||
        document.querySelector('[data-preview-scroll-container="true"]');
      if (scrollContainer && target.toLowerCase().includes('announcement')) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, 60);
};

export const scrollPreviewToFooterSection = (target: string) => {
  setTimeout(() => {
    let targetEl: HTMLElement | null =
      document.getElementById(`editor-section-${target}`) ||
      document.getElementById(`footer-row-${target}`) ||
      document.getElementById(target);

    if (!targetEl) {
      targetEl =
        document.querySelector(`[data-section-id="${target}"]`) ||
        document.querySelector(`[data-section-type="${target}"]`) ||
        document.querySelector(`[data-footer-row-type="${target}"]`);
    }

    if (!targetEl) {
      const lower = target.toLowerCase();
      if (lower.includes('trust')) {
        targetEl =
          document.getElementById('editor-section-footer-trust') ||
          document.querySelector('[data-section-type="FooterTrust"]') ||
          document.querySelector('[data-footer-row-type="trust"]');
      } else if (lower.includes('newsletter')) {
        targetEl =
          document.getElementById('editor-section-footer-newsletter') ||
          document.querySelector('[data-section-type="FooterNewsletter"]') ||
          document.querySelector('[data-footer-row-type="newsletter"]');
      } else if (lower.includes('legal') || lower.includes('bottom')) {
        targetEl =
          document.getElementById('editor-section-footer-bottom') ||
          document.querySelector('[data-section-type="FooterBottom"]') ||
          document.querySelector('[data-footer-row-type="legal"]');
      } else if (lower.includes('social')) {
        targetEl =
          document.getElementById('editor-section-footer-social') ||
          document.querySelector('[data-section-type="FooterSocial"]') ||
          document.querySelector('[data-footer-row-type="social"]');
      } else {
        targetEl =
          document.getElementById('editor-section-footer-main') ||
          document.querySelector('[data-section-type="FooterMain"]') ||
          document.querySelector('[data-footer-row-type="navigation"]') ||
          document.querySelector('footer');
      }
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      const scrollContainer =
        document.getElementById('editor-preview-scroll-container') ||
        document.querySelector('[data-preview-scroll-container="true"]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, 60);
};

export const scrollPreviewToSection = (target: string) => {
  setTimeout(() => {
    let targetEl: HTMLElement | null =
      document.getElementById(`section-${target}`) ||
      document.getElementById(target) ||
      document.querySelector(`[data-section-id="${target}"]`);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 70);
};


