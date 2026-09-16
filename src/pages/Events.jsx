import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import eventsData from '../data/events.json';
import pastEventsData from '../data/past_events.json';

const Events = () => {
  const [lightboxImage, setLightboxImage] = useState(null);
  const timelineRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleString('default', { month: 'long' }),
      day: d.getDate().toString().padStart(2, '0'),
      year: d.getFullYear()
    };
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen relative overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Events</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
            From deep technical dives into the Linux Kernel to massive open source bootcamps, explore what we do.
          </p>
        </motion.div>

        {/* ═══ WHAT WE CONDUCT ═══ */}
        <section className="mb-40">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center gap-4 mb-12"
          >
            <h2 className="text-3xl font-bold text-white tracking-tight">What We Conduct</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {eventsData.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative bg-[#0A0A0F] border border-white/[0.06] rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-primary/10 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 z-10" />
                  {event.poster ? (
                    <img src={event.poster} alt={event.title} className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#12121A] to-[#0A0A0F]" />
                  )}
                  {event.isClubService && (
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-primary/30 text-[10px] font-mono text-primary uppercase tracking-wider shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                      Service
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex flex-col flex-grow relative bg-[#0A0A0F]">
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-base text-gray-400 leading-relaxed mb-8 flex-grow">{event.description}</p>
                  
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-white transition-colors mt-auto w-fit">
                      Visit Site <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ PAST EVENTS TIMELINE ═══ */}
        <section>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center gap-4 mb-20"
          >
            <h2 className="text-3xl font-bold text-white tracking-tight">Past Events</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent" />
          </motion.div>

          <div ref={timelineRef} className="relative ml-4 md:ml-12 pb-12">
            
            {/* Scroll-Linked Progress Line */}
            <div className="absolute top-0 bottom-0 left-[7px] w-[2px] bg-white/[0.05]" />
            <motion.div 
              className="absolute top-0 bottom-0 left-[7px] w-[2px] bg-primary origin-top shadow-[0_0_15px_rgba(14,165,233,0.8)]"
              style={{ scaleY }}
            />

            <div className="space-y-24">
              {pastEventsData.map((event, i) => {
                const { month, day, year } = formatDate(event.date);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-150px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative pl-10 md:pl-16 group"
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#0A0A0F] border-2 border-white/20 group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(14,165,233,0.5)] group-hover:scale-125 transition-all duration-300 z-10" />
                    
                    <div className="flex flex-col gap-8">
                      {/* Content Block */}
                      <div className="flex-1 w-full">
                        <div className="tech-card p-8 md:p-10 shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:-translate-y-1">
                          <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{event.title}</h4>
                          <div className="text-sm font-mono text-primary uppercase tracking-widest mb-6">
                            {day} {month} {year}
                          </div>
                          <p className="text-lg text-gray-400 leading-relaxed mb-10">
                            {event.description}
                          </p>

                          {/* Event Photos Grid */}
                          {event.photos && event.photos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {event.photos.map((photo, j) => (
                                <motion.div 
                                  key={j} 
                                  whileHover={{ scale: 1.05 }}
                                  className="aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/[0.06] group/photo shadow-lg relative"
                                  onClick={() => setLightboxImage({ src: photo, alt: `${event.title} photo ${j + 1}` })}
                                >
                                  <img 
                                    src={photo} 
                                    alt="" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" 
                                    loading="lazy" 
                                  />
                                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-primary transition-colors z-50"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
