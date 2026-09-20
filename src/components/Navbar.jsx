import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/board', label: 'Board' }
  ];

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 pt-3 md:pt-4 transition-all duration-500 pointer-events-none ${
        scrolled ? 'translate-y-0' : 'translate-y-2'
      }`}
    >
      <div className="w-full px-4 md:px-8 flex relative items-center justify-end md:justify-center">
        
        {/* Absolute Logo outside navbar box */}
        <Link to="/" className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 pointer-events-auto flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/wlug-logo.webp" alt="WLUG Logo" className="h-10 md:h-12 object-contain" />
        </Link>

        {/* Navbar Links Box */}
        <div 
          className={`pointer-events-auto flex items-center gap-2 md:gap-6 px-4 md:px-6 py-2.5 rounded-full transition-all duration-500 border border-white/[0.08] ${
            scrolled ? 'bg-[#0A0A0F]/80 backdrop-blur-xl shadow-2xl' : 'bg-transparent'
          }`}
        >
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Element = Link;
            return (
              <Element
                key={link.path}
                to={link.path}
                className={`relative px-3 md:px-5 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/[0.06] rounded-full border border-white/[0.05]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {isActive && <Terminal className="w-3.5 h-3.5 text-primary" />}
                  {link.label}
                </span>
              </Element>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
