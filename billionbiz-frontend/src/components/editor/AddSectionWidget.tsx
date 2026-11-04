import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Plus,
  LayoutGrid,
  LayoutTemplate,
  ShoppingBag,
  FileText,
  Image,
  Star,
  Tag,
  Sparkles,
  Mail,
  Compass,
  PanelBottom,
  Library
} from 'lucide-react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import styles from './AddSectionWidget.module.css';

interface SectionItem {
  type: string;
  name: string;
  desc: string;
  category: string;
  tags: string[];
  img: string;
}

export const AddSectionWidget: React.FC = () => {
  const {
    isAddSectionWidgetOpen,
    setAddSectionWidgetOpen,
    insertIndex,
    setInsertIndex,
    setSelectedSectionId,
    setRightSidebarOpen
  } = useLandingEditorStore();

  const selectedPageId = 'landing-page';
  const { pages, addSection } = useSiteStore();
  const [activeCategory, setActiveCategory] = useState<string>('All sections');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll and handle keyboard shortcuts
  useEffect(() => {
    if (!isAddSectionWidgetOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus search on open
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setAddSectionWidgetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddSectionWidgetOpen, setAddSectionWidgetOpen]);

  // Categories list - First item is "All sections", followed by category types
  const categories = useMemo(() => [
    { id: 'All sections', name: 'All sections', icon: LayoutGrid },
    { id: 'Hero', name: 'Hero', icon: LayoutTemplate },
    { id: 'Products', name: 'Products', icon: ShoppingBag },
    { id: 'Content', name: 'Content', icon: FileText },
    { id: 'Media', name: 'Media', icon: Image },
    { id: 'Social Proof', name: 'Social Proof', icon: Star },
    { id: 'Pricing', name: 'Pricing', icon: Tag },
    { id: 'Marketing', name: 'Marketing', icon: Sparkles },
    { id: 'Contact', name: 'Contact', icon: Mail },
    { id: 'Navigation', name: 'Navigation', icon: Compass },
    { id: 'Footer', name: 'Footer', icon: PanelBottom },
  ], []);

  // Section options catalogue
  const sectionOptions: SectionItem[] = useMemo(() => [
    {
      type: 'HeroBanner',
      name: 'Hero Banner',
      desc: 'High-impact header banner with headline, call to action, and background media',
      category: 'Hero',
      tags: ['hero', 'banner', 'heading', 'cta'],
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=380&fit=crop'
    },
    {
      type: 'HeroCarousel',
      name: 'Hero Carousel',
      desc: 'Multi-slide banner with animated transitions and navigation dots',
      category: 'Hero',
      tags: ['carousel', 'slider', 'banner', 'slides'],
      img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=380&fit=crop'
    },
    {
      type: 'FeaturedCollection',
      name: 'Featured Collection',
      desc: 'Curated product grid or carousel with price badges and ratings',
      category: 'Products',
      tags: ['products', 'collection', 'storefront', 'shop', 'ecommerce'],
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=380&fit=crop'
    },
    {
      type: 'CategoryList',
      name: 'Category List',
      desc: 'Visual photo tiles for quick navigation to store product categories',
      category: 'Products',
      tags: ['categories', 'catalog', 'navigation', 'grid'],
      img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=380&fit=crop'
    },
    {
      type: 'ImageWithText',
      name: 'Image with Text',
      desc: 'Editorial split section pairing photography with compelling copy',
      category: 'Content',
      tags: ['image', 'text', 'editorial', 'story', 'split'],
      img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=380&fit=crop'
    },
    {
      type: 'RichText',
      name: 'Rich Text',
      desc: 'Centered headline with formatted statement and typography',
      category: 'Content',
      tags: ['text', 'typography', 'statement', 'mission', 'about'],
      img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=380&fit=crop'
    },
    {
      type: 'BlogPosts',
      name: 'Blog Posts',
      desc: 'Latest editorial articles with cover images, dates, and snippets',
      category: 'Content',
      tags: ['blog', 'articles', 'news', 'journal', 'editorial'],
      img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=380&fit=crop'
    },
    {
      type: 'FAQ',
      name: 'FAQ Accordion',
      desc: 'Interactive expandable accordion for common customer questions',
      category: 'Content',
      tags: ['faq', 'accordion', 'questions', 'support', 'help'],
      img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=380&fit=crop'
    },
    {
      type: 'Gallery',
      name: 'Photo Gallery',
      desc: 'Responsive multi-image gallery showcase with lightboxes and captions',
      category: 'Media',
      tags: ['gallery', 'photos', 'masonry', 'lookbook', 'images'],
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=380&fit=crop'
    },
    {
      type: 'Video',
      name: 'Video Player',
      desc: 'Cinematic video block supporting YouTube, Vimeo, or MP4 playback',
      category: 'Media',
      tags: ['video', 'media', 'player', 'youtube', 'vimeo'],
      img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=380&fit=crop'
    },
    {
      type: 'Testimonials',
      name: 'Testimonials',
      desc: 'Customer review quotes with 5-star ratings and customer avatars',
      category: 'Social Proof',
      tags: ['reviews', 'testimonials', 'ratings', 'social proof', 'quotes'],
      img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=380&fit=crop'
    },
    {
      type: 'LogoList',
      name: 'Logo Marquee',
      desc: 'Clean partner and press logo marquee establishing brand trust',
      category: 'Social Proof',
      tags: ['logos', 'partners', 'press', 'brands', 'marquee'],
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=380&fit=crop'
    },
    {
      type: 'PricingTable',
      name: 'Pricing Table',
      desc: 'Side-by-side subscription or product tier comparison cards',
      category: 'Pricing',
      tags: ['pricing', 'plans', 'tiers', 'subscription', 'cost'],
      img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=380&fit=crop'
    },
    {
      type: 'Newsletter',
      name: 'Newsletter Signup',
      desc: 'High-converting email capture with discount incentive and button',
      category: 'Marketing',
      tags: ['newsletter', 'email', 'signup', 'subscribe', 'marketing'],
      img: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=600&h=380&fit=crop'
    },
    {
      type: 'ContactForm',
      name: 'Contact Form',
      desc: 'Direct inquiry form with name, email, and message inputs',
      category: 'Contact',
      tags: ['contact', 'form', 'message', 'support', 'inquiry'],
      img: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&h=380&fit=crop'
    },
    {
      type: 'Map',
      name: 'Location & Map',
      desc: 'Store locator map with address, telephone, and business hours',
      category: 'Contact',
      tags: ['map', 'location', 'address', 'store', 'directions'],
      img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=380&fit=crop'
    },
    {
      type: 'AnnouncementBar',
      name: 'Announcement Bar',
      desc: 'Slim notification banner for promotions and free shipping perks',
      category: 'Navigation',
      tags: ['announcement', 'bar', 'top', 'notice', 'promo'],
      img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=380&fit=crop'
    },
    {
      type: 'UtilityBar',
      name: 'Utility Bar',
      desc: 'Top secondary header for currency, customer help, and phone',
      category: 'Navigation',
      tags: ['utility', 'header', 'currency', 'language', 'account'],
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=380&fit=crop'
    },
    {
      type: 'CategoryBar',
      name: 'Category Bar',
      desc: 'Horizontal strip of quick links for top product categories',
      category: 'Navigation',
      tags: ['category', 'subnav', 'links', 'menu', 'bar'],
      img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=380&fit=crop'
    },
    {
      type: 'Footer',
      name: 'Storefront Footer',
      desc: 'Comprehensive footer with brand statement, links, and copyright',
      category: 'Footer',
      tags: ['footer', 'links', 'columns', 'copyright', 'bottom'],
      img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=380&fit=crop'
    },
    {
      type: 'FooterNewsletter',
      name: 'Footer Newsletter',
      desc: 'Dedicated email newsletter subscription box for footer layout',
      category: 'Footer',
      tags: ['footer', 'newsletter', 'subscribe', 'email'],
      img: 'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?w=600&h=380&fit=crop'
    },
    {
      type: 'FooterMenu',
      name: 'Footer Links',
      desc: 'Simple row or column navigation links and legal disclaimers',
      category: 'Footer',
      tags: ['footer', 'menu', 'links', 'policy', 'terms'],
      img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&h=380&fit=crop'
    },
  ], []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All sections': sectionOptions.length };
    sectionOptions.forEach((sec) => {
      counts[sec.category] = (counts[sec.category] || 0) + 1;
    });
    return counts;
  }, [sectionOptions]);

  // Filtered sections by category & search query
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sectionOptions.filter((opt) => {
      const matchesCategory =
        activeCategory === 'All sections' || opt.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      const inName = opt.name.toLowerCase().includes(query);
      const inDesc = opt.desc.toLowerCase().includes(query);
      const inCategory = opt.category.toLowerCase().includes(query);
      const inTags = opt.tags.some((t) => t.toLowerCase().includes(query));

      return inName || inDesc || inCategory || inTags;
    });
  }, [sectionOptions, activeCategory, searchQuery]);

  if (!isAddSectionWidgetOpen) return null;

  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const handleAdd = (type: string) => {
    if (activePage) {
      const previousLength = activePage.sections.length;
      addSection(activePage.id, type, insertIndex !== null ? insertIndex : undefined);
      setInsertIndex(null);
      setAddSectionWidgetOpen(false);

      // Select newly added section
      setTimeout(() => {
        const updatedPage = useSiteStore.getState().pages.find((p) => p.id === activePage.id);
        if (updatedPage && updatedPage.sections.length > previousLength) {
          const targetIndex = insertIndex !== null && insertIndex !== undefined
            ? Math.min(insertIndex, updatedPage.sections.length - 1)
            : updatedPage.sections.length - 1;
          const addedSection = updatedPage.sections[targetIndex];
          if (addedSection) {
            setSelectedSectionId(addedSection.id);
            setRightSidebarOpen(true);
          }
        }
      }, 50);
    }
  };

  const overlayContent = (
    <div className={styles.overlayRoot} role="dialog" aria-modal="true" aria-label="Sections Library">
      {/* ---------------- Topbar ---------------- */}
      <header className={styles.topbar}>
        {/* Topbar Left: Text of the sections library */}
        <div className={styles.topbarLeft}>
          <div className={styles.topbarIconBadge}>
            <Library size={18} />
          </div>
          <h2 className={styles.topbarTitle}>Sections Library</h2>
        </div>

        {/* Topbar Right: Close control */}
        <div className={styles.topbarRight}>
          <button
            className={styles.closeButton}
            onClick={() => setAddSectionWidgetOpen(false)}
            title="Close (Esc)"
            aria-label="Close sections library"
          >
            <span>Close</span>
            <span className={styles.escKey}>Esc</span>
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ---------------- Main Layout ---------------- */}
      <div className={styles.mainLayout}>
        {/* Leftside Vertical Bar with Categories of Sections */}
        <nav className={styles.sidebar} aria-label="Section categories">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.name] || 0;
            const isActive = activeCategory === cat.name;

            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                <div className={styles.categoryLeft}>
                  <span className={styles.categoryIcon}>
                    <Icon size={16} />
                  </span>
                  <span>{cat.name}</span>
                </div>
                <span className={styles.categoryCount}>{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Body Area */}
        <main className={styles.bodyArea}>
          {/* Searchbar on Top */}
          <div className={styles.searchHeader}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={16} />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search sections by name, keyword, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search sections"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className={styles.statusCountText}>
              {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'} in{' '}
              <strong>{activeCategory}</strong>
            </div>
          </div>

          {/* Sections Cards Grid */}
          <div className={styles.gridScrollContainer}>
            {filteredSections.length > 0 ? (
              <div className={styles.sectionsGrid}>
                {filteredSections.map((sec) => (
                  <div
                    key={sec.type}
                    className={styles.sectionCard}
                    onClick={() => handleAdd(sec.type)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAdd(sec.type);
                      }
                    }}
                    title={`Add ${sec.name} to landing page`}
                  >
                    {/* Preview of the section */}
                    <div className={styles.cardPreview}>
                      <img
                        src={sec.img}
                        alt={`${sec.name} preview`}
                        className={styles.cardPreviewImage}
                        loading="lazy"
                      />
                      <div className={styles.hoverOverlay}>
                        <div className={styles.addBadge}>
                          <Plus size={15} />
                          <span>Add to Page</span>
                        </div>
                      </div>
                    </div>

                    {/* Section name on bottom of the card */}
                    <div className={styles.cardBottom}>
                      <div className={styles.sectionName}>{sec.name}</div>
                      <div className={styles.sectionDesc}>{sec.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Search size={36} color="#cbd5e1" />
                <h3 className={styles.emptyStateTitle}>No sections found</h3>
                <p className={styles.emptyStateDesc}>
                  We couldn't find any section matching "{searchQuery}" in {activeCategory}.
                </p>
                <button
                  type="button"
                  className={styles.clearSearchActionBtn}
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All sections');
                  }}
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};
