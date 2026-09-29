import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon } from 'lucide-react';

const TRIVIA_QUESTIONS = [
  {
    q: "Who is the creator of the Linux kernel?",
    options: ["Steve Jobs", "Richard Stallman", "Linus Torvalds", "Bill Gates"],
    answer: 2
  },
  {
    q: "Which command is used to list directory contents?",
    options: ["ls", "list", "dir", "show"],
    answer: 0
  },
  {
    q: "What does 'sudo' stand for?",
    options: ["Super User Do", "System Utility Do", "Superuser Data Object", "Start Utility Do"],
    answer: 0
  },
  {
    q: "Which file contains user account information in Linux?",
    options: ["/etc/pass", "/etc/users", "/etc/shadow", "/etc/passwd"],
    answer: 3
  },
  {
    q: "What is the standard text editor in most Linux distros?",
    options: ["nano", "vi/vim", "gedit", "emacs"],
    answer: 1
  }
];

const LinuxEasterEgg = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Matrix State
  const [isMatrix, setIsMatrix] = useState(false);

  // Terminal States
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'WLUG OS v1.0.0 (tty1)' },
    { type: 'system', content: 'Type "help" to see available commands.' }
  ]);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Focus terminal input
  useEffect(() => {
    if (isOpen && !isPlaying && !isMatrix && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isPlaying, isMatrix, history]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleAnswer = (index) => {
    if (index === TRIVIA_QUESTIONS[currentQuestion].answer) {
      setScore(s => s + 1);
    }

    if (currentQuestion + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentQuestion(c => c + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, { type: 'user', content: `guest@wlug:~$ ${input}` }];

    if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'play') {
      newHistory.push({ type: 'system', content: 'Initializing TRIVIA.EXE...' });
      setHistory(newHistory);
      setTimeout(() => startGame(), 600);
    } else if (cmd === 'help') {
      newHistory.push(
        { type: 'system', content: 'Available commands:' },
        { type: 'system', content: '  about   - Learn about WLUG' },
        { type: 'system', content: '  events  - List events' },
        { type: 'system', content: '  play    - Play Linux Trivia' },
        { type: 'system', content: '  matrix  - Enter the matrix' },
        { type: 'system', content: '  sudo    - Execute as root' },
        { type: 'system', content: '  clear   - Clear terminal' }
      );
      setHistory(newHistory);
    } else if (cmd === 'about') {
      newHistory.push(
        { type: 'system', content: 'Walchand Linux Users Group (WLUG) is a community of tech enthusiasts.' },
        { type: 'system', content: 'Founded in 2003, we promote open-source software, host hackathons, and build cool projects.' }
      );
      setHistory(newHistory);
    } else if (cmd === 'events') {
      newHistory.push(
        { type: 'system', content: 'WLUG Events:' },
        { type: 'system', content: ' - Linux Diary: A deep dive into the Linux ecosystem.' },
        { type: 'system', content: ' - Metamorphosis: Our annual flagship tech symposium.' },
        { type: 'system', content: 'Check out the /events page for more details!' }
      );
      setHistory(newHistory);
    } else if (cmd === 'whoami') {
      newHistory.push({ type: 'system', content: 'guest_user' });
      setHistory(newHistory);
    } else if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
      newHistory.push({ type: 'system', content: 'guest_user is not in the sudoers file. This incident will be reported.' });
      setHistory(newHistory);
    } else if (cmd === 'matrix') {
      newHistory.push({ type: 'system', content: 'Follow the white rabbit...' });
      setHistory(newHistory);
      setTimeout(() => setIsMatrix(true), 1000);
      setTimeout(() => {
        setIsMatrix(false);
        setHistory(h => [...h, { type: 'system', content: 'Connection terminated.' }]);
      }, 5000);
    } else {
      newHistory.push({ type: 'system', content: `bash: ${cmd}: command not found` });
      setHistory(newHistory);
    }
    setInput('');
  };

  const closeGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setHistory([...history, { type: 'system', content: `Trivia exited. Score: ${score}/${TRIVIA_QUESTIONS.length}` }]);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block">
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0A1118]/95 rounded-xl overflow-hidden shadow-2xl shadow-[#1C3041]/50 border border-[#1C3041]/80 relative backdrop-blur-xl"
            >
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20 mix-blend-overlay" />

              {/* Terminal Header */}
              <div className="bg-[#1C3041]/40 px-4 py-3 flex items-center justify-between border-b border-[#1C3041]/80">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-[#A0C4E2]" />
                  <span className="text-xs font-mono text-[#A0C4E2] tracking-widest">GUEST_TERMINAL // WLUG</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors"
                />
              </div>

              {/* Body */}
              <div className="p-6 h-[450px] relative">
                {isMatrix ? (
                  <div className="w-full h-full flex flex-col items-center justify-center font-mono text-green-500 overflow-hidden relative">
                    {/* Fake Matrix Rain */}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-lg whitespace-pre font-bold"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `-${Math.random() * 20}%`,
                          animation: `fall ${1 + Math.random() * 2}s linear infinite`,
                          opacity: 0.2 + Math.random() * 0.8
                        }}
                      >
                        {Array.from({ length: 15 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
                      </div>
                    ))}
                    <style>{`
                      @keyframes fall {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(500px); }
                      }
                    `}</style>
                    <div className="bg-black/80 px-6 py-4 rounded z-10 text-white font-bold animate-pulse text-xl">
                      WAKE UP, GUEST.
                    </div>
                  </div>
                ) : isPlaying ? (
                  <div className="w-full h-full flex flex-col font-mono relative z-10">
                    <div className="flex justify-between w-full mb-8 text-[#A0C4E2] text-sm tracking-widest">
                      <span>TRIVIA SCORE: {score} / {TRIVIA_QUESTIONS.length}</span>
                      <button onClick={closeGame} className="hover:text-[#FFFFFF] transition-colors">[EXIT]</button>
                    </div>

                    {!gameOver ? (
                      <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col"
                      >
                        <h3 className="text-xl text-[#FFFFFF] font-bold mb-8">
                          <span className="text-[#A0C4E2] mr-2">root@wlug:~$</span>
                          {TRIVIA_QUESTIONS[currentQuestion].q}
                        </h3>
                        <div className="space-y-3">
                          {TRIVIA_QUESTIONS[currentQuestion].options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleAnswer(i)}
                              className="w-full text-left px-4 py-3 bg-[#1C3041]/20 border border-[#1C3041]/50 text-[#D4E9F7] hover:text-[#FFFFFF] hover:bg-[#1C3041]/40 hover:border-[#A0C4E2]/50 transition-all rounded"
                            >
                              <span className="text-[#A0C4E2] mr-3 font-bold">[{String.fromCharCode(65 + i)}]</span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-[#A0C4E2] font-bold text-3xl mb-4">TEST COMPLETE</span>
                        <span className="text-[#FFFFFF] text-xl mb-8">FINAL SCORE: {score} / {TRIVIA_QUESTIONS.length}</span>
                        <button
                          onClick={startGame}
                          className="px-6 py-3 bg-[#1C3041]/40 text-[#A0C4E2] border border-[#A0C4E2]/50 hover:bg-[#A0C4E2] hover:text-[#0A1118] transition-colors font-bold tracking-widest"
                        >
                          RETRY
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-full h-full overflow-y-auto font-mono text-sm leading-relaxed"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {history.map((line, i) => (
                      <div key={i} className={`mb-1 ${line.type === 'user' ? 'text-[#FFFFFF]' : 'text-[#A0C4E2]'}`}>
                        {line.content}
                      </div>
                    ))}

                    <form onSubmit={handleSubmit} className="flex items-center mt-2">
                      <span className="text-[#D4E9F7] mr-2">guest@wlug:~$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[#FFFFFF] focus:ring-0"
                        spellCheck="false"
                        autoComplete="off"
                        autoFocus
                      />
                    </form>
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LinuxEasterEgg;
