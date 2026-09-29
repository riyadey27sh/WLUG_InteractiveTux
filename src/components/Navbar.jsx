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
      className={`fixed top-0 left-0 w-full px-8 md:px-12 py-5 flex items-center justify-between z-50 transition-all duration-500 pointer-events-auto ${
        scrolled ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.08]' : 'bg-transparent'
      }`}
    >
      {/* Left: WLUG Logo and branding text */}
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img src="/wlug-logo.webp" alt="WLUG Logo" className="h-10 md:h-12 object-contain" />
        <div className="hidden sm:flex flex-col">
          <span className="text-white font-bold text-sm leading-tight tracking-tight">Walchand Linux</span>
          <span className="text-[#A0C4E2] text-[10px] uppercase font-mono tracking-wider">Users' Group</span>
        </div>
      </Link>

      {/* Center/Right: Nav items */}
      <div className="hidden md:flex items-center gap-4">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-2 py-2 flex flex-col items-center text-sm font-mono transition-colors whitespace-nowrap ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <span className="relative z-10">{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-dot"
                  className="w-1.5 h-1.5 rounded-full bg-[#A0C4E2] shadow-[0_0_8px_#A0C4E2] mx-auto mt-1 absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Far Right: Interactive terminal pill button */}
      <div className="flex items-center">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C3041] hover:bg-[#A0C4E2] text-[#FFFFFF] hover:text-[#1C3041] border border-white/10 font-mono text-sm font-bold transition-all duration-300 group">
          <Terminal className="w-4 h-4" />
          <span className="hidden sm:inline">&gt;_ ./join.sh</span>
          <span className="sm:hidden">Join</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
