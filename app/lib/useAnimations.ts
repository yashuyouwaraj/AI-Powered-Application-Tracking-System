import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animations } from './animations';

/**
 * usePageTransition Hook
 * Animates a page in when component mounts
 */
export const usePageTransition = (duration = 0.6) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.pageIn(ref.current, duration);
    }
  }, [duration]);

  return ref;
};

/**
 * useFadeIn Hook
 * Simple fade in animation
 */
export const useFadeIn = (duration = 0.4, delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0 },
        { opacity: 1, duration, delay, ease: 'power2.out' }
      );
    }
  }, [duration, delay]);

  return ref;
};

/**
 * useSlideInUp Hook
 * Slide in from bottom animation
 */
export const useSlideInUp = (duration = 0.5, delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.slideInUp(ref.current, duration, delay);
    }
  }, [duration, delay]);

  return ref;
};

/**
 * useStagger Hook
 * Stagger animation for list items
 */
export const useStagger = (duration = 0.4, staggerDelay = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const children = Array.from(ref.current.children) as HTMLElement[];
      if (children.length > 0) {
        animations.staggerSlideUp(children, duration, staggerDelay);
      }
    }
  }, [duration, staggerDelay]);

  return ref;
};

/**
 * useHoverScale Hook
 * Scale animation on hover
 */
export const useHoverScale = (scale = 1.05) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onMouseEnter = () => {
      gsap.to(element, { scale, duration: 0.3, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      gsap.to(element, { scale: 1, duration: 0.3, ease: 'power2.out' });
    };

    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', onMouseEnter);
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [scale]);

  return ref;
};

/**
 * useCountUp Hook
 * Animate number from one value to another
 */
export const useCountUp = (
  from: number,
  to: number,
  duration = 2,
  shouldAnimate = true
) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && shouldAnimate) {
      animations.countTo(ref.current, from, to, duration);
    }
  }, [from, to, duration, shouldAnimate]);

  return ref;
};

/**
 * useGlowEffect Hook
 * Pulsing glow effect
 */
export const useGlowEffect = (duration = 0.6) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.glowEffect(ref.current, duration);
    }
  }, [duration]);

  return ref;
};

/**
 * usePulse Hook
 * Continuous pulse animation
 */
export const usePulse = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.pulse(ref.current);
    }
  }, []);

  return ref;
};

/**
 * useRotate Hook
 * Rotating animation (useful for spinners/loaders)
 */
export const useRotate = (degrees = 360, duration = 1) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.rotate(ref.current, degrees, duration);
    }
  }, [degrees, duration]);

  return ref;
};

/**
 * useLoadingSpinner Hook
 * Continuous rotating spinner
 */
export const useLoadingSpinner = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.loadingSpinner(ref.current);
    }
  }, []);

  return ref;
};

/**
 * useIntersectionAnimation Hook
 * Trigger animation when element enters viewport
 */
export const useIntersectionAnimation = (
  animationFn: (el: HTMLElement) => void,
  options?: IntersectionObserverInit
) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animationFn(element);
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationFn, options]);

  return ref;
};

/**
 * useScrollParallax Hook
 * Parallax effect on scroll
 */
export const useScrollParallax = (speed = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return animations.parallax(element, speed);
  }, [speed]);

  return ref;
};

/**
 * useSuccessAnimation Hook
 * Animate success state
 */
export const useSuccessAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.successCheck(ref.current);
    }
  }, []);

  return ref;
};

/**
 * useErrorAnimation Hook
 * Shake animation for errors
 */
export const useErrorAnimation = (trigger: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger && ref.current) {
      animations.errorShake(ref.current);
    }
  }, [trigger]);

  return ref;
};

/**
 * useRevealAnimation Hook
 * Reveal animation with clip-path
 */
export const useRevealAnimation = (duration = 0.8) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animations.reveal(ref.current, duration);
    }
  }, [duration]);

  return ref;
};

/**
 * useControlledTimeline Hook
 * Create and control a GSAP timeline manually
 */
export const useControlledTimeline = () => {
  const timelineRef = useRef(gsap.timeline({ paused: true }));

  return {
    timeline: timelineRef.current,
    play: () => timelineRef.current.play(),
    pause: () => timelineRef.current.pause(),
    reverse: () => timelineRef.current.reverse(),
    seek: (position: number) => timelineRef.current.seek(position),
    kill: () => timelineRef.current.kill(),
  };
};

export default {
  usePageTransition,
  useFadeIn,
  useSlideInUp,
  useStagger,
  useHoverScale,
  useCountUp,
  useGlowEffect,
  usePulse,
  useRotate,
  useLoadingSpinner,
  useIntersectionAnimation,
  useScrollParallax,
  useSuccessAnimation,
  useErrorAnimation,
  useRevealAnimation,
  useControlledTimeline,
};
