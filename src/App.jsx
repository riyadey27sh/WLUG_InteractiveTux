import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Board from './pages/Board';
import ScrollToTop from './components/ScrollToTop';
import { BootProvider } from './components/boot/BootProvider';

function App() {
  const location = useLocation();

  return (
    <BootProvider>
      <div className="min-h-screen bg-background text-white flex flex-col font-sans">
        <ScrollToTop />
        <Navbar />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/board" element={<Board />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </BootProvider>
  );
}

export default App;
