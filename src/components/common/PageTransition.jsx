import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * Automatically resets scroll position to top on route change,
 * and animates the active page view smoothly into place.
 */
export const PageTransition = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Instantly reset scroll to top on every route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative w-full">
      {/* Page Content with key-triggered smooth entrance */}
      <div
        key={location.pathname}
        className="w-full animate-page-enter"
      >
        {children}
      </div>
    </div>
  );
};
