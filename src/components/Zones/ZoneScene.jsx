import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ProceduralTerrain from '../Terrain/ProceduralTerrain';
import DynamicWater from '../Terrain/DynamicWater';
import Flora from '../Terrain/Flora';
import LowPolyTown from '../Terrain/LowPolyTown';
import TourController from './TourController';
import { zones } from '../../data/zones';

export default function ZoneScene({ zoneId, viewMode, onHotspotClick, onQuizTrigger, isTourActive, onTourEnd }) {
  const zone = zones[zoneId];
  if (!zone) return null;

  // We only render water if the level is > -1.0 so we don't waste performance on dry zones
  const showWater = zone.terrainConfig.waterLevel !== undefined && zone.terrainConfig.waterLevel > -1.0;

  // Flora density: denser in piedemonte, moderate in valley (sparse near center), sparser in morros
  const floraCount = zoneId === 'piedemonte' ? 900 : (zoneId === 'valle' ? 700 : 450);

  return (
    <>
      <TourController 
        isActive={isTourActive} 
        hotspots={zone.hotspots} 
        onTourEnd={onTourEnd} 
        onHotspotReached={onHotspotClick} 
      />

      {/* === LOW POLY LIGHTING SETUP === */}
      
      {/* Sky hemisphere: bright daylight blue sky + warm ground bounce */}
      <hemisphereLight args={['#87CEEB', '#5a8c4a', 0.8]} />
      
      {/* Main directional sun — warm white, brighter for clear day */}
      <directionalLight
        position={zoneId === 'morros' ? [12, 15, 8] : [10, 18, 10]}
        intensity={1.8}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-10, 5, -8]}
        intensity={0.3}
        color="#a0c0e0"
      />
      
      {/* Ambient base for shadow areas */}
      <ambientLight intensity={0.25} color="#e8e0d8" />

      {/* Clear daylight sky background, no fog */}
      <color attach="background" args={['#87CEEB']} />

      {/* Terrain */}
      <ProceduralTerrain config={zone.terrainConfig} viewMode={viewMode} />

      {/* Low Poly Flora (4 tree types + bushes, naturally distributed) */}
      <Flora config={zone.terrainConfig} size={30} count={floraCount} />

      {/* Low Poly Town (only in Valle) */}
      {zoneId === 'valle' && <LowPolyTown config={zone.terrainConfig} size={30} />}

      {/* Dynamic Water — river for valley, flat plane for others */}
      {showWater && (
        <DynamicWater 
          level={zone.terrainConfig.waterLevel} 
          size={30} 
          zoneType={zone.terrainConfig.type}
        />
      )}

      {/* Hotspot markers */}
      {zone.hotspots.map((hotspot) => (
        <HotspotMarker3D
          key={hotspot.id}
          hotspot={hotspot}
          onClick={() => onHotspotClick(hotspot)}
        />
      ))}

      {/* Quiz trigger for piedemonte */}
      {zoneId === 'piedemonte' && zone.quiz && (
        <QuizTrigger3D
          position={[-1, 5.5, -2]}
          onClick={onQuizTrigger}
        />
      )}
    </>
  );
}

function HotspotMarker3D({ hotspot, onClick }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        hotspot.position[1] + Math.sin(state.clock.elapsedTime * 1.2 + hotspot.position[0]) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={hotspot.position}>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.12} />
      </mesh>

      {/* HTML marker */}
      <Html center distanceFactor={12} zIndexRange={[10, 0]}>
        <div className="hotspot-marker" onClick={onClick} title={hotspot.title}>
          ℹ️
        </div>
      </Html>
    </group>
  );
}

function QuizTrigger3D({ position, onClick }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#f97316"
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      <mesh scale={1.4}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.08} wireframe />
      </mesh>
      <Html center distanceFactor={12} zIndexRange={[10, 0]}>
        <div className="quiz-trigger" onClick={onClick} title="Desafío de Pariapán">
          🎮
        </div>
      </Html>
    </group>
  );
}
