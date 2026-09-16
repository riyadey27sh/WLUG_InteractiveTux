import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Quote } from 'lucide-react';
import currentBoardData from '../data/current_board.json';
import pastBoardsData from '../data/past_boards.json';

const tierMeta = {
  mentor: 'Mentors',
  main: 'Main Board',
  assistant: 'Assistant Board',
  member: 'Members'
};

const Board = () => {
  const [view, setView] = useState('current');
  const [activeTab, setActiveTab] = useState('main');
  
  const alumniYears = Object.keys(pastBoardsData).sort((a, b) => parseInt(b) - parseInt(a));
  const [selectedYear, setSelectedYear] = useState(alumniYears[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Meet the <span className="text-primary">Team</span>
          </h1>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-[#12121A] border border-white/[0.06] rounded-full p-1.5 flex shadow-2xl">
            <button
              onClick={() => { setView('current'); setIsDropdownOpen(false); }}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                view === 'current'
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Current Board
            </button>
            <button
              onClick={() => setView('alumni')}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                view === 'alumni'
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Boards
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === 'current' ? (
            <motion.div
              key="current"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Tabs for Current Board */}
              <div className="flex flex-wrap justify-center gap-2 mb-16">
                {Object.entries(tierMeta).map(([tier, label]) => {
                  const hasMembers = currentBoardData[tier] && currentBoardData[tier].length > 0;
                  if (!hasMembers) return null;
                  
                  return (
                    <button
                      key={tier}
                      onClick={() => setActiveTab(tier)}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                        activeTab === tier
                          ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                          : 'bg-[#0A0A0F] border border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mt-8"
                  >
                    {currentBoardData[activeTab]?.map((member, i) => (
                      <MemberCard key={member.name} member={member} index={i} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="alumni"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* Year Selector Dropdown */}
              <div className="flex justify-center mb-16 relative z-30">
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between gap-4 w-64 bg-[#0A0A0F] border border-primary/30 rounded-xl px-6 py-4 text-white hover:bg-primary/5 transition-colors shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-mono text-gray-500 uppercase">Viewing Year</span>
                      <span className="text-xl font-bold">{selectedYear}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-[#12121A] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                      >
                        {alumniYears.map(year => (
                          <button
                            key={year}
                            onClick={() => { setSelectedYear(year); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-6 py-4 transition-colors font-bold ${
                              selectedYear === year ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Display selected year board */}
              <div className="space-y-24 relative z-10">
                {Object.entries(tierMeta).map(([tier, label]) => {
                  const yearBoard = pastBoardsData[selectedYear];
                  const members = yearBoard[tier] || [];
                  if (members.length === 0) return null;

                  return (
                    <motion.div 
                      key={`${selectedYear}-${tier}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-16 border-b border-white/[0.06] pb-4 text-center">
                        {label}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mt-8">
                        {members.map((member, i) => (
                          <MemberCard key={member.name} member={member} index={i} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ═══ Universal Sharp Tech Member Card (Medium Floating Photo) ═══ */
const MemberCard = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="tech-card relative group flex flex-col bg-[#0A0A0F] pt-14 pb-6 px-6 mt-8"
    >
      {/* Floating Medium Profile Photo */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-[#0A0A0F] bg-[#18181B] shadow-2xl overflow-hidden group-hover:-translate-y-2 group-hover:shadow-primary/30 transition-all duration-500 z-20">
        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#18181B] to-[#0A0A0F]">
            <span className="text-xl font-mono font-bold text-gray-600 uppercase group-hover:text-primary transition-colors">{member.name.substring(0, 2)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col text-center">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-6">
          {member.position}
        </p>

        {member.quote && (
          <div className="mt-auto mb-6 relative group-hover:text-gray-300 transition-colors">
            <Quote className="absolute left-1/2 -translate-x-1/2 -top-4 w-4 h-4 text-white/[0.05] group-hover:text-primary/20 transition-colors" />
            <p className="text-xs text-gray-400 leading-relaxed italic line-clamp-3">
              "{member.quote}"
            </p>
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 mt-auto border-t border-white/[0.06] pt-4">
          {member.github && (
            <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          )}
          {member.linkedin && (
            <a href={`https://linkedin.com/in/${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Board;
