import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Smooth scroll-triggered animation that detects scroll direction (up & down)
 * and triggers smooth GPU-accelerated entrance transitions when scrolling above or below.
 */
export const ScrollReveal = ({
  children,
  direction = 'up',   // 'up' (default smooth glide), 'down', 'left', 'right', 'zoom', 'fade'
  delay = 0,          // delay in ms
  duration = 500,     // duration in ms
  threshold = 0.08,   // intersection threshold
  repeat = false,     // once revealed, lock visible to prevent scroll jitter/shaking
  className = '',
  as: Component = 'div',
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

    // Check if element is already within viewport on mount
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight + 50 && rect.bottom > -50) {
      setIsVisible(true);
      if (!repeat) return; // If already visible and not repeat, no need to observe
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (!repeat) {
              // Lock in place once revealed: eliminates layout thrashing & card shaking
              observer.unobserve(entry.target);
            }
          } else if (repeat) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        // Generous bottom buffer so cards appear smoothly ahead of scroll
        rootMargin: '0px 0px 60px 0px'
      }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [threshold, repeat]);

  // Stable hidden transform that never flips mid-scroll
  const getHiddenTransform = () => {
    switch (direction) {
      case 'zoom':
        return 'scale(0.96)';
      case 'left':
        return 'translateX(-20px)';
      case 'right':
        return 'translateX(20px)';
      case 'down':
        return 'translateY(-16px)';
      case 'fade':
        return 'translate(0, 0)';
      case 'up':
      case 'auto':
      default:
        return 'translateY(18px)';
    }
  };

  const hiddenTransform = getHiddenTransform();

  const animStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0, 0) scale(1)' : hiddenTransform,
    filter: isVisible ? 'blur(0px)' : 'blur(2px)',
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    transitionDelay: `${delay}ms`,
    willChange: isVisible ? 'auto' : 'opacity, transform'
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
  repeat = false,
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
            if (!repeat) {
              observer.unobserve(entry.target);
            }
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
