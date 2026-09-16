import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useAnimation } from 'framer-motion';
import { ArrowRight, Terminal, X, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import LinuxEasterEgg from '../components/LinuxEasterEgg';

const galleryItems = [
  { id: 1, src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800", alt: "Community Meetup", rotate: -5, col: "col-span-2", row: "row-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", alt: "Hackathon Night", rotate: 2, col: "col-span-1", row: "row-span-1" },
  { id: 3, src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800", alt: "Code Sprint", rotate: -3, col: "col-span-1", row: "row-span-2" },
  { id: 4, src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800", alt: "Linux Install Fest", rotate: 6, col: "col-span-1", row: "row-span-1" },
  { id: 5, src: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800", alt: "Server Setup", rotate: -2, col: "col-span-2", row: "row-span-1" },
];

// Authentic Linux Distro Image URLs
const organicLogos = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo-ubuntu_cof-orange-hex.svg", x: "10%", y: "25%", w: 64, mobX: "2%", mobY: "15%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Debian-OpenLogo.svg", x: "85%", y: "20%", w: 56, mobX: "80%", mobY: "18%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Archlinux-icon-crystal-64.svg", x: "85%", y: "70%", w: 60, mobX: "80%", mobY: "50%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/7/79/Docker_%28container_engine%29_logo.png", x: "10%", y: "75%", w: 72, mobX: "2%", mobY: "75%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg", x: "70%", y: "85%", w: 56, mobX: "80%", mobY: "78%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg", x: "20%", y: "15%", w: 64, mobX: "2%", mobY: "45%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/4/42/Opensource.svg", x: "15%", y: "50%", w: 60, mobX: "40%", mobY: "88%" }
];

// Title letter animation variants
const titleVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -90, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 200,
      damping: 12
    }
  }),
  wave: (i) => ({
    y: [0, -35, 0],
    scale: [1, 1.3, 1],
    transition: {
      delay: i * 0.03,
      duration: 0.5,
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  })
};

const Home = () => {
  const [lightboxImage, setLightboxImage] = useState(null);
  
  // Title Animation Controls
  const controls = useAnimation();
  const [isWaving, setIsWaving] = useState(false);
  
  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const handleTitleClick = async () => {
    if (isWaving) return;
    setIsWaving(true);
    await controls.start("wave");
    controls.start("visible");
    setIsWaving(false);
  };
  
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

  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
  
  // Deck to Grid Gallery State
  const [isGrid, setIsGrid] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center px-4 md:px-6 pt-20 overflow-hidden bg-[#0A0A0F]">
        
        {/* Ambient Base Layer (PC) - Always faintly visible so it's not completely empty */}
        <div className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-[0.03]">
          {organicLogos.map((logo, i) => (
            <img 
              key={`ambient-${i}`} 
              src={logo.src} 
              alt="Distro" 
              className="absolute grayscale"
              style={{ left: logo.x, top: logo.y, width: logo.w, height: 'auto' }} 
            />
          ))}
        </div>

        {/* Organic Flashlight Reveal Layer (PC) */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.05)_0%,transparent_100%)]"
          style={{ WebkitMaskImage: hasMouseMoved ? maskImage : 'none', maskImage: hasMouseMoved ? maskImage : 'none' }}
        >
          {organicLogos.map((logo, i) => (
            <img 
              key={`reveal-${i}`} 
              src={logo.src} 
              alt="Distro" 
              className="absolute drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-1000"
              style={{ left: logo.x, top: logo.y, width: logo.w, height: 'auto' }} 
            />
          ))}
        </motion.div>

        {/* Mobile Background Fallback (Restricted Edges) */}
        <div className="absolute inset-0 z-0 pointer-events-none md:hidden overflow-hidden">
          {organicLogos.map((logo, i) => (
            <motion.img
              key={`mob-${i}`}
              src={logo.src}
              alt="Distro"
              className="absolute opacity-20 mix-blend-screen"
              style={{
                left: logo.mobX,
                top: logo.mobY,
                width: logo.w * 0.75, // slightly smaller on mobile
              }}
              animate={{
                y: [0, 15, 0],
                rotate: [0, Math.random() * 10 - 5, 0]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 pointer-events-none">
          {/* Animated Title in two distinct lines */}
          <h1 
            onClick={handleTitleClick}
            className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight drop-shadow-2xl flex flex-col items-center justify-center gap-y-2 cursor-pointer select-none perspective-[1000px] pointer-events-auto"
          >
            <span className="inline-flex text-white">
              {"Walchand Linux".split("").map((char, i) => (
                <motion.span 
                  custom={i} 
                  variants={titleVariants} 
                  initial="hidden" 
                  animate={controls} 
                  key={`line1-${i}`}
                  className="inline-block origin-bottom"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
            <span className="inline-flex">
              {"Users' Group".split("").map((char, i) => (
                <motion.span 
                  custom={i + 14} 
                  variants={titleVariants} 
                  initial="hidden" 
                  animate={controls} 
                  key={`line2-${i}`}
                  className="inline-block origin-bottom text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-8 text-xs md:text-2xl font-mono text-primary font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] mb-12 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)] pointer-events-auto"
          >
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Community.</motion.span>
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Knowledge.</motion.span>
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Share.</motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
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
      <section id="about" className="py-24 md:py-32 px-6 border-t border-white/[0.06] relative">
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
            <div className="space-y-6 text-gray-400 leading-relaxed text-base md:text-lg mb-12">
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
                <div className="inline-flex items-center gap-3 px-4 md:px-5 py-3 rounded-lg bg-[#0A0A0F] border border-white/10 hover:border-primary/50 text-gray-400 hover:text-white transition-all cursor-pointer group shadow-xl max-w-full overflow-hidden">
                  <Terminal className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-xs md:text-sm tracking-wide truncate">
                    guest@wlug:~$ <span className="text-primary group-hover:text-white transition-colors">./init.sh</span>
                  </span>
                  <span className="w-1.5 h-3 md:w-2 md:h-4 bg-primary/50 animate-pulse ml-1 flex-shrink-0" />
                </div>
              </LinuxEasterEgg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ GALLERY (DECK TO GRID) ═══ */}
      <section className="py-24 md:py-32 px-4 md:px-6 border-t border-white/[0.06] bg-[#050508] relative overflow-hidden min-h-[600px] md:min-h-[800px]">
        <div className="max-w-6xl mx-auto relative z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Gallery</h2>
            <p className="text-gray-500 text-sm md:text-lg">Tap the deck to scatter.</p>
          </motion.div>
        </div>

        {/* Layout Container */}
        <div 
          onClick={() => setIsGrid(!isGrid)}
          className={`mx-auto relative cursor-pointer transition-all duration-700 ${
            isGrid ? 'max-w-4xl grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[180px] gap-3 md:gap-4' : 'max-w-6xl flex items-center justify-center h-[300px] md:h-[500px]'
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
              className={`group bg-white rounded-md shadow-2xl p-1.5 md:p-2 overflow-hidden ${
                isGrid ? `relative ${img.col} ${img.row}` : 'absolute w-40 md:w-80 p-2 md:p-3'
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
                    className="pt-2 md:pt-4 pb-1 md:pb-2 text-center text-black/70 font-medium text-[10px] md:text-sm font-mono pointer-events-none"
                  >
                    {img.alt}
                  </motion.div>
                )}
              </AnimatePresence>
              {isGrid && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-6 pointer-events-none z-10">
                  <span className="text-white text-xs md:text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.alt}</span>
                  <div className="w-4 md:w-8 h-0.5 md:h-1 bg-primary mt-2 md:mt-3 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT US (HORIZONTAL) ═══ */}
      <section id="contact" className="py-24 md:py-32 px-4 md:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-12 md:mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Get in Touch</h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl">
              Have questions or want to join the community? We're always open to collaborate.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
            {/* Info Cards Side */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-1 space-y-4 md:space-y-6"
            >
              <a href="#" className="tech-card p-5 md:p-6 flex items-center gap-4 md:gap-6 hover:translate-x-2 transition-transform">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg text-white font-bold mb-1">WhatsApp</h3>
                  <p className="text-xs md:text-sm text-gray-500">Join our community</p>
                </div>
              </a>
              <a href="mailto:contact@wlug.club" className="tech-card p-5 md:p-6 flex items-center gap-4 md:gap-6 hover:translate-x-2 transition-transform">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg text-white font-bold mb-1">Email Us</h3>
                  <p className="text-xs md:text-sm text-gray-500">contact@wlug.club</p>
                </div>
              </a>
            </motion.div>
            
            {/* Form Side */}
            <motion.form 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-2 tech-card p-6 md:p-10 flex flex-col gap-4 md:gap-6 shadow-2xl" 
              onSubmit={e => e.preventDefault()}
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Send a Message</h3>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <input type="text" placeholder="Your Name" className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-white focus:outline-none focus:border-primary transition-colors" />
                <input type="email" placeholder="Your Email" className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <textarea placeholder="Message" rows={4} className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-white focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
              <div className="flex justify-end mt-2">
                <button type="submit" className="tech-button flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 w-full md:w-auto">
                  Send Message <Send className="w-4 h-4 md:w-5 md:h-5" />
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
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/10 text-white hover:bg-primary transition-colors z-50"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-[95vw] max-h-[85vh] md:max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
