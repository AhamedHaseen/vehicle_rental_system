import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Smooth scroll-triggered animation that detects scroll direction (up & down)
 * and triggers smooth GPU-accelerated entrance transitions when scrolling above or below.
 */
export const ScrollReveal = ({
  children,
  direction = 'auto', // 'auto' (detects up/down scroll), 'up', 'down', 'left', 'right', 'zoom'
  delay = 0,          // delay in ms
  duration = 600,     // duration in ms
  threshold = 0.12,   // intersection threshold
  repeat = true,      // re-trigger animation when scrolling back into view (above/below)
  className = '',
  as: Component = 'div',
  ...rest
}) => {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !('IntersectionObserver' in window);
  });
  const [scrollDirection, setScrollDirection] = useState('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Keep track of scroll direction (scrolling down vs scrolling up)
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || window.pageYOffset;
          if (currentScrollY > lastScrollY.current + 4) {
            setScrollDirection('down');
          } else if (currentScrollY < lastScrollY.current - 4) {
            setScrollDirection('up');
          }
          lastScrollY.current = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const node = domRef.current;
    if (!node || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else if (repeat) {
            // Element left the viewport, allow it to animate again when re-entering
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px' // Slightly inside viewport for clean entrance
      }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [threshold, repeat]);

  // Determine initial hidden transform based on scroll direction or explicit prop
  const getHiddenTransform = () => {
    if (direction === 'zoom') return 'scale(0.94)';
    if (direction === 'left') return 'translateX(-28px)';
    if (direction === 'right') return 'translateX(28px)';
    if (direction === 'down') return 'translateY(-26px)';
    if (direction === 'up') return 'translateY(26px)';

    // 'auto' mode: adapt to whether user is scrolling down or up
    return scrollDirection === 'down' ? 'translateY(26px)' : 'translateY(-26px)';
  };

  const hiddenTransform = getHiddenTransform();

  const animStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0, 0) scale(1)' : hiddenTransform,
    filter: isVisible ? 'blur(0px)' : 'blur(3px)',
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform, filter'
  };

  return (
    <Component
      ref={domRef}
      style={animStyle}
      className={`scroll-reveal-container ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * TextReveal Component
 * Splits heading text into smooth animated words that glide into view on scroll.
 */
export const TextReveal = ({
  text,
  className = '',
  as: Component = 'h2',
  delay = 0,
  stagger = 40,
  repeat = true,
  ...rest
}) => {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !('IntersectionObserver' in window);
  });

  useEffect(() => {
    const node = domRef.current;
    if (!node || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else if (repeat) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat]);

  const words = text ? text.split(' ') : [];

  return (
    <Component ref={domRef} className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`} {...rest}>
      {words.map((word, index) => {
        const wordDelay = delay + index * stagger;
        return (
          <span
            key={index}
            className="inline-block transition-all duration-500 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              filter: isVisible ? 'blur(0px)' : 'blur(2px)',
              transitionDelay: `${wordDelay}ms`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'opacity, transform, filter'
            }}
          >
            {word}
          </span>
        );
      })}
    </Component>
  );
};
