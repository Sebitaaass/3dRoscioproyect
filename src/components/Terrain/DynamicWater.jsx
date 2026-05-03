import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Low Poly Water
// For valley: narrow river following the terrain path
// For other zones: flat water plane
export default function DynamicWater({ level = 0, size = 30, zoneType = 'default' }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    if (zoneType === 'valley') {
      // Build a narrow river mesh following the S-curve path
      const half = size / 2;
      const segments = 60;
      const riverWidth = 1.5; // Wider river to match terrain channel
      const positions = [];
      const indices = [];

      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 - 1; // -1 to 1 (normalized Z)
        const z = t * half;
        
        // River center X (must match terrainUtils.js valley river path)
        const nz = t;
        const riverCenterNx = Math.sin(nz * 2.5) * 0.12 + nz * 0.15;
        const riverCenterX = riverCenterNx * half;

        // Left and right bank vertices
        const idx = i * 2;
        positions.push(
          riverCenterX - riverWidth, level, z,
          riverCenterX + riverWidth, level, z,
        );

        if (i < segments) {
          // Two triangles per quad
          indices.push(
            idx, idx + 2, idx + 1,
            idx + 1, idx + 2, idx + 3,
          );
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    } else {
      // Default flat water plane
      const geo = new THREE.PlaneGeometry(size, size, 1, 1);
      geo.rotateX(-Math.PI / 2);
      return geo;
    }
  }, [size, zoneType, level]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle vertical oscillation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, level, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        color={zoneType === 'valley' ? '#4a9eda' : '#38bdf8'}
        transparent
        opacity={0.8}
        flatShading
        roughness={0.2}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
