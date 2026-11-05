import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Gift, Heart, Home, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart, Tag, User } from 'lucide-react';
import { useStorefrontCartStore } from '../../store/storefrontCartStore';
import styles from './StorefrontUtilities.module.css';

type ActionType = 'link' | 'call' | 'whatsapp' | 'cart' | 'coupon' | 'back-to-top';
type NavItem = { id: string; text: string; link: string; icon?: string; badge?: string };
type FloatingAction = { id: string; type: ActionType; label: string; target?: string; message?: string; color?: string };

const DEFAULT_NAV: NavItem[] = [
  { id: 'home', text: 'Home', link: '/', icon: 'Home' },
  { id: 'shop', text: 'Shop', link: '/shop', icon: 'ShoppingBag' },
  { id: 'cart', text: 'Cart', link: '/cart', icon: 'ShoppingCart' },
  { id: 'account', text: 'Account', link: '/account', icon: 'User' },
];

function iconFor(name?: string, size = 18) {
  switch ((name || '').toLowerCase()) {
    case 'home': return <Home size={size} />;
    case 'search': return <Search size={size} />;
    case 'heart': case 'wishlist': return <Heart size={size} />;
    case 'user': case 'account': return <User size={size} />;
    case 'cart': case 'shoppingcart': return <ShoppingCart size={size} />;
    case 'tag': case 'coupon': return <Tag size={size} />;
    case 'gift': return <Gift size={size} />;
    case 'phone': case 'call': return <Phone size={size} />;
    case 'whatsapp': case 'message': return <MessageCircle size={size} />;
    default: return <ShoppingBag size={size} />;
  }
}

const safeExternalUrl = (value: string) => /^https:\/\//i.test(value);

export function StorefrontUtilities({
  settings = {}, device = 'desktop', currentPath = '/', onNavigate,
}: {
  settings?: Record<string, any>;
  device?: 'desktop' | 'tablet' | 'mobile';
  currentPath?: string;
  onNavigate?: (path: string) => void;
}) {
  const { setIsOpen } = useStorefrontCartStore();
  const [celebrating, setCelebrating] = useState(false);
  const navItems: NavItem[] = Array.isArray(settings.bottomNavLinks) ? settings.bottomNavLinks : DEFAULT_NAV;
  const actions = useMemo<FloatingAction[]>(() => {
    if (Array.isArray(settings.floatingActions)) return settings.floatingActions;
    const phone = String(settings.whatsappWidgetPhone || settings.whatsappNumber || '').replace(/[^\d]/g, '');
    return settings.whatsappWidgetEnabled !== false && phone
      ? [{ id: 'whatsapp', type: 'whatsapp', label: settings.whatsappPillText || 'Chat', target: phone, message: settings.whatsappWidgetMessage || '' }]
      : [];
  }, [settings.floatingActions, settings.whatsappWidgetEnabled, settings.whatsappWidgetPhone, settings.whatsappNumber, settings.whatsappPillText, settings.whatsappWidgetMessage]);

  useEffect(() => {
    if (!settings.decorationsEnabled || settings.decorationTrigger !== 'purchase') return;
    if (!/\/(thank-you|order-confirmation)(\/|$)/i.test(currentPath)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setCelebrating(true);
    const timeout = window.setTimeout(() => setCelebrating(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [settings.decorationsEnabled, settings.decorationTrigger, currentPath]);

  const navigate = (path: string) => {
    if (path.startsWith('/') && !path.startsWith('//')) {
      if (onNavigate) onNavigate(path);
      else window.location.assign(path);
    }
    else if (safeExternalUrl(path)) window.open(path, '_blank', 'noopener,noreferrer');
  };

  const activate = (action: FloatingAction) => {
    switch (action.type) {
      case 'link': if (action.target) navigate(action.target); break;
      case 'call': if (action.target) window.location.href = `tel:${action.target.replace(/[^+\d]/g, '')}`; break;
      case 'whatsapp': {
        const phone = (action.target || '').replace(/[^\d]/g, '');
        if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(action.message || '')}`, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'cart': setIsOpen(true); break;
      case 'coupon': if (action.target) void navigator.clipboard?.writeText(action.target); break;
      case 'back-to-top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    }
  };

  const visibleOnMobile = device === 'mobile';
  const showNav = visibleOnMobile && settings.showBottomNav !== false && navItems.length > 0;
  const position = settings.bottomNavPosition === 'docked' ? 'docked' : 'floating';
  const navStyle = settings.bottomNavStyle || 'pill';
  const actionPosition = String(settings.floatingPosition || 'bottom-right');
  const isBottomPlacement = actionPosition.startsWith('bottom') || actionPosition === 'right' || actionPosition === 'left';
  const isLeftPlacement = actionPosition.endsWith('left') || actionPosition === 'left';
  const isMiddlePlacement = actionPosition.startsWith('middle');
  const isTopPlacement = actionPosition.startsWith('top');

  return <>
    {showNav && <nav className={`${styles.bottomNav} ${position === 'docked' ? styles.docked : styles.floating} ${styles[navStyle] || ''}`} aria-label="Store navigation">
      {navItems.slice(0, 5).map((item) => {
        const active = item.link === currentPath || (item.link !== '/' && currentPath.startsWith(item.link));
        return <button key={item.id} type="button" aria-current={active ? 'page' : undefined} onClick={() => navigate(item.link)} className={styles.navItem} style={{ color: active ? (settings.bottomNavActiveColor || 'var(--theme-primary)') : undefined }}>
          <span className={styles.navIcon}>{iconFor(item.icon)}</span>{item.badge && <span className={styles.badge}>{item.badge}</span>}
          <span className={styles.navLabel}>{item.text}</span>
        </button>;
      })}
    </nav>}

    {actions.length > 0 && <div className={`${styles.floatingActions} ${showNav && isBottomPlacement ? styles.aboveNav : ''}`} style={{ left: isLeftPlacement ? 18 : undefined, right: isLeftPlacement ? undefined : 18, top: isTopPlacement ? 18 : isMiddlePlacement ? '50%' : undefined, bottom: isBottomPlacement && showNav ? 'calc(92px + env(safe-area-inset-bottom))' : isBottomPlacement ? '22px' : undefined, transform: isMiddlePlacement ? 'translateY(-50%)' : undefined }}>
      {actions.slice(0, 4).map((action, index) => <button key={action.id} type="button" onClick={() => activate(action)} aria-label={action.label} title={action.label} className={`${styles.actionButton} ${settings.floatingStyle === 'pill' ? styles.actionPill : ''}`} style={{ background: action.color || 'var(--theme-primary)', bottom: isBottomPlacement ? `${index * 56}px` : undefined, top: !isBottomPlacement ? `${index * 56}px` : undefined }}>
        {action.type === 'back-to-top' ? <ArrowUp size={20} /> : iconFor(action.type, 20)}{settings.floatingStyle === 'pill' && <span>{action.label}</span>}
      </button>)}
    </div>}

    {celebrating && <div className={styles.celebration} aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 7) * 0.08}s`, backgroundColor: ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899'][index % 5] }} />)}</div>}
  </>;
}
