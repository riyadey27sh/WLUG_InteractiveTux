import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const VerticalNav = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/board', label: 'Board' }
  ];

  return (
    <>
      {/* Top Left Logo Anchor */}
      <div className="fixed top-6 left-8 z-50 pointer-events-auto">
        <Link 
          to="/" 
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img src="/wlug-logo.webp" alt="WLUG Logo" className="h-10 md:h-12 object-contain" />
        </Link>
      </div>

      {/* Top Right Horizontal Nav */}
      <nav className="fixed top-6 right-8 md:right-12 z-50 pointer-events-auto">
        <div className="flex items-center gap-8 md:gap-10 px-8 py-3 rounded-full bg-[#1C3041]/40 border border-white/10 backdrop-blur-xl shadow-2xl">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex items-center justify-center group"
              >
                {/* Full Text Label */}
                <span className={`text-xs md:text-sm font-mono tracking-widest uppercase transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`}>
                  {link.label}
                </span>
                
                {/* Active Pill Indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#A0C4E2] shadow-[0_0_8px_#A0C4E2]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default VerticalNav;
