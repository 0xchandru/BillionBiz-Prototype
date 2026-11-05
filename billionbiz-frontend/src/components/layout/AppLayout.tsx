import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './AppLayout.module.css';

const AppLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState('Dashboard');
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const heading = mainRef.current?.querySelector('h1');
      const headingText = heading?.textContent?.replace(/\\s+/g, ' ').trim();
      setRouteAnnouncement(headingText ? `${headingText} page` : 'Page content updated');
      mainRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search]);

  return (
    <div className={styles.appContainer}>
      <Header onMenuClick={openMobileNav} />
      <div className={styles.mainContainer}>
        <Sidebar mobileOpen={mobileNavOpen} onClose={closeMobileNav} />
        <main ref={mainRef} className={styles.content} tabIndex={-1} aria-label="Main content">
          <div className={styles.contentInner}>
            <p className={styles.routeAnnouncement} role="status" aria-live="polite" aria-atomic="true">
              {routeAnnouncement}
            </p>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
