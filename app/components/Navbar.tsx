import React from 'react'
import { Link } from 'react-router'
import LogoutButton from './LogoutButton'
import { usePageTransition } from '~/lib/useAnimations'
import gsap from 'gsap'

const Navbar = () => {
  const navRef = usePageTransition(0.6)

  return (
    <nav 
      ref={navRef}
      className='fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-row justify-between items-center bg-white/80 backdrop-blur-md rounded-full px-6 md:px-10 py-4 w-11/12 max-w-4xl shadow-lg shadow-gray-200/50 border border-white/50'
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, { y: -4, duration: 0.3, ease: 'power2.out' });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: 'power2.out' });
      }}
    >
      <Link 
        to='/' 
        className='text-xl md:text-2xl font-bold text-gradient hover:opacity-80 transition-opacity'
      >
        RESUMIND
      </Link>
      
      <div className='flex items-center gap-3 md:gap-6'>
        <Link 
          to='/upload' 
          className='btn-primary hidden md:inline-flex px-4 py-2 text-sm md:text-base'
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' });
          }}
        >
          Upload Resume
        </Link>
        <LogoutButton />
      </div>
    </nav>
  )
}

export default Navbar