import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './AppLayout.module.css';

const AppLayout = () => {
  return (
    <div className={styles.appContainer}>
      <Header />
      <div className={styles.mainContainer}>
        <Sidebar />
        <main className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
