import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zones } from '../../data/zones';

export default function QuizPanel({ zoneId, onClose, onCorrectAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const zone = zones[zoneId];
  const quiz = zone?.quiz;

  if (!quiz) return null;

  const handleAnswer = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option.id);
    setShowFeedback(true);

    if (option.correct) {
      setTimeout(() => {
        onCorrectAnswer?.();
      }, 500);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const isCorrect = showFeedback && quiz.options.find(o => o.id === selectedAnswer)?.correct;

  return (
    <AnimatePresence>
      <motion.div
        className="quiz-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="quiz-panel"
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="quiz-badge">
            🎮 Desafío de Pariapán
          </div>

          <p className="quiz-question">{quiz.question}</p>

          <div className="quiz-options">
            {quiz.options.map((option) => {
              let className = 'quiz-option';
              if (showFeedback && selectedAnswer === option.id) {
                className += option.correct ? ' correct' : ' incorrect';
              } else if (showFeedback && option.correct) {
                className += ' correct';
              }

              return (
                <motion.button
                  key={option.id}
                  className={className}
                  onClick={() => handleAnswer(option)}
                  whileHover={!showFeedback ? { x: 6 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  disabled={showFeedback}
                >
                  <span className="quiz-option-letter">{option.id}</span>
                  <span>{option.text}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.4 }}
              >
                <p>
                  {isCorrect ? '✅ ' : '❌ '}
                  {isCorrect ? quiz.correctFeedback : quiz.incorrectFeedback}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            {showFeedback && !isCorrect && (
              <motion.button
                className="quiz-close"
                onClick={handleRetry}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#4ade80' }}
              >
                Intentar de nuevo
              </motion.button>
            )}
            <motion.button
              className="quiz-close"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Cerrar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Confetti on correct answer */}
      {isCorrect && <ConfettiEffect />}
    </AnimatePresence>
  );
}

function ConfettiEffect() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.5,
      color: ['#22c55e', '#8b5cf6', '#f97316', '#eab308', '#06b6d4'][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    })), []);

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
