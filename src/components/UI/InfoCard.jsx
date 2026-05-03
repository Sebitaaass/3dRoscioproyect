import { motion, AnimatePresence } from 'framer-motion';

export default function InfoCard({ hotspot, onClose }) {
  if (!hotspot) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="info-card-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="info-card"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="info-card-icon">{hotspot.icon}</span>
          <h3 className="info-card-title">{hotspot.title}</h3>
          <p className="info-card-content">{hotspot.content}</p>
          <button className="info-card-close" onClick={onClose}>
            Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
