import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import FloatingSphere from './FloatingSphere';
import Platform from './Platform';
import { zones, zoneOrder } from '../../data/zones';

export default function LobbyScene({ onSelectZone }) {
  const ambientRef = useRef();
  const zoomComplete = useRef(false);

  // Smart Zoom logic
  useFrame((state) => {
    if (!zoomComplete.current) {
      const targetPos = new THREE.Vector3(-4.2, 8, 12); // Slightly further back for better view
      state.camera.position.lerp(targetPos, 0.05); // Faster lerp
      if (state.camera.position.distanceTo(targetPos) < 0.5) {
        zoomComplete.current = true;
      }
    }
  });

  // Connection lines points
  const points = zoneOrder.map(id => zones[id].spherePosition);

  return (
    <>
      {/* Lighting */}
      <ambientLight ref={ambientRef} intensity={0.3} />
      <pointLight position={[0, 8, 0]} intensity={1.5} color="#6d28d9" distance={30} />
      <pointLight position={[-5, 4, 3]} intensity={0.8} color="#22c55e" distance={20} />
      <pointLight position={[5, 4, -3]} intensity={0.8} color="#3b82f6" distance={20} />
      <directionalLight position={[5, 10, 5]} intensity={0.4} color="#e2e8f0" />

      {/* Stars background */}
      <Stars
        radius={80}
        depth={60}
        count={3000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Fog */}
      <fog attach="fog" args={['#0f172a', 10, 40]} />

      {/* Platform / Map */}
      <Platform />

      {/* Connection Lines */}
      <Line
        points={points}
        color="#6d28d9"
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed={false}
      />

      {/* Floating Spheres */}
      {zoneOrder.map((zoneId, i) => {
        const zone = zones[zoneId];
        return (
          <FloatingSphere
            key={zoneId}
            position={zone.spherePosition}
            color={zone.color}
            glowColor={zone.glowColor}
            name={zone.name}
            subtitle={zone.subtitle}
            texture={zone.texture}
            index={i}
            onClick={() => onSelectZone(zoneId)}
          />
        );
      })}

      {/* Ambient particles */}
      <AmbientParticles />
    </>
  );
}

function AmbientParticles() {
  const meshRef = useRef();
  const count = 200;

  const positions = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) => {
      const idx = i % 3;
      if (idx === 0) return (Math.random() - 0.5) * 30;
      if (idx === 1) return Math.random() * 15 - 3;
      return (Math.random() - 0.5) * 30;
    })
  ).current;

  const colors = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) => {
      const palette = [
        [0.54, 0.36, 0.96],
        [0.13, 0.77, 0.37],
        [0.97, 0.45, 0.09],
      ];
      const c = palette[Math.floor(i / 3) % 3];
      return c[i % 3];
    })
  ).current;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      const posArr = meshRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
