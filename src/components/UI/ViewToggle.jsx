import { motion } from 'framer-motion';

export default function ViewToggle({ viewMode, onToggle }) {
  return (
    <motion.div
      className="view-toggle"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <button
        className={viewMode === 'satellite' ? 'active' : ''}
        onClick={() => viewMode !== 'satellite' && onToggle()}
      >
        🛰️ Satelital
      </button>
      <button
        className={viewMode === 'topographic' ? 'active' : ''}
        onClick={() => viewMode !== 'topographic' && onToggle()}
      >
        🗺️ Topográfica
      </button>
    </motion.div>
  );
}
