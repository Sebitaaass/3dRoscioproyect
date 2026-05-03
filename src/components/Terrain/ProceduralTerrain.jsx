import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateHeightMap } from './terrainUtils';
import { useAdvancedTerrainMaterial } from './AdvancedTerrainMaterial';


export default function ProceduralTerrain({ config, viewMode = 'satellite' }) {
  const meshRef = useRef();
  
  const size = 30;
  // Balanced poly count: enough geometry for smooth undulations 
  // while maintaining visible faceted low poly style
  const segments = 72;
  const baseLevel = -4; // How far down the solid base extends

  const { geometry, skirtGeometry, bottomGeometry, maxHeight, minHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const heights = generateHeightMap(config.type, size, size, segments);
    const positions = geo.attributes.position.array;
    let maxH = -Infinity;
    let minH = Infinity;

    for (let i = 0; i < heights.length; i++) {
      const h = heights[i];
      positions[i * 3 + 1] = h;
      if (h > maxH) maxH = h;
      if (h < minH) minH = h;
    }

    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();

    // === BUILD SKIRT (side walls) ===
    // Collect edge vertices from the terrain grid
    const edgeVerts = []; // Each entry: { x, y (height), z }
    const stride = segments + 1;
    
    // Top edge (j = 0)
    for (let i = 0; i <= segments; i++) {
      const idx = i;
      edgeVerts.push({ x: positions[idx*3], y: positions[idx*3+1], z: positions[idx*3+2] });
    }
    // Right edge (i = segments)
    for (let j = 1; j <= segments; j++) {
      const idx = j * stride + segments;
      edgeVerts.push({ x: positions[idx*3], y: positions[idx*3+1], z: positions[idx*3+2] });
    }
    // Bottom edge (j = segments), reversed
    for (let i = segments - 1; i >= 0; i--) {
      const idx = segments * stride + i;
      edgeVerts.push({ x: positions[idx*3], y: positions[idx*3+1], z: positions[idx*3+2] });
    }
    // Left edge (i = 0), reversed
    for (let j = segments - 1; j >= 1; j--) {
      const idx = j * stride;
      edgeVerts.push({ x: positions[idx*3], y: positions[idx*3+1], z: positions[idx*3+2] });
    }

    // Build skirt triangles: for each edge segment, create a quad (2 triangles)
    const skirtPositions = [];
    for (let i = 0; i < edgeVerts.length; i++) {
      const curr = edgeVerts[i];
      const next = edgeVerts[(i + 1) % edgeVerts.length];

      // Quad: top-left, bottom-left, top-right, bottom-left, bottom-right, top-right
      // Top vertices are terrain edge, bottom vertices are at baseLevel
      skirtPositions.push(
        curr.x, curr.y, curr.z,
        curr.x, baseLevel, curr.z,
        next.x, next.y, next.z,

        curr.x, baseLevel, curr.z,
        next.x, baseLevel, next.z,
        next.x, next.y, next.z,
      );
    }

    const skirtGeo = new THREE.BufferGeometry();
    skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(skirtPositions, 3));
    skirtGeo.computeVertexNormals();

    // === BOTTOM PLANE ===
    const botGeo = new THREE.PlaneGeometry(size, size);
    botGeo.rotateX(Math.PI / 2); // Face downward
    botGeo.translate(0, baseLevel, 0);

    return { 
      geometry: geo, 
      skirtGeometry: skirtGeo, 
      bottomGeometry: botGeo,
      maxHeight: maxH, 
      minHeight: minH 
    };
  }, [config.type]);

  const terrainMaterial = useAdvancedTerrainMaterial({
    minHeight,
    maxHeight,
    viewMode,
    terrainConfig: config
  });

  // Update viewMode uniform on change
  useFrame((state) => {
    if (terrainMaterial.uniforms) {
      const target = viewMode === 'topographic' ? 1.0 : 0.0;
      terrainMaterial.uniforms.viewMode.value +=
        (target - terrainMaterial.uniforms.viewMode.value) * 0.05;
      
      terrainMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Terrain surface */}
      <mesh ref={meshRef} geometry={geometry} material={terrainMaterial} receiveShadow />
      
      {/* Side walls (skirt) */}
      <mesh geometry={skirtGeometry} receiveShadow>
        <meshStandardMaterial 
          color="#5a4a3a" 
          flatShading 
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bottom cap */}
      <mesh geometry={bottomGeometry}>
        <meshStandardMaterial 
          color="#3a2a1a" 
          flatShading
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
