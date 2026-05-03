export default function SoundToggle({ enabled, onToggle }) {
  return (
    <button
      className={`sound-toggle ${enabled ? 'active' : ''}`}
      onClick={onToggle}
      title={enabled ? 'Silenciar' : 'Activar sonido'}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
