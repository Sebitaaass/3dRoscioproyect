import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { getTerrainHeight, getTerrainSlope } from './terrainUtils';

export default function Flora({ config, size = 30, count = 600 }) {
  // 4 tree types + bushes
  const pineTopRef = useRef();
  const pineBotRef = useRef();
  const pineTrunkRef = useRef();
  
  const roundTreeRef = useRef();
  const roundTrunkRef = useRef();
  
  const leafyTopRef = useRef();
  const leafyBotRef = useRef();
  const leafyTrunkRef = useRef();
  
  const bushRef = useRef();

  const floraData = useMemo(() => {
    const pines = [];
    const roundTrees = [];
    const leafyTrees = [];
    const bushes = [];

    const tempObject = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * size * 0.92;
      const z = (Math.random() - 0.5) * size * 0.92;
      
      // Use the EXACT same height function as the terrain
      const y = getTerrainHeight(config.type, x, z, size);
      const slope = getTerrainSlope(config.type, x, z, size);
      
      const waterLevel = config.waterLevel || 0;
      
      // Skip: underwater, too steep, above treeline
      if (y <= waterLevel) continue; // Allow trees on the plains just above water
      if (slope > 3.0) continue;
      if (y > 12.0) continue;

      // === VALLEY-SPECIFIC DISTRIBUTION ===
      if (config.type === 'valley') {
        const half = size / 2;
        const nx = x / half;
        const nz = z / half;
        
        // Town exclusion zone centered around hotspot (-6.0, -3.0) => nx = -0.4, nz = -0.2
        const distCenter = Math.sqrt(Math.pow(nx - (-6.0/15), 2) + Math.pow(nz - (-3.0/15), 2));
        
        // Town exclusion zone: no trees in the center where the city is
        if (distCenter < 0.22) continue;
        
        // Sparse trees zone around town (low probability)
        if (distCenter < 0.4 && Math.random() > 0.25) continue;
        
        // River exclusion (narrow strip along the river path)
        const riverCenterNx = Math.sin(nz * 2.5) * 0.12 + nz * 0.15;
        const distRiver = Math.abs(nx - riverCenterNx);
        if (distRiver < 0.11) continue; // Don't place trees in the river or exact banks
        
        // Dense trees on hillsides (higher probability at edges)
        if (distCenter > 0.6) {
          // Edge areas: always place trees (dense)
        } else if (distCenter > 0.4) {
          // Transition zone: moderate density
          if (Math.random() > 0.6) continue;
        }
      } else {
        // Non-valley zones: original altitude-based probability
        const altitudeProbability = 1.0 - Math.pow(Math.max(0, (y - 3.0)) / 10.0, 1.5);
        if (Math.random() > altitudeProbability * 0.8) continue;
      }

      // Near water: different tree types
      const nearWater = y < waterLevel + 1.5;
      
      const baseScale = config.type === 'mountain' ? 0.5 : (config.type === 'valley' ? 0.35 : 0.4);
      const scale = baseScale + Math.random() * 0.5;
      
      tempObject.position.set(x, y, z);
      tempObject.rotation.set(
        (Math.random() - 0.5) * 0.08,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.08
      );
      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();

      const n = Math.random();
      
      if (nearWater) {
        if (n < 0.4) bushes.push(tempObject.matrix.clone());
        else if (n < 0.7) leafyTrees.push(tempObject.matrix.clone());
        else roundTrees.push(tempObject.matrix.clone());
      } else if (y > 5.0) {
        if (n < 0.6) pines.push(tempObject.matrix.clone());
        else if (n < 0.85) bushes.push(tempObject.matrix.clone());
        else roundTrees.push(tempObject.matrix.clone());
      } else {
        if (n < 0.30) pines.push(tempObject.matrix.clone());
        else if (n < 0.55) roundTrees.push(tempObject.matrix.clone());
        else if (n < 0.75) leafyTrees.push(tempObject.matrix.clone());
        else bushes.push(tempObject.matrix.clone());
      }
    }

    return { pines, roundTrees, leafyTrees, bushes };
  }, [config, count, size]);

  // Set instance matrices
  useLayoutEffect(() => {
    const setMatrices = (ref, matrices) => {
      if (ref.current && matrices.length > 0) {
        matrices.forEach((matrix, i) => ref.current.setMatrixAt(i, matrix));
        ref.current.instanceMatrix.needsUpdate = true;
      }
    };
    
    setMatrices(pineTopRef, floraData.pines);
    setMatrices(pineBotRef, floraData.pines);
    setMatrices(pineTrunkRef, floraData.pines);
    setMatrices(roundTreeRef, floraData.roundTrees);
    setMatrices(roundTrunkRef, floraData.roundTrees);
    setMatrices(leafyTopRef, floraData.leafyTrees);
    setMatrices(leafyBotRef, floraData.leafyTrees);
    setMatrices(leafyTrunkRef, floraData.leafyTrees);
    setMatrices(bushRef, floraData.bushes);
  }, [floraData]);

  const darkGreen = config.type === 'mountain' ? '#1a5c2e' : '#15803d';
  const lightGreen = config.type === 'valley' ? '#4ade80' : '#22c55e';
  const midGreen = '#2d8a40';

  return (
    <group>
      {/* === PINE TREES === */}
      {floraData.pines.length > 0 && (
        <>
          <instancedMesh ref={pineTopRef} args={[null, null, floraData.pines.length]} castShadow position={[0, 1.6, 0]}>
            <coneGeometry args={[0.28, 0.9, 5]} />
            <meshStandardMaterial color={lightGreen} flatShading />
          </instancedMesh>
          <instancedMesh ref={pineBotRef} args={[null, null, floraData.pines.length]} castShadow position={[0, 0.85, 0]}>
            <coneGeometry args={[0.45, 1.1, 5]} />
            <meshStandardMaterial color={darkGreen} flatShading />
          </instancedMesh>
          <instancedMesh ref={pineTrunkRef} args={[null, null, floraData.pines.length]} castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 0.4, 4]} />
            <meshStandardMaterial color="#7c5230" flatShading />
          </instancedMesh>
        </>
      )}

      {/* === ROUND TREES === */}
      {floraData.roundTrees.length > 0 && (
        <>
          <instancedMesh ref={roundTreeRef} args={[null, null, floraData.roundTrees.length]} castShadow position={[0, 1.0, 0]}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial color={midGreen} flatShading />
          </instancedMesh>
          <instancedMesh ref={roundTrunkRef} args={[null, null, floraData.roundTrees.length]} castShadow position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 0.55, 5]} />
            <meshStandardMaterial color="#8B6914" flatShading />
          </instancedMesh>
        </>
      )}

      {/* === LEAFY TREES === */}
      {floraData.leafyTrees.length > 0 && (
        <>
          <instancedMesh ref={leafyTopRef} args={[null, null, floraData.leafyTrees.length]} castShadow position={[0, 1.3, 0]}>
            <coneGeometry args={[0.55, 0.6, 6]} />
            <meshStandardMaterial color={lightGreen} flatShading />
          </instancedMesh>
          <instancedMesh ref={leafyBotRef} args={[null, null, floraData.leafyTrees.length]} castShadow position={[0, 0.8, 0]}>
            <coneGeometry args={[0.7, 0.8, 6]} />
            <meshStandardMaterial color={darkGreen} flatShading />
          </instancedMesh>
          <instancedMesh ref={leafyTrunkRef} args={[null, null, floraData.leafyTrees.length]} castShadow position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.45, 4]} />
            <meshStandardMaterial color="#6b4226" flatShading />
          </instancedMesh>
        </>
      )}

      {/* === BUSHES === */}
      {floraData.bushes.length > 0 && (
        <instancedMesh ref={bushRef} args={[null, null, floraData.bushes.length]} castShadow position={[0, 0.2, 0]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#4ade80" flatShading />
        </instancedMesh>
      )}
    </group>
  );
}
