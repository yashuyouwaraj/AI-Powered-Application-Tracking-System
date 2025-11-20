import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import { usePageTransition } from '~/lib/useAnimations';
import gsap from 'gsap';

export const meta = () => [
  { title: 'Resumind | Sign In' },
  { name: 'description', content: 'Secure sign-in to your account' },
];

export default function Auth() {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = usePageTransition(0.8);
  const signInBtnRef = useRef<HTMLButtonElement>(null);

  const next = location.search.split('next=')[1] || '/';

  useEffect(() => {
    if (auth.isAuthenticated) {
      // Smooth transition animation before redirect
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          navigate(next, { replace: true });
        },
      });
    }
  }, [auth.isAuthenticated, navigate, containerRef, next]);

  const handleSignIn = () => {
    if (signInBtnRef.current) {
      // Button click animation
      gsap.to(signInBtnRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(signInBtnRef.current!, {
            scale: 1,
            duration: 0.2,
            ease: 'elastic.out(1, 0.3)',
          });
        },
      });

      // Start loading spinner
      gsap.to('.signin-spinner', {
        rotation: 360,
        duration: 1,
        ease: 'none',
        repeat: -1,
      });

      auth.signIn();
    }
  };

  return (
    <main
      ref={containerRef}
      className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12'
    >
      <div className='w-full max-w-md'>
        {/* Decorative gradient orb */}
        <div className='absolute inset-0 -z-10 overflow-hidden'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-20'></div>
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-indigo-200 rounded-full blur-3xl opacity-20'></div>
        </div>

        {/* Auth Card */}
        <div className='relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl shadow-indigo-200/50 border border-white/50'>
          {/* Header */}
          <div className='text-center mb-8 md:mb-12'>
            <h1 className='text-3xl md:text-5xl font-bold text-gradient mb-4'>
              Welcome Back
            </h1>
            <p className='text-gray-600 text-lg'>
              Sign in to continue your job journey and get AI-powered resume feedback
            </p>
          </div>

          {/* Sign In Button */}
          <button
            ref={signInBtnRef}
            onClick={handleSignIn}
            disabled={isLoading}
            className='w-full btn-primary group relative overflow-hidden mb-6'
          >
            {isLoading ? (
              <div className='flex items-center justify-center gap-3'>
                <svg
                  className='signin-spinner w-6 h-6 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                <span className='text-lg font-semibold'>Signing you in...</span>
              </div>
            ) : (
              <div className='flex items-center justify-center gap-3'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m14-4V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v2'
                  />
                </svg>
                <span className='text-lg font-semibold'>Sign In with Puter</span>
              </div>
            )}
          </button>

          {/* Divider */}
          <div className='flex items-center gap-4 mb-8'>
            <div className='flex-1 h-px bg-gradient-to-r from-transparent to-gray-300'></div>
            <span className='text-sm text-gray-500'>Secure & Fast</span>
            <div className='flex-1 h-px bg-gradient-to-l from-transparent to-gray-300'></div>
          </div>

          {/* Features */}
          <div className='space-y-4'>
            <FeatureItem
              icon='🔐'
              title='Secure Authentication'
              description='Your data is encrypted and safe'
            />
            <FeatureItem
              icon='⚡'
              title='Instant Feedback'
              description='Get AI-powered resume analysis'
            />
            <FeatureItem
              icon='📊'
              title='Track Applications'
              description='Monitor your job applications'
            />
          </div>

          {/* Footer */}
          <p className='text-center text-xs text-gray-500 mt-8'>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </main>
  );
}

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseEnter = () => {
      gsap.to(el, { x: 8, duration: 0.3, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      gsap.to(el, { x: 0, duration: 0.3, ease: 'power2.out' });
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className='flex gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 hover:border-indigo-300 transition-colors'
    >
      <span className='text-2xl'>{icon}</span>
      <div className='flex flex-col justify-center'>
        <h4 className='font-semibold text-gray-900'>{title}</h4>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
    </div>
  );
};
