import { useState, useCallback, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, CameraControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import LobbyScene from './components/Lobby/LobbyScene';
import ZoneScene from './components/Zones/ZoneScene';
import InfoCard from './components/UI/InfoCard';
import ViewToggle from './components/UI/ViewToggle';
import BackButton from './components/UI/BackButton';
import SoundToggle from './components/UI/SoundToggle';
import QuizPanel from './components/UI/QuizPanel';
import TourButton from './components/UI/TourButton';
import { zones } from './data/zones';

export default function App() {
  // === State ===
  const [scene, setScene] = useState('loading'); // loading | lobby | transitioning | zone
  const [currentZone, setCurrentZone] = useState(null);
  const [viewMode, setViewMode] = useState('satellite');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [transitionZone, setTransitionZone] = useState(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cameraControlsRef = useRef();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // === Handlers ===
  const handleLoadComplete = useCallback(() => {
    setScene('lobby');
  }, []);

  const handleSelectZone = useCallback((zoneId) => {
    setTransitionZone(zoneId);
    setScene('transitioning');

    setTimeout(() => {
      setCurrentZone(zoneId);
      setScene('zone');
      setTransitionZone(null);
      setIsTourActive(false);
    }, 1200);
  }, []);

  const handleReturnToLobby = useCallback(() => {
    setTransitionZone(null);
    setScene('transitioning');
    setIsTourActive(false);

    setTimeout(() => {
      setCurrentZone(null);
      setScene('lobby');
      setActiveHotspot(null);
      setQuizActive(false);
    }, 800);
  }, []);

  const handleToggleView = useCallback(() => {
    setViewMode((v) => (v === 'satellite' ? 'topographic' : 'satellite'));
  }, []);

  const handleHotspotClick = useCallback((hotspot) => {
    setActiveHotspot(hotspot);
  }, []);

  const handleCloseHotspot = useCallback(() => {
    setActiveHotspot(null);
  }, []);

  const handleQuizTrigger = useCallback(() => {
    setQuizActive(true);
  }, []);

  const handleQuizClose = useCallback(() => {
    setQuizActive(false);
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    setQuizCompleted(true);
  }, []);

  const handleToggleTour = useCallback(() => {
    setIsTourActive(prev => {
      if (!prev) {
        setActiveHotspot(null); // Close any open hotspots when starting tour
      }
      return !prev;
    });
  }, []);

  const handleTourEnd = useCallback(() => {
    setIsTourActive(false);
  }, []);

  const zone = currentZone ? zones[currentZone] : null;

  return (
    <>
      {/* Loader */}
      <AnimatePresence>
        {scene === 'loading' && (
          <Loader onComplete={handleLoadComplete} />
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {scene === 'transitioning' && (
          <motion.div
            className="transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="transition-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {transitionZone
                ? `Viajando a ${zones[transitionZone]?.name || ''}...`
                : 'Regresando al Lobby...'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      {scene !== 'loading' && (
        <Canvas
          camera={{
            position: scene === 'zone' && zone
              ? zone.cameraPosition
              : [0, 20, 30],
            fov: 55,
            near: 0.1,
            far: 200,
          }}
          style={{ position: 'fixed', inset: 0 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0f172a');
          }}
        >
          <Suspense fallback={null}>
            {(scene === 'lobby' || (scene === 'transitioning' && !currentZone)) && (
              <LobbyScene onSelectZone={handleSelectZone} />
            )}

            {(scene === 'zone' || (scene === 'transitioning' && currentZone)) && currentZone && (
              <ZoneScene
                zoneId={currentZone}
                viewMode={viewMode}
                onHotspotClick={handleHotspotClick}
                onQuizTrigger={handleQuizTrigger}
                isTourActive={isTourActive}
                onTourEnd={handleTourEnd}
              />
            )}
          </Suspense>

          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            minDistance={8}
            maxDistance={45}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={scene === 'lobby' && !isMobile}
            autoRotateSpeed={0.2} // Much slower rotation for better control
            dampingFactor={0.05}
            enableDamping
            enabled={!isTourActive}
            target={scene === 'lobby' && isMobile ? [-4.8, 0, -3] : [0, 0, 0]}
          />
        </Canvas>
      )}

      {/* === UI Overlays === */}

      {/* Lobby Title */}
      <AnimatePresence>
        {scene === 'lobby' && (
          <motion.div
            className="lobby-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1>Roscio 360° Explorer</h1>
            <p>Explora el relieve del estado Guárico</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lobby Instructions */}
      <AnimatePresence>
        {scene === 'lobby' && (
          <motion.div
            className="lobby-instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Haz clic en una esfera para explorar la zona
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone Title */}
      <AnimatePresence>
        {scene === 'zone' && zone && (
          <motion.div
            className="zone-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 style={{ color: zone.color }}>{zone.name}</h2>
            <span>{zone.subtitle}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <AnimatePresence>
        {scene === 'zone' && (
          <BackButton onClick={handleReturnToLobby} />
        )}
      </AnimatePresence>

      {/* View Toggle */}
      <AnimatePresence>
        {scene === 'zone' && (
          <ViewToggle viewMode={viewMode} onToggle={handleToggleView} />
        )}
      </AnimatePresence>

      {/* Tour Button */}
      <AnimatePresence>
        {scene === 'zone' && (
          <TourButton isTourActive={isTourActive} onToggle={handleToggleTour} />
        )}
      </AnimatePresence>

      {/* Sound Toggle */}
      {scene !== 'loading' && (
        <SoundToggle
          enabled={soundEnabled}
          onToggle={() => setSoundEnabled(!soundEnabled)}
        />
      )}

      {/* Info Card */}
      <AnimatePresence>
        {activeHotspot && (
          <InfoCard hotspot={activeHotspot} onClose={handleCloseHotspot} />
        )}
      </AnimatePresence>

      {/* Quiz Panel */}
      <AnimatePresence>
        {quizActive && currentZone && (
          <QuizPanel
            zoneId={currentZone}
            onClose={handleQuizClose}
            onCorrectAnswer={handleCorrectAnswer}
          />
        )}
      </AnimatePresence>
    </>
  );
}
