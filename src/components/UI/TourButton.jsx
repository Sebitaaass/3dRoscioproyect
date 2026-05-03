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
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 200,
        padding: '12px 24px',
        background: isTourActive ? 'rgba(239, 68, 68, 0.8)' : 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isTourActive ? 'rgba(239, 68, 68, 0.5)' : 'var(--glass-border)'}`,
        borderRadius: '50px',
        color: 'white',
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {isTourActive ? '⏹️ Detener Tour' : '▶️ Iniciar Tour'}
    </motion.button>
  );
}
