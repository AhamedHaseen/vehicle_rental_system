import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * Automatically resets scroll position to top on route change,
 * and animates the active page view smoothly into place.
 */
export const PageTransition = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdmin) {
      // Instantly reset scroll to top on public customer page route change
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isAdmin]);

  // Use a constant key for all admin routes so AdminLayout and its Sidebar never remount
  const transitionKey = isAdmin ? 'admin-layout-root' : location.pathname;

  return (
    <div className="relative w-full">
      {/* Page Content with key-triggered smooth entrance */}
      <div
        key={transitionKey}
        className={isAdmin ? "w-full" : "w-full animate-page-enter"}
      >
        {children}
      </div>
    </div>
  );
};
