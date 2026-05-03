import { motion } from 'framer-motion';

export default function TourButton({ isTourActive, onToggle }) {
  return (
    <motion.button
      className={`tour-button ${isTourActive ? 'active' : ''}`}
      onClick={onToggle}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      {isTourActive ? '⏹️ Detener Tour' : '▶️ Iniciar Tour'}
    </motion.button>
  );
}
