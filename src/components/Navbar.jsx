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
    { path: '/board', label: 'Board' },
    { path: '#contact', label: 'Contact Us' }
  ];

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 flex justify-center pt-6 px-4 transition-all duration-500 ${
        scrolled ? 'translate-y-0' : 'translate-y-2'
      }`}
    >
      <div 
        className={`flex items-center justify-between gap-2 md:gap-8 px-4 md:px-6 py-2.5 rounded-full transition-all duration-500 border ${
          scrolled 
            ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-white/[0.08] shadow-2xl' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <Link to="/" className="flex items-center justify-center pr-4 md:border-r border-white/[0.1]">
          <img src="/wlug-logo.webp" alt="WLUG Logo" className="h-8 object-contain" />
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const isAnchor = link.path.startsWith('#');
            const Element = isAnchor ? 'a' : Link;
            return (
              <Element
                key={link.path}
                to={!isAnchor ? link.path : undefined}
                href={isAnchor ? `/${link.path}` : undefined}
                className={`relative px-2 md:px-4 py-2 text-sm font-medium transition-colors ${
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
