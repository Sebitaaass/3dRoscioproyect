import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  size: 2 + Math.random() * 3,
  color: ['rgba(139,92,246,0.5)', 'rgba(34,197,94,0.4)', 'rgba(249,115,22,0.4)'][Math.floor(Math.random() * 3)],
}));

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 600);
          return 100;
        }
        return p + Math.random() * 3 + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  const displayProgress = Math.min(Math.round(progress), 100);

  return (
    <AnimatePresence>
      {progress <= 100 && (
        <motion.div
          className="loader-container"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="loader-particles">
            {particles.map((p) => (
              <div
                key={p.id}
                className="loader-particle"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="loader-title">Roscio 360°</h1>
          </motion.div>

          <motion.p
            className="loader-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Explorer
          </motion.p>

          <motion.div
            className="loader-bar-container"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="loader-bar" style={{ width: `${displayProgress}%` }} />
          </motion.div>

          <motion.p
            className="loader-percent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {displayProgress}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
