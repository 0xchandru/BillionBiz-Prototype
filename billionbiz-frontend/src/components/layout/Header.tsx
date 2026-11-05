import { useState, useEffect, useRef } from 'react';
import type { FC, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { 
  Menu, Search, Bell, ChevronDown, 
  LogOut, Store, Shield, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { navSections } from './Sidebar';
import { api } from '../../api/services';
import ProfileModal from './ProfileModal';
import logoDarkBg from '../../assets/logo-dark-bg.png';
import styles from './Header.module.css';

type QuickFindItem = {
  id: string;
  label: string;
  path: string;
  group: string;
};

const quickFindItems: QuickFindItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', group: 'Workspace' },
  ...navSections.flatMap((section) => {
    if (section.items?.length) {
      return section.items.map((item) => ({
        id: item.id,
        label: item.label,
        path: item.path,
        group: section.label,
      }));
    }
    return section.path
      ? [{ id: section.id, label: section.label, path: section.path, group: 'Workspace' }]
      : [];
  }),
];

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, role, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch In-app notifications
  const fetchNotifs = () => {
    api.getNotifications()
      .then((res) => {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Keyboard shortcut Ctrl/Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (!window.matchMedia('(min-width: 769px)').matches) return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkRead = (id: string) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.is_read) return;

    api.markNotificationRead(id).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }).catch(() => {});
  };

  const displayName = user?.fullName || 'Chandru';
  const roleDisplay = role === 'OWNER' ? 'Super Admin' : (role || 'Super Admin');
  const userInitial = displayName.charAt(0).toUpperCase() || 'C';
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? quickFindItems.filter((item) =>
        `${item.label} ${item.group} ${item.path}`.toLowerCase().includes(normalizedQuery)
      ).slice(0, 8)
    : [];

  const openQuickFindResult = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchOpen(false);
    setActiveSearchIndex(0);
  };

  const handleQuickFindKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && searchResults.length > 0) {
      event.preventDefault();
      setActiveSearchIndex((current) => Math.min(current + 1, searchResults.length - 1));
    } else if (event.key === 'ArrowUp' && searchResults.length > 0) {
      event.preventDefault();
      setActiveSearchIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && searchResults.length > 0) {
      event.preventDefault();
      openQuickFindResult(searchResults[activeSearchIndex]?.path || searchResults[0].path);
    } else if (event.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={styles.header}>
      {/* LEFT: BillionBiz Brand Logo */}
      <div className={styles.left}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-controls="merchant-navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <a href="/dashboard" className={styles.logoLink} title="BillionBiz Dashboard">
          <img 
            src={logoDarkBg} 
            alt="BillionBiz" 
            style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} 
          />
        </a>
      </div>

      {/* CENTER: Rounded Quick Find Search Pill with ⌘K Badge */}
      <div className={styles.center} ref={searchWrapperRef}>
        <div className={styles.searchBar} onClick={() => searchInputRef.current?.focus()}>
          <Search size={15} className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Find a page..."
            className={styles.searchInput}
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveSearchIndex(0);
              setIsSearchOpen(true);
            }}
            onKeyDown={handleQuickFindKeyDown}
            aria-label="Find a page"
            aria-controls="quick-find-results"
            aria-expanded={isSearchOpen && normalizedQuery.length > 0}
            aria-autocomplete="list"
          />
          <kbd className={styles.kbdBadge}>⌘K</kbd>
        </div>
        {isSearchOpen && normalizedQuery.length > 0 && (
          <div id="quick-find-results" className={styles.searchResults} role="region" aria-label="Page search results">
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.searchResult} ${activeSearchIndex === index ? styles.searchResultActive : ''}`}
                  onMouseEnter={() => setActiveSearchIndex(index)}
                  onClick={() => openQuickFindResult(item.path)}
                >
                  <span className={styles.searchResultText}>
                    <span className={styles.searchResultLabel}>{item.label}</span>
                    <span className={styles.searchResultGroup}>{item.group}</span>
                  </span>
                  <kbd className={styles.searchResultPath}>{item.path}</kbd>
                </button>
              ))
            ) : (
              <div className={styles.searchNoResults}>No matching pages. Try another page name.</div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Topbar Controls */}
      <div className={styles.right}>
        {/* Notifications Popover Button */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            type="button"
            className={styles.iconBtn} 
            aria-label="Notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={18} className={styles.iconWhite} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {isNotificationsOpen && (
            <div className={styles.notificationsMenu}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                {unreadCount > 0 && (
                  <span className={styles.notifBadge}>
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No notifications yet. Honest zeros active.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      aria-label={n.is_read ? `Notification: ${n.title}` : `Mark notification as read: ${n.title}`}
                      aria-pressed={Boolean(n.is_read)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 0,
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: n.is_read ? '#ffffff' : '#f0fdfa',
                        cursor: n.is_read ? 'default' : 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{n.body}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* User Profile Pill matching attached image */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className={styles.profileBtn}
            aria-label="User profile"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className={styles.avatarCircle}>
              {userInitial}
            </div>
            <div className={styles.userTextCol}>
              <div className={styles.userNameRow}>
                <span className={styles.userName}>{displayName}</span>
                <ChevronDown size={13} className={styles.iconMuted} />
              </div>
              <span className={styles.userRole}>{roleDisplay}</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className={styles.profileMenu}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{displayName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || `admin@${import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes'}`}</div>
                <div style={{ display: 'inline-block', marginTop: '0.35rem', backgroundColor: '#e6fffa', color: '#083e47', fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  ROLE: {roleDisplay}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsProfileOpen(false);
                }}
                className={styles.menuItem}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <User size={15} /> Account Profile & Security
              </button>

              <a
                href="/settings"
                className={styles.menuItem}
              >
                <Store size={15} /> Store Settings
              </a>

              <a
                href="/pos"
                className={styles.menuItem}
              >
                <Shield size={15} /> Open Cashier POS
              </a>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.3rem 0' }}></div>

              {/* Secure Sign Out Button */}
              <button
                type="button"
                onClick={() => logout()}
                className={styles.signOutBtn}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Management Modal triggered from top right profile */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </header>
  );
};

export default Header;
