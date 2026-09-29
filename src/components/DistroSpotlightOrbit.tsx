import React from 'react';
import { motion } from 'framer-motion';
import { SiArchlinux, SiUbuntu, SiDocker, SiGit, SiDebian, SiPython } from 'react-icons/si';

const distros = [
  { 
    id: 'arch', Icon: SiArchlinux, top: '25%', left: '4%', delay: 0,
    hoverBorder: 'hover:border-[#1793D1]/60', hoverShadow: 'hover:shadow-[0_0_20px_rgba(23,147,209,0.4)]', hoverText: 'group-hover:text-[#1793D1]'
  },
  { 
    id: 'ubuntu', Icon: SiUbuntu, top: '85%', left: '8%', delay: 0.5,
    hoverBorder: 'hover:border-[#E95420]/60', hoverShadow: 'hover:shadow-[0_0_20px_rgba(233,84,32,0.4)]', hoverText: 'group-hover:text-[#E95420]'
  },
  { 
    id: 'git', Icon: SiGit, top: '22%', left: '85%', delay: 0.2,
    hoverBorder: 'hover:border-[#F05032]/60', hoverShadow: 'hover:shadow-[0_0_20px_rgba(240,80,50,0.4)]', hoverText: 'group-hover:text-[#F05032]'
  },
  { 
    id: 'docker', Icon: SiDocker, top: '45%', left: '78%', delay: 1.2,
    hoverBorder: 'hover:border-[#2496ED]/60', hoverShadow: 'hover:shadow-[0_0_20px_rgba(36,150,237,0.4)]', hoverText: 'group-hover:text-[#2496ED]'
  },
  { 
    id: 'debian', Icon: SiDebian, top: '65%', left: '90%', delay: 0.8,
    hoverBorder: 'hover:border-[#A81D33]/60', hoverShadow: 'hover:shadow-[0_0_20px_rgba(168,29,51,0.4)]', hoverText: 'group-hover:text-[#A81D33]'
  },
  { 
    id: 'python', Icon: SiPython, top: '82%', left: '75%', delay: 1.5,
    hoverBorder: 'hover:border-[#FFD43B]/60', hoverShadow: 'hover:shadow-[0_0_20px_rgba(255,212,59,0.3)]', hoverText: 'group-hover:text-[#FFD43B]'
  },
];

const SpotlightCard = ({ Icon, top, left, delay, hoverBorder, hoverShadow, hoverText }) => {
  return (
    <motion.div
      className={`absolute group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#1C3041]/25 border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-110 ${hoverBorder} ${hoverShadow} pointer-events-auto`}
      style={{ top, left }}
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay }}
    >
      <Icon className={`w-7 h-7 text-white/30 transition-colors duration-300 ${hoverText}`} />
    </motion.div>
  );
};

const DistroSpotlightOrbit = React.forwardRef((props, ref) => {
  return (
    <div ref={ref} className="absolute inset-0 z-10 pointer-events-none">
      {distros.map((distro) => (
        <SpotlightCard key={distro.id} {...distro} />
      ))}
    </div>
  );
});

DistroSpotlightOrbit.displayName = 'DistroSpotlightOrbit';

export default DistroSpotlightOrbit;
