import React, { useMemo } from 'react';
import { ArrowRight, ShoppingBag, Package, ImageOff } from 'lucide-react';
import { useStorefrontCartStore } from '../../../store/storefrontCartStore';

type ProductVariant = {
  id: string;
  price_minor?: number | null;
  compare_at_minor?: number | null;
  option_values?: Record<string, string>;
  stock_available?: number | null;
  stock_tracked?: boolean;
};

type StoreProduct = {
  id: string;
  name: string;
  handle?: string;
  description?: string;
  brand?: string;
  media?: Array<{ url?: string; src?: string; alt?: string }>;
  variants?: ProductVariant[];
};

type StoreCategory = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
};

const safeCurrencyFormatter = (currencyCode?: string) => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode || 'INR',
      maximumFractionDigits: 2
    });
  } catch {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });
  }
};

const resolveDesignValue = (value: any, fallback: string): string => {
  if (!value || value === 'inherit') return fallback;
  const tokenVariables: Record<string, string> = {
    'color.brand.primary': 'var(--theme-brand-primary)',
    'color.brand.secondary': 'var(--theme-brand-secondary)',
    'color.brand.accent': 'var(--theme-brand-accent)',
    'color.text.heading': 'var(--theme-text-heading)',
    'color.text.body': 'var(--theme-text-body)',
    'color.text.muted': 'var(--theme-text-muted)',
    'color.background.surface': 'var(--theme-bg-surface)',
    'color.background.page': 'var(--theme-bg)',
    'color.border.default': 'var(--theme-border)'
  };
  if (typeof value === 'string') {
    if (value.startsWith('token:')) return tokenVariables[value.slice(6)] || fallback;
    return value;
  }
  if (typeof value === 'object') {
    if (value.mode === 'token') return tokenVariables[value.token] || fallback;
    if (value.mode === 'custom' && typeof value.value === 'string') return value.value;
  }
  return fallback;
};

const FeaturedCollectionSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device = 'desktop' } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const addItem = useStorefrontCartStore((state) => state.addItem);

  const isCategorySection = props.sectionType === 'CategoryList';
  const heading = props.heading ?? (isCategorySection ? 'Shop by Category' : 'Featured Collection');
  const description = props.description || '';
  const linkText = props.linkText || 'View all';
  const linkUrl = props.linkUrl || (isCategorySection ? '/collections' : '/shop');
  const layout = props.settings?.layout || props.layout || props.selectedLayout || 'grid';
  const columns = Math.max(2, Math.min(5, Number(props.settings?.columns ?? props.columns ?? 4)));
  const limit = Math.max(1, Math.min(24, Number(props.settings?.productLimit ?? props.productLimit ?? 8)));
  const cardSettings = props.blocks?.find((block: any) => block.type === 'product-card-template')?.settings || {};
  const showPrice = cardSettings.showPrice !== false;
  const showCompareAt = cardSettings.showCompareAt !== false;
  const showVendor = cardSettings.showVendor === true;
  const showAddToCart = cardSettings.showAddToCart !== false;
  const showDescription = cardSettings.showDescription === true;
  const imageRatio = ({
    square: '1 / 1',
    portrait: '4 / 5',
    tall: '3 / 4',
    landscape: '4 / 3'
  } as Record<string, string>)[cardSettings.imageRatio] || '1 / 1';
  const imageFit = cardSettings.imageFit === 'contain' ? 'contain' : 'cover';
  const titleSize = ({
    small: 12,
    medium: 14,
    large: 16
  } as Record<string, number>)[cardSettings.titleSize] || 14;
  const addToCartLabel = String(cardSettings.addToCartLabel || 'Add to cart').slice(0, 24);
  const chooseOptionsLabel = String(cardSettings.chooseOptionsLabel || 'Choose options').slice(0, 24);
  const actionStyle = cardSettings.actionStyle || 'primary';
  const currency = safeCurrencyFormatter(props.currencyCode || props.dataContext?.currencyCode);

  const products: StoreProduct[] = useMemo(() => {
    const source = Array.isArray(props.dataContext?.products) ? props.dataContext.products : [];
    return source
      .filter((product: StoreProduct) => product && typeof product.id === 'string' && typeof product.name === 'string')
      .slice(0, limit);
  }, [props.dataContext?.products, limit]);

  const categories: StoreCategory[] = useMemo(() => {
    const source = Array.isArray(props.dataContext?.categories) ? props.dataContext.categories : [];
    return source
      .filter((category: StoreCategory) => category && typeof category.id === 'string' && typeof category.name === 'string')
      .slice(0, limit);
  }, [props.dataContext?.categories, limit]);

  const items = isCategorySection ? categories : products;
  const design = props.designOverrides || {};
  const background = resolveDesignValue(design.sectionBackground ?? props.bgColor, 'var(--theme-bg-section, var(--theme-bg, #ffffff))');
  const headingColor = resolveDesignValue(design.headingColor ?? props.headingColor, 'var(--theme-text-heading, #0f172a)');
  const bodyColor = resolveDesignValue(design.bodyColor ?? props.textColor, 'var(--theme-text-body, #475569)');
  const cardBg = resolveDesignValue(design.cardBackground ?? props.cardBg, 'var(--theme-bg-surface, #f8fafc)');
  const priceColor = resolveDesignValue(design.priceColor ?? props.priceColor, 'var(--theme-brand-primary, #0f172a)');
  const linkColor = resolveDesignValue(design.linkColor ?? props.linkColor, 'var(--theme-brand-link, var(--theme-brand-primary))');

  const formatPrice = (minor: number) => currency.format(minor / 100);
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (!props.onNavigate || !target.startsWith('/')) return;
    event.preventDefault();
    props.onNavigate(target);
  };

  const gridStyle: React.CSSProperties = layout === 'carousel'
    ? {
        display: 'flex',
        gap: 'var(--theme-grid-gap, 24px)',
        overflowX: 'auto',
        paddingBottom: 12,
        scrollSnapType: 'x mandatory'
      }
    : {
        display: 'grid',
        gridTemplateColumns: `repeat(${isMobile ? 1 : isTablet ? Math.min(2, columns) : columns}, minmax(0, 1fr))`,
        gap: 'var(--theme-grid-gap, 24px)'
      };

  const emptyTitle = isCategorySection ? 'No active categories yet' : 'No active products yet';
  const emptyDescription = isCategorySection
    ? 'Create active categories in your catalogue to display them here.'
    : (props.emptyStateText || 'Add and activate products in your catalogue. Real products will appear here automatically.');

  return (
    <section
      aria-label={heading}
      style={{
        width: '100%',
        background,
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...props._marginStyle
      }}
    >
      <div
        style={{
          maxWidth: props._layoutWidth || '1400px',
          margin: '0 auto',
          padding: isMobile
            ? 'var(--theme-section-space-y, 42px) 20px'
            : isTablet
              ? 'var(--theme-section-space-y, 60px) 32px'
              : 'var(--theme-section-space-y, 76px) clamp(24px, 4vw, 48px)',
          boxSizing: 'border-box',
          ...props._paddingStyle
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--theme-content-gap, 14px)',
          marginBottom: 'var(--theme-content-gap, 28px)'
        }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              margin: 0,
              color: headingColor,
              fontFamily: 'var(--theme-font-heading, system-ui, sans-serif)',
              fontSize: isMobile ? 28 : 36,
              fontWeight: 720,
              lineHeight: 1.1,
              letterSpacing: '-0.035em'
            }}>
              {heading}
            </h2>
            {description && (
              <p style={{ margin: '10px 0 0', color: bodyColor, fontSize: 14, lineHeight: 1.6 }}>
                {description}
              </p>
            )}
          </div>
          {items.length > 0 && linkText && (
            <a
              href={linkUrl}
              onClick={(event) => navigate(event, linkUrl)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                flexShrink: 0,
                color: linkColor,
                fontSize: 13,
                fontWeight: 650,
                textDecoration: 'none'
              }}
            >
              {linkText}
              <ArrowRight size={15} />
            </a>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 210,
            padding: 28,
            border: '1px dashed var(--theme-border, #cbd5e1)',
            borderRadius: 'var(--theme-card-radius, 16px)',
            background: 'var(--theme-bg-surface, #f8fafc)',
            textAlign: 'center'
          }}>
            <Package size={26} color="var(--theme-text-muted, #64748b)" />
            <h3 style={{ margin: '12px 0 5px', color: headingColor, fontSize: 15, fontWeight: 700 }}>
              {emptyTitle}
            </h3>
            <p style={{ margin: 0, maxWidth: 360, color: bodyColor, fontSize: 12, lineHeight: 1.55 }}>
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div style={gridStyle}>
            {isCategorySection
              ? categories.map((category) => {
                  const target = `/collections/${category.slug || category.id}`;
                  return (
                    <a
                      key={category.id}
                      href={target}
                      onClick={(event) => navigate(event, target)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        minWidth: layout === 'carousel' ? (isMobile ? 250 : 300) : 0,
                        scrollSnapAlign: 'start',
                        color: 'inherit',
                        textDecoration: 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '4 / 3',
                        borderRadius: 14,
                        background: cardBg,
                        border: '1px solid var(--theme-border, #e2e8f0)'
                      }}>
                        <Package size={28} color="var(--theme-text-muted, #94a3b8)" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650, color: headingColor }}>
                          {category.name}
                        </h3>
                        {category.description && (
                          <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.5, color: bodyColor }}>
                            {category.description}
                          </p>
                        )}
                      </div>
                    </a>
                  );
                })
              : products.map((product) => {
                  const variants = Array.isArray(product.variants) ? product.variants : [];
                  const pricedVariants = variants.filter((variant) =>
                    typeof variant.price_minor === 'number' && Number.isFinite(variant.price_minor)
                  );
                  const prices = pricedVariants.map((variant) => Number(variant.price_minor));
                  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
                  const image = Array.isArray(product.media)
                    ? product.media.find((entry) => entry?.url || entry?.src)
                    : undefined;
                  const imageUrl = image?.url || image?.src;
                  const productPath = `/products/${product.handle || product.id}`;
                  const singleVariant = variants.length === 1 ? variants[0] : null;
                  const isSoldOut = Boolean(
                    singleVariant?.stock_tracked === true &&
                    Number(singleVariant.stock_available ?? 0) <= 0
                  );
                  const canAddDirectly = showAddToCart && singleVariant && !isSoldOut &&
                    singleVariant.price_minor !== null && singleVariant.price_minor !== undefined;
                  const compareAt = singleVariant?.compare_at_minor;
                  const cardWidth = layout === 'carousel' ? (isMobile ? 250 : 300) : undefined;

                  return (
                    <article
                      key={product.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: cardWidth,
                        scrollSnapAlign: 'start',
                        overflow: 'hidden',
                        borderRadius: 'var(--theme-card-radius, 14px)',
                        border: '1px solid var(--theme-border, #e2e8f0)',
                        background: cardBg
                      }}
                    >
                      <a
                        href={productPath}
                        onClick={(event) => navigate(event, productPath)}
                        aria-label={`View ${product.name}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          aspectRatio: imageRatio,
                          overflow: 'hidden',
                          background: 'var(--theme-bg-surface, #f8fafc)',
                          textDecoration: 'none'
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={image?.alt || product.name}
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: imageFit }}
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, color: 'var(--theme-text-muted, #64748b)' }}>
                            <ImageOff size={24} />
                            <span style={{ fontSize: 11 }}>Image unavailable</span>
                          </div>
                        )}
                      </a>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, padding: 'var(--theme-card-padding, 14px)' }}>
                        {showVendor && product.brand && (
                          <span style={{ color: bodyColor, fontSize: 10, fontWeight: 650, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {product.brand}
                          </span>
                        )}
                        <a
                          href={productPath}
                          onClick={(event) => navigate(event, productPath)}
                          style={{ color: headingColor, textDecoration: 'none', fontSize: titleSize, fontWeight: 650, lineHeight: 1.4 }}
                        >
                          {product.name}
                        </a>
                        {showDescription && product.description && (
                          <p style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            margin: 0,
                            color: bodyColor,
                            fontSize: 11,
                            lineHeight: 1.5
                          }}>
                            {product.description}
                          </p>
                        )}
                        {showPrice && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 7 }}>
                            {minPrice !== null ? (
                              <>
                                <span style={{ color: priceColor, fontSize: 15, fontWeight: 750 }}>
                                  {maxPrice !== null && maxPrice !== minPrice
                                    ? `${currency.format(minPrice / 100)} – ${currency.format(maxPrice / 100)}`
                                    : formatPrice(minPrice)}
                                </span>
                                {showCompareAt && compareAt !== null && compareAt !== undefined && Number(compareAt) > Number(singleVariant?.price_minor ?? 0) && (
                                  <span style={{ color: bodyColor, fontSize: 11, textDecoration: 'line-through' }}>
                                    {formatPrice(Number(compareAt))}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span style={{ color: bodyColor, fontSize: 12 }}>Price unavailable</span>
                            )}
                          </div>
                        )}
                        {isSoldOut ? (
                          <span style={{ color: bodyColor, fontSize: 11, fontWeight: 650 }}>Sold out</span>
                        ) : canAddDirectly ? (
                          <button
                            type="button"
                            onClick={() => addItem(product, singleVariant)}
                            style={{
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 7,
                              width: '100%',
                              minHeight: 40,
                              marginTop: 'auto',
                              padding: '9px 12px',
                              border: 0,
                              borderRadius: 'var(--theme-btn-radius, 9px)',
                              background: actionStyle === 'secondary'
                                ? 'var(--theme-btn-secondary-bg, #f1f5f9)'
                                : actionStyle === 'outline'
                                  ? 'transparent'
                                  : 'var(--theme-btn-primary-bg, var(--theme-brand-primary, #0f172a))',
                              color: actionStyle === 'secondary'
                                ? 'var(--theme-btn-secondary-text, #0f172a)'
                                : actionStyle === 'outline'
                                  ? 'var(--theme-brand-primary, #0f172a)'
                                  : 'var(--theme-btn-primary-text, #ffffff)',
                              border: actionStyle === 'outline' ? '1px solid var(--theme-brand-primary, #0f172a)' : 0,
                              fontSize: 12,
                              fontWeight: 650,
                              cursor: 'pointer'
                            }}
                          >
                            <ShoppingBag size={14} />
                            {addToCartLabel}
                          </button>
                        ) : variants.length > 1 ? (
                          <a
                            href={productPath}
                            onClick={(event) => navigate(event, productPath)}
                            style={{
                              marginTop: 'auto',
                              padding: '10px 12px',
                              border: '1px solid var(--theme-border, #cbd5e1)',
                              borderRadius: 'var(--theme-btn-radius, 9px)',
                              color: headingColor,
                              textAlign: 'center',
                              textDecoration: 'none',
                              fontSize: 12,
                              fontWeight: 650
                            }}
                          >
                            {chooseOptionsLabel}
                          </a>
                        ) : (
                          <a
                            href={productPath}
                            onClick={(event) => navigate(event, productPath)}
                            style={{ marginTop: 'auto', color: linkColor, fontSize: 12, fontWeight: 650, textDecoration: 'none' }}
                          >
                            View product
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCollectionSection;
