import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, Terminal, X, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import LinuxEasterEgg from '../components/LinuxEasterEgg';

const galleryItems = [
  { id: 1, src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800", alt: "Community Meetup", rotate: -5, col: "md:col-span-2", row: "md:row-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", alt: "Hackathon Night", rotate: 2, col: "md:col-span-1", row: "md:row-span-1" },
  { id: 3, src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800", alt: "Code Sprint", rotate: -3, col: "md:col-span-1", row: "md:row-span-2" },
  { id: 4, src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800", alt: "Linux Install Fest", rotate: 6, col: "md:col-span-1", row: "md:row-span-1" },
  { id: 5, src: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800", alt: "Server Setup", rotate: -2, col: "md:col-span-2", row: "md:row-span-1" },
];

// Organic layout of real tech/distro logos
const organicLogos = [
  // Ubuntu
  { d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.666 17.666a2.668 2.668 0 0 1-3.771-3.771l1.885-1.885a1.334 1.334 0 1 0-1.885-1.885l-1.885 1.885a2.668 2.668 0 0 1-3.771-3.771l1.885-1.885a1.334 1.334 0 1 0-1.885-1.885L6.334 6.334a2.668 2.668 0 0 1 3.771-3.771l1.885 1.885a1.334 1.334 0 1 0 1.885-1.885l1.885-1.885a2.668 2.668 0 0 1 3.771 3.771l-1.885 1.885a1.334 1.334 0 1 0 1.885 1.885l1.885-1.885a2.668 2.668 0 0 1 3.771 3.771l-1.885 1.885a1.334 1.334 0 1 0-1.885 1.885l1.885 1.885z", x: "15%", y: "20%" },
  // Arch
  { d: "M12 2L2 22h4l2.5-5h7l2.5 5h4L12 2zm0 4.5l2.5 5h-5l2.5-5z", x: "75%", y: "15%" },
  // Debian (Swirl approx)
  { d: "M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5S8.62 8.5 10 8.5 12.5 9.62 12.5 11 11.38 13.5 10 13.5z", x: "85%", y: "60%" },
  // Docker (Whale approx)
  { d: "M2 14h20v4H2zM4 10h4v2H4zm6 0h4v2h-4zm6 0h4v2h-4z", x: "10%", y: "75%" },
  // Git
  { d: "M12.004 0L.008 12l11.996 12L24 12 12.004 0zm0 2.828l9.172 9.172-9.172 9.172-9.172-9.172 9.172-9.172zM12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z", x: "50%", y: "85%" },
  // Code / Generic
  { d: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z", x: "40%", y: "10%" },
  // Terminal
  { d: "M4 4h16v16H4zM6 8l4 4-4 4 M12 16h4", x: "30%", y: "50%" }
];

const Home = () => {
  const [lightboxImage, setLightboxImage] = useState(null);
  
  // Flashlight Effect for PC
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hasMouseMoved, setHasMouseMoved] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasMouseMoved) setHasMouseMoved(true);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, hasMouseMoved]);

  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
  
  // Deck to Grid Gallery State
  const [isGrid, setIsGrid] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center px-6 pt-20 overflow-hidden bg-[#0A0A0F]">
        
        {/* Organic Flashlight Reveal Layer (PC) */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.1)_0%,transparent_100%)]"
          style={{ WebkitMaskImage: hasMouseMoved ? maskImage : 'none', maskImage: hasMouseMoved ? maskImage : 'none' }}
        >
          {organicLogos.map((logo, i) => (
            <div 
              key={i} 
              className="absolute"
              style={{ left: logo.x, top: logo.y }}
            >
              <svg className="w-16 h-16 text-primary drop-shadow-[0_0_20px_rgba(14,165,233,0.6)] opacity-50 rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d={logo.d} />
              </svg>
            </div>
          ))}
        </motion.div>

        {/* Mobile Background Fallback (Floating Organic Logos) */}
        <div className="absolute inset-0 z-0 pointer-events-none md:hidden overflow-hidden">
          {organicLogos.map((logo, i) => (
            <div
              key={`mob-${i}`}
              className="absolute text-primary/30"
              style={{
                left: logo.x,
                top: logo.y,
                animation: `float ${10 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d={logo.d} />
              </svg>
            </div>
          ))}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              50% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 90 - 45}deg); }
            }
          `}</style>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
              Walchand Linux <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Users' Group</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-base md:text-2xl font-mono text-primary font-bold uppercase tracking-[0.25em] mb-12 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)] pointer-events-auto"
          >
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Community.</motion.span>
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Knowledge.</motion.span>
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Share.</motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
          >
            <Link to="/events" className="tech-button group">
              Explore Events
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#about" className="tech-button-outline">
              Discover More
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ ABOUT US ═══ */}
      <section id="about" className="py-32 px-6 border-t border-white/[0.06] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              About <span className="text-primary">Us</span>.
            </h2>
            <div className="space-y-6 text-gray-400 leading-relaxed text-lg mb-12">
              <p>
                Established in 2003 at Walchand College of Engineering, Sangli.
                WLUG is a collective of passionate developers and open-source purists.
              </p>
              <p>
                We bridge the gap between beginners and fully-fledged open-source contributors.
                From bootcamps and hackathons to technical deep-dives, our mission is to empower through knowledge.
              </p>
            </div>

            {/* Seamless Terminal Trigger */}
            <div className="flex justify-center mt-12">
              <LinuxEasterEgg>
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-[#0A0A0F] border border-white/10 hover:border-primary/50 text-gray-400 hover:text-white transition-all cursor-pointer group shadow-xl">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm tracking-wide">
                    guest@wlug:~$ <span className="text-primary group-hover:text-white transition-colors">./init.sh</span>
                  </span>
                  <span className="w-2 h-4 bg-primary/50 animate-pulse ml-1" />
                </div>
              </LinuxEasterEgg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ GALLERY (DECK TO GRID) ═══ */}
      <section className="py-32 px-6 border-t border-white/[0.06] bg-[#050508] relative overflow-hidden min-h-[800px]">
        <div className="max-w-6xl mx-auto relative z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Gallery</h2>
            <p className="text-gray-500 text-lg">Click the deck to scatter.</p>
          </motion.div>
        </div>

        {/* Layout Container */}
        <div 
          onClick={() => setIsGrid(!isGrid)}
          className={`max-w-6xl mx-auto relative cursor-pointer transition-all duration-700 ${
            isGrid ? 'grid grid-cols-1 md:grid-cols-3 auto-rows-[250px] gap-6' : 'flex items-center justify-center h-[500px]'
          }`}
        >
          {galleryItems.map((img, i) => (
            <motion.div
              layout
              key={img.id}
              initial={false}
              animate={{
                rotate: isGrid ? 0 : img.rotate,
                scale: isGrid ? 1 : 1 + (i * 0.02),
                zIndex: isGrid ? 1 : i
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1.2 }}
              className={`group bg-white rounded-md shadow-2xl p-2 md:p-3 overflow-hidden ${
                isGrid ? `relative ${img.col} ${img.row}` : 'absolute w-64 md:w-80'
              }`}
              onClick={(e) => {
                if (isGrid) {
                  e.stopPropagation();
                  setLightboxImage(img);
                }
              }}
            >
              <motion.img
                layout="position"
                src={img.src}
                alt={img.alt}
                className={`w-full object-cover transition-transform duration-700 rounded-sm border border-gray-200 ${
                  isGrid ? 'h-full group-hover:scale-105' : 'aspect-square'
                }`}
                loading="lazy"
              />
              <AnimatePresence>
                {!isGrid && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pt-4 pb-2 text-center text-black/70 font-medium text-sm font-mono pointer-events-none"
                  >
                    {img.alt}
                  </motion.div>
                )}
              </AnimatePresence>
              {isGrid && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none z-10">
                  <span className="text-white text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.alt}</span>
                  <div className="w-8 h-1 bg-primary mt-3 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT US (HORIZONTAL) ═══ */}
      <section id="contact" className="py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Get in Touch</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Have questions or want to join the community? We're always open to collaborate.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Info Cards Side */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-1 space-y-6"
            >
              <a href="#" className="tech-card p-6 flex items-center gap-6 hover:translate-x-2 transition-transform">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg text-white font-bold mb-1">WhatsApp</h3>
                  <p className="text-sm text-gray-500">Join our community</p>
                </div>
              </a>
              <a href="mailto:contact@wlug.club" className="tech-card p-6 flex items-center gap-6 hover:translate-x-2 transition-transform">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg text-white font-bold mb-1">Email Us</h3>
                  <p className="text-sm text-gray-500">contact@wlug.club</p>
                </div>
              </a>
            </motion.div>
            
            {/* Form Side */}
            <motion.form 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-2 tech-card p-8 md:p-10 flex flex-col gap-6 shadow-2xl" 
              onSubmit={e => e.preventDefault()}
            >
              <h3 className="text-2xl font-bold text-white mb-2">Send a Message</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder="Your Name" className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors" />
                <input type="email" placeholder="Your Email" className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <textarea placeholder="Message" rows={4} className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
              <div className="flex justify-end mt-2">
                <button type="submit" className="tech-button flex items-center gap-2 px-8 py-4">
                  Send Message <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>

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

export default Home;
