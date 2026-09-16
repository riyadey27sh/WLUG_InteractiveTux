import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 100;

const LinuxEasterEgg = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Terminal States
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'WLUG OS v1.0.0 (tty1)' },
    { type: 'system', content: 'Type "play" to launch the Easter Egg.' },
    { type: 'system', content: 'Type "help" for other commands.' }
  ]);
  
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const gameAreaRef = useRef(null);

  // Focus terminal input
  useEffect(() => {
    if (isOpen && !isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isPlaying, history]);

  // Scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  }, [snake]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    generateFood();
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!isPlaying || gameOver) return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction.x !== -1) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }, [direction, isPlaying, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(moveSnake);
  }, [isPlaying, gameOver, direction, food, generateFood]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, { type: 'user', content: `$ ${input}` }];

    if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'play') {
      newHistory.push({ type: 'system', content: 'Initializing SNAKE.EXE...' });
      setHistory(newHistory);
      setTimeout(() => startGame(), 600);
    } else if (cmd === 'help') {
      newHistory.push({ type: 'system', content: 'Commands: play, whoami, date, clear' });
      setHistory(newHistory);
    } else if (cmd === 'whoami') {
      newHistory.push({ type: 'system', content: 'guest_user@wlug' });
      setHistory(newHistory);
    } else if (cmd === 'sudo') {
      newHistory.push({ type: 'system', content: 'Nice try.' });
      setHistory(newHistory);
    } else {
      newHistory.push({ type: 'system', content: `bash: ${cmd}: command not found` });
      setHistory(newHistory);
    }
    setInput('');
  };

  const closeGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setHistory([...history, { type: 'system', content: `Game exited. Score: ${score}` }]);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
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
              className="w-full max-w-2xl bg-[#0c0c0c] rounded-xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/30 relative"
            >
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20 mix-blend-overlay" />

              {/* Terminal Header */}
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-primary tracking-widest">GUEST_TERMINAL // WLUG</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                />
              </div>

              {/* Body */}
              <div className="p-6 h-[450px] relative">
                {isPlaying ? (
                  <div className="w-full h-full flex flex-col items-center justify-center font-mono" tabIndex={0} ref={gameAreaRef}>
                    <div className="flex justify-between w-full max-w-[400px] mb-4 text-primary text-sm tracking-widest">
                      <span>SCORE: {score.toString().padStart(4, '0')}</span>
                      <button onClick={closeGame} className="hover:text-white transition-colors">[EXIT]</button>
                    </div>
                    
                    <div 
                      className="relative bg-black border-2 border-primary/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                      style={{ width: GRID_SIZE * 15, height: GRID_SIZE * 15 }}
                    >
                      {/* Snake */}
                      {snake.map((segment, i) => (
                        <div
                          key={i}
                          className="absolute bg-primary rounded-sm"
                          style={{
                            left: segment.x * 15,
                            top: segment.y * 15,
                            width: 13,
                            height: 13,
                            boxShadow: '0 0 5px #0ea5e9',
                            opacity: i === 0 ? 1 : 0.8
                          }}
                        />
                      ))}
                      {/* Food */}
                      <div
                        className="absolute bg-red-500 rounded-full animate-pulse"
                        style={{
                          left: food.x * 15,
                          top: food.y * 15,
                          width: 13,
                          height: 13,
                          boxShadow: '0 0 8px red'
                        }}
                      />

                      {gameOver && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center">
                          <span className="text-red-500 font-bold text-2xl mb-2 animate-pulse">GAME OVER</span>
                          <span className="text-white text-sm mb-6">FINAL SCORE: {score}</span>
                          <button 
                            onClick={startGame}
                            className="px-4 py-2 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black transition-colors text-sm"
                          >
                            TRY AGAIN
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-xs text-gray-500">USE WASD OR ARROW KEYS</div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-full overflow-y-auto font-mono text-sm"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {history.map((line, i) => (
                      <div key={i} className={`mb-1.5 ${line.type === 'user' ? 'text-primary' : 'text-gray-400'}`}>
                        {line.content}
                      </div>
                    ))}
                    
                    <form onSubmit={handleSubmit} className="flex items-center mt-3">
                      <span className="text-primary mr-2 font-bold animate-pulse">&gt;</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0"
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
