import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Terminal, X, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import LinuxEasterEgg from '../components/LinuxEasterEgg';

const galleryItems = [
  { id: 1, src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800", alt: "Community Meetup" },
  { id: 2, src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", alt: "Hackathon Night" },
  { id: 3, src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800", alt: "Code Sprint" },
  { id: 4, src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800", alt: "Linux Install Fest" },
  { id: 5, src: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800", alt: "Server Setup" },
  { id: 6, src: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?auto=format&fit=crop&q=80&w=800", alt: "Tech Talk" }
];

const Home = () => {
  const [lightboxImage, setLightboxImage] = useState(null);

  // Mouse follower for Hero background
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) * 100 - 50; // -50 to 50
      const y = (clientY / innerHeight) * 100 - 50; // -50 to 50
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Dynamic Tech Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Interactive Glowing Orb */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"
          style={{ x: smoothX, y: smoothY }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-6 leading-tight">
              Walchand Linux <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Users' Group</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-lg font-mono text-primary font-semibold uppercase tracking-[0.2em] mb-12"
          >
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Community.</motion.span>
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Knowledge.</motion.span>
            <motion.span whileHover={{ scale: 1.1, color: "#fff" }} className="cursor-default transition-colors">Share.</motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
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
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                About <span className="text-primary">Us</span>.
              </h2>
              <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
                <p>
                  Established in 2003 at Walchand College of Engineering, Sangli.
                  WLUG is a collective of passionate developers and open-source purists.
                </p>
                <p>
                  We bridge the gap between beginners and fully-fledged open-source contributors.
                  From bootcamps and hackathons to technical deep-dives, our mission is to empower through knowledge.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex justify-end"
            >
              <LinuxEasterEgg>
                <div className="tech-card p-6 flex items-center gap-4 cursor-pointer group w-fit pr-12 shadow-2xl shadow-primary/5 hover:shadow-primary/20">
                  <div className="w-12 h-12 rounded bg-[#0A0A0F] border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <Terminal className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                    <span className="text-primary">guest@wlug</span>:~$ ./play_game.sh<br />
                    <span className="animate-pulse">_</span>
                  </div>
                </div>
              </LinuxEasterEgg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="py-32 px-6 border-t border-white/[0.06] bg-[#050508]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Our Legacy</h2>
              <p className="text-gray-500 text-lg">Moments from our community events.</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse delay-150" />
            </div>
          </motion.div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryItems.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.15 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer break-inside-avoid border border-white/[0.06] shadow-xl hover:shadow-primary/20 transition-all duration-500"
                onClick={() => setLightboxImage(img)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-white text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.alt}</span>
                  <div className="w-8 h-1 bg-primary mt-3 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section className="py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Get in Touch</h2>
            <p className="text-gray-400 mb-16 text-lg max-w-2xl mx-auto">
              Have questions or want to join the community? We're always open to collaborate.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
              <a href="#" className="tech-card p-8 flex flex-col items-center hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl text-white font-bold mb-2">WhatsApp</h3>
                <p className="text-sm text-gray-500">Join our community</p>
              </a>
              <a href="mailto:contact@wlug.club" className="tech-card p-8 flex flex-col items-center hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl text-white font-bold mb-2">Email Us</h3>
                <p className="text-sm text-gray-500">contact@wlug.club</p>
              </a>
            </div>
            
            {/* Simple Contact Form */}
            <form className="max-w-2xl mx-auto tech-card p-8 md:p-10 flex flex-col gap-5 text-left shadow-2xl" onSubmit={e => e.preventDefault()}>
              <h3 className="text-2xl font-bold text-white mb-4">Send a Message</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <input type="text" placeholder="Your Name" className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-colors" />
                <input type="email" placeholder="Your Email" className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <textarea placeholder="Message" rows={4} className="w-full bg-[#0A0A0F] border border-white/[0.1] rounded-lg px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
              <button type="submit" className="tech-button w-full flex items-center justify-center gap-2 mt-4 text-base py-4">
                Send Message <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
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
