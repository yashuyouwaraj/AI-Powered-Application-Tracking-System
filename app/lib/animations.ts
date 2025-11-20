import gsap from 'gsap';

/**
 * GSAP Animation Utilities
 * Reusable animation functions for smooth UI interactions
 */

export const animations = {
  /* Page Transitions */
  pageIn: (element: HTMLElement, duration = 0.6) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration, ease: 'power3.out' }
    );
  },

  pageOut: (element: HTMLElement, duration = 0.4) => {
    return gsap.to(element, {
      opacity: 0,
      y: -20,
      duration,
      ease: 'power2.in',
    });
  },

  /* Fade Animations */
  fadeIn: (element: HTMLElement | HTMLElement[], duration = 0.4) => {
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration, ease: 'power2.out' }
    );
  },

  fadeOut: (element: HTMLElement | HTMLElement[], duration = 0.3) => {
    return gsap.to(element, {
      opacity: 0,
      duration,
      ease: 'power2.in',
    });
  },

  /* Slide Animations */
  slideInUp: (element: HTMLElement, duration = 0.5, delay = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
    );
  },

  slideInDown: (element: HTMLElement, duration = 0.5) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: -60 },
      { opacity: 1, y: 0, duration, ease: 'power3.out' }
    );
  },

  slideInLeft: (element: HTMLElement, duration = 0.5) => {
    gsap.fromTo(
      element,
      { opacity: 0, x: -60 },
      { opacity: 1, x: 0, duration, ease: 'power3.out' }
    );
  },

  slideInRight: (element: HTMLElement, duration = 0.5) => {
    gsap.fromTo(
      element,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration, ease: 'power3.out' }
    );
  },

  /* Scale Animations */
  scaleIn: (element: HTMLElement, duration = 0.4) => {
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration, ease: 'back.out(1.7)' }
    );
  },

  scaleOut: (element: HTMLElement, duration = 0.3) => {
    return gsap.to(element, {
      opacity: 0,
      scale: 0.8,
      duration,
      ease: 'back.in(1.7)',
    });
  },

  /* Stagger Animations - Perfect for lists */
  staggerFadeIn: (elements: HTMLElement[], duration = 0.3, stagger = 0.1) => {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power2.out',
      }
    );
  },

  staggerSlideUp: (elements: HTMLElement[], duration = 0.4, stagger = 0.12) => {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
      }
    );
  },

  /* Button Interactions */
  buttonHover: (element: HTMLElement) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
    return tl;
  },

  buttonClick: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(element, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.3)' });
      },
    });
  },

  /* Card Animations */
  cardHover: (element: HTMLElement) => {
    gsap.to(element, {
      y: -8,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  cardHoverOut: (element: HTMLElement) => {
    gsap.to(element, {
      y: 0,
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  /* Number Counter Animation */
  countTo: (
    element: HTMLElement,
    from: number,
    to: number,
    duration = 2
  ) => {
    const obj = { value: from };
    gsap.to(obj, {
      value: to,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      },
    });
  },

  /* Glow Effect */
  glowEffect: (element: HTMLElement, duration = 0.6) => {
    gsap.fromTo(
      element,
      { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.7)' },
      {
        boxShadow: '0 0 0 20px rgba(99, 102, 241, 0)',
        duration,
        ease: 'power1.out',
      }
    );
  },

  /* Pulse Animation */
  pulse: (element: HTMLElement, duration = 2) => {
    gsap.to(element, {
      scale: 1.05,
      duration: duration / 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  },

  /* Bounce Animation */
  bounce: (element: HTMLElement, height = 20, duration = 0.6) => {
    gsap.to(element, {
      y: -height,
      duration: duration / 2,
      ease: 'power2.out',
      repeat: 1,
      yoyo: true,
    });
  },

  /* Shake Animation */
  shake: (element: HTMLElement, duration = 0.4) => {
    gsap.to(element, {
      x: -10,
      duration: duration / 4,
      ease: 'sine.inOut',
      repeat: 3,
      yoyo: true,
    });
  },

  /* Rotate Animation */
  rotate: (element: HTMLElement, degrees = 360, duration = 1) => {
    gsap.to(element, {
      rotation: degrees,
      duration,
      ease: 'power2.inOut',
    });
  },

  /* Flip Animation */
  flip: (element: HTMLElement, duration = 0.6) => {
    gsap.to(element, {
      rotationY: 360,
      duration,
      ease: 'back.out(1.7)',
    });
  },

  /* Loading Spinner */
  loadingSpinner: (element: HTMLElement) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      ease: 'none',
      repeat: -1,
    });
  },

  /* Background Shift */
  backgroundShift: (element: HTMLElement, color1: string, color2: string) => {
    gsap.to(element, {
      backgroundPosition: '200% center',
      duration: 3,
      ease: 'none',
      repeat: -1,
      yoyo: true,
    });
  },

  /* Typing Animation (for text) */
  typeText: (element: HTMLElement, text: string, duration = 1.5) => {
    const chars = text.split('');
    element.textContent = '';
    let charIndex = 0;
    gsap.to(
      { progress: 0 },
      {
        progress: 1,
        duration: duration,
        ease: 'none',
        onUpdate: function() {
          const progress = this.progress();
          const currentCharIndex = Math.floor(progress * chars.length);
          element.textContent = chars.slice(0, currentCharIndex).join('');
        },
      }
    );
  },

  /* Parallax Scroll */
  parallax: (element: HTMLElement, speed = 0.5) => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      gsap.to(element, {
        y: scrollY * speed,
        duration: 0,
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  },

  /* Success Check Animation */
  successCheck: (element: HTMLElement) => {
    const tl = gsap.timeline();
    tl.fromTo(
      element,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
    ).to(element, { rotation: 360, duration: 0.6, ease: 'power2.out' }, 0.2);
    return tl;
  },

  /* Error Shake */
  errorShake: (element: HTMLElement) => {
    gsap.to(element, {
      x: -10,
      duration: 0.05,
      ease: 'power2.out',
      repeat: 5,
      yoyo: true,
    });
  },

  /* Reveal Animation */
  reveal: (element: HTMLElement, duration = 0.8) => {
    gsap.fromTo(
      element,
      { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      {
        opacity: 1,
        clipPath: 'inset(0 0 0 0)',
        duration,
        ease: 'power3.out',
      }
    );
  },
};

/**
 * Stagger Animation Timeline
 * Creates a timeline with staggered animations
 */
export const createStaggerTimeline = () => {
  return gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });
};

/**
 * Batch animation for multiple elements with different delays
 */
export const batchAnimate = (
  elements: HTMLElement[],
  fromVars: any,
  toVars: any,
  stagger = 0.1
) => {
  return gsap.fromTo(elements, fromVars, { ...toVars, stagger });
};

export default animations;
