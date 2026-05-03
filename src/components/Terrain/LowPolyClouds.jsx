import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export default function LowPolyClouds({ count = 25, radius = 40 }) {
  const meshRef = useRef();

  // Generate random cloud clusters
  const cloudsData = useMemo(() => {
    const data = [];
    const tempObj = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Distribute clouds in a ring/dome around the scene
      const angle = Math.random() * Math.PI * 2;
      const dist = (0.3 + Math.random() * 0.7) * radius;
      
      const cx = Math.cos(angle) * dist;
      const cz = Math.sin(angle) * dist;
      const cy = 16 + Math.random() * 8; // High in the sky

      // Each cloud is made of 2 to 4 overlapping "puffs" (dodecahedrons)
      const puffs = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < puffs; j++) {
        // Cluster puffs closely together
        const px = cx + (Math.random() - 0.5) * 3.5;
        const pz = cz + (Math.random() - 0.5) * 3.5;
        const py = cy + (Math.random() - 0.5) * 1.5;
        
        const scale = 1.8 + Math.random() * 2.5;
        
        tempObj.position.set(px, py, pz);
        tempObj.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        // Squashed horizontally to look more like fluffy clouds
        tempObj.scale.set(scale * 1.2, scale * 0.6, scale * 1.2);
        tempObj.updateMatrix();
        
        data.push(tempObj.matrix.clone());
      }
    }
    return data;
  }, [count, radius]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      cloudsData.forEach((m, i) => {
        meshRef.current.setMatrixAt(i, m);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [cloudsData]);

  // Slowly rotate the entire cloud layer for gentle ambient movement
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, cloudsData.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      {/* Emissive slightly to look bright against the sky, rough to scatter light */}
      <meshStandardMaterial 
        color="#ffffff" 
        flatShading 
        roughness={1.0} 
        emissive="#ffffff" 
        emissiveIntensity={0.15} 
      />
    </instancedMesh>
  );
}
