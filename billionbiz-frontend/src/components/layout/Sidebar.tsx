import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar, 
  Package, 
  Users, 
  ShieldCheck,
  Store,
  Palette,
  Zap,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import styles from './Sidebar.module.css';

export interface SubItem {
  id: string;
  label: string;
  path: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: any;
  path?: string;
  items?: SubItem[];
}

export const navSections: NavSection[] = [
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    items: [
      { id: 'all-orders', label: 'All Orders', path: '/orders' },
      { id: 'new-invoice', label: 'New Invoice', path: '/orders/invoices/new' },
      { id: 'abandoned-carts', label: 'Abandoned Carts', path: '/orders/abandoned-carts' },
      { id: 'returns-refunds', label: 'Returns & Refunds', path: '/orders/returns-refunds' },
      { id: 'shipments', label: 'Shipments', path: '/orders/shipments' },
      { id: 'warehouses', label: 'Warehouses', path: '/orders/warehouses' },
      { id: 'quotes', label: 'Quotes', path: '/orders/quotes' },
      { id: 'returns', label: 'Returns', path: '/orders/returns' },
    ]
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    items: [
      { id: 'all-bookings', label: 'All Bookings', path: '/appointments' },
      { id: 'new-booking', label: 'New Booking', path: '/appointments/new' },
      { id: 'offerings', label: 'Offerings', path: '/appointments/offerings' },
      { id: 'staff', label: 'Staff', path: '/appointments/staff' },
      { id: 'working-hours', label: 'Working Hours', path: '/appointments/working-hours' },
      { id: 'booking-settings', label: 'Booking Settings', path: '/appointments/settings' },
      { id: 'availability', label: 'Availability', path: '/appointments/availability' },
      { id: 'resources', label: 'Resources', path: '/appointments/resources' },
    ]
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: Package,
    items: [
      { id: 'products', label: 'Products', path: '/products' },
      { id: 'categories', label: 'Categories', path: '/products/categories' },
      { id: 'inventory', label: 'Inventory', path: '/products/inventory' },
      { id: 'price-lists', label: 'Price Lists', path: '/products/pricelists' },
    ]
  },
  {
    id: 'team',
    label: 'Team',
    icon: ShieldCheck,
    items: [
      { id: 'team-members', label: 'Team Members', path: '/team' },
      { id: 'roles-permissions', label: 'Roles & Permissions', path: '/team/roles' },
      { id: 'responsibilities', label: 'Responsibilities', path: '/team/responsibilities' },
    ]
  },
  {
    id: 'people',
    label: 'People',
    icon: Users,
    items: [
      { id: 'customers', label: 'Customers', path: '/people' },
      { id: 'customer-tickets', label: 'Customer Tickets', path: '/people/tickets' },
    ]
  },
  {
    id: 'pos',
    label: 'POS & Counters',
    icon: Store,
    items: [
      { id: 'pos-counters', label: 'POS Registers', path: '/pos-counters' },
      { id: 'open-pos', label: 'Open Cashier Terminal', path: '/pos' },
      { id: 'pos-shifts', label: 'Shifts & Floats', path: '/pos-counters/shifts' },
    ]
  },
  {
    id: 'online-store',
    label: 'Online Store',
    icon: Palette,
    items: [
      { id: 'overview', label: 'Overview', path: '/online-store' },
      { id: 'pages', label: 'Pages', path: '/online-store/pages' },
      { id: 'store-editor', label: 'Store Editor', path: '/editor' },
      { id: 'themes', label: 'Themes', path: '/online-store/themes' },
      { id: 'navigation', label: 'Navigation', path: '/online-store/navigation' },
      { id: 'header-footer', label: 'Header & Footer', path: '/editor/pages?pageId=header-global' },
    ]
  },
  {
    id: 'plugins',
    label: 'Plugins',
    icon: Zap,
    path: '/plugins'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    items: [
      { id: 'set-general', label: 'General', path: '/settings/general' },
      { id: 'set-account', label: 'Account', path: '/settings/account' },
      { id: 'set-security', label: 'Security & Login', path: '/settings/security' },
      { id: 'set-preferences', label: 'Preferences', path: '/settings/preferences' },
      { id: 'set-payments', label: 'Payments', path: '/settings/payments' },
      { id: 'set-fulfillment', label: 'Fulfillment', path: '/settings/fulfillment' },
      { id: 'set-notifications', label: 'Notifications', path: '/settings/notifications' },
      { id: 'set-integrations', label: 'Integrations', path: '/settings/integrations' },
    ]
  }
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, storeName, role } = useAuthStore();

  const [activeDropdown, setActiveDropdown] = useState<string | null>('orders');

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const desktopMedia = window.matchMedia('(min-width: 769px)');
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    desktopMedia.addEventListener('change', handleDesktopChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktopMedia.removeEventListener('change', handleDesktopChange);
    };
  }, [mobileOpen, onClose]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Sync active accordion dropdown with current URL path on load, refresh, or back/forward
  useEffect(() => {
    const path = location.pathname;

    for (const section of navSections) {
      if (!section.items || section.items.length === 0) continue;
      const match = section.items.some(
        (item) => path === item.path || (item.path !== '/' && path.startsWith(item.path))
      );
      if (match) {
        setActiveDropdown(section.id);
        return;
      }
    }

    // Default to close if on dashboard or direct links
    if (path === '/dashboard' || path === '/' || path.startsWith('/plugins')) {
      setActiveDropdown(null);
    }
  }, [location.pathname]);

  // Exclusive Accordion Toggle:
  // 1. Opening one closes all others.
  // 2. Automatically selects its first submenu item & navigates to it.
  const handleDropdownClick = (section: NavSection) => {
    if (!section.items || section.items.length === 0) {
      if (section.path) navigate(section.path);
      return;
    }

    if (activeDropdown === section.id) {
      // Allow collapsing
      setActiveDropdown(null);
    } else {
      setActiveDropdown(section.id);
      if (section.items.length > 0) {
        const firstItem = section.items[0];
        navigate(firstItem.path);
      }
    }
  };

  const isHomeActive = location.pathname === '/dashboard';

  const isSubItemActive = (item: SubItem) => {
    const currentPath = location.pathname;
    if (item.path === '/orders' && currentPath !== '/orders') return false;
    if (item.path === '/appointments' && currentPath !== '/appointments') return false;
    if (item.path === '/products' && currentPath !== '/products') return false;
    if (item.path === '/team' && currentPath !== '/team') return false;
    if (item.path === '/people' && currentPath !== '/people') return false;
    if (item.path === '/plugins' && currentPath !== '/plugins') return false;
    if (item.path === '/settings' && currentPath !== '/settings') return false;
    if (item.path === '/pos-counters' && currentPath !== '/pos-counters') return false;
    if (item.path === '/online-store' && currentPath !== '/online-store') return false;
    return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
  };

  const displayName = user?.fullName || storeName || 'Merchant';
  const roleDisplay = role === 'OWNER' ? 'Super Admin' : (role || 'Super Admin');
  const userInitial = displayName.charAt(0).toUpperCase() || 'M';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}
      <aside
        id="merchant-navigation"
        aria-label="Main navigation"
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.mobileDrawerHeader}>
          <span>Navigation</span>
          <button type="button" className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close navigation menu">
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        {/* Scrollable Navigation Rail */}
        <nav className={styles.navContainer}>
          {/* 1. Dashboard Direct Link */}
          <div className={styles.sectionHeaderWrap}>
            <Link 
              to="/dashboard" 
              className={`${styles.itemBtn} ${isHomeActive ? styles.itemActiveDirect : ''}`}
              aria-current={isHomeActive ? 'page' : undefined}
            >
              <div className={styles.itemLeft}>
                <LayoutDashboard size={18} className={styles.itemIcon} />
                <span className={styles.itemLabel}>Dashboard</span>
              </div>
            </Link>
          </div>

          {/* 2. Expandable Accordion Dropdowns & Direct Nav Links */}
          {navSections.map((section) => {
            const Icon = section.icon;

            // Direct link for sections without subitems (e.g. Plugins)
            if (!section.items || section.items.length === 0) {
              const active = location.pathname === (section.path || '') || location.pathname.startsWith(`${section.path}/`);
              return (
                <div key={section.id} className={styles.sectionHeaderWrap}>
                  <Link 
                    to={section.path || '/plugins'} 
                    className={`${styles.itemBtn} ${active ? styles.itemActiveDirect : ''}`}
                  >
                    <div className={styles.itemLeft}>
                      <Icon size={18} className={styles.itemIcon} />
                      <span className={styles.itemLabel}>{section.label}</span>
                    </div>
                  </Link>
                </div>
              );
            }

            const isOpen = activeDropdown === section.id;

            return (
              <div key={section.id} className={styles.sectionGroup}>
                <button
                  type="button"
                  className={`${styles.dropdownBtn} ${isOpen ? styles.dropdownBtnOpen : ''}`}
                  onClick={() => handleDropdownClick(section)}
                  aria-expanded={isOpen}
                >
                  <div className={styles.itemLeft}>
                    <Icon size={18} className={styles.itemIcon} />
                    <span className={styles.itemLabel}>{section.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={15} className={styles.chevronIcon} />
                  ) : (
                    <ChevronDown size={15} className={styles.chevronIcon} />
                  )}
                </button>

                {/* Submenu Items List */}
                {isOpen && (
                  <div className={styles.subList}>
                    {section.items.map((sub) => {
                      const active = isSubItemActive(sub);
                      return (
                        <Link
                          key={sub.id}
                          to={sub.path}
                          className={`${styles.subItem} ${active ? styles.subItemActive : ''}`}
                          aria-current={active ? 'page' : undefined}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* DOCKED BOTTOM FOOTER: Only Name & Role (Non-clickable) */}
        <div className={styles.bottomFooter}>
          <div className={styles.profileRowStatic}>
            <div className={styles.avatarCircle}>{userInitial}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{displayName}</span>
              <span className={styles.profileRole}>{roleDisplay}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
