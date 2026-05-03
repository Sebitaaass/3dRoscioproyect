import { createNoise2D } from 'simplex-noise';

// Single shared noise instance for consistent terrain across all components
const noise2D = createNoise2D();

/**
 * Get terrain height at any (x, z) coordinate.
 * This function MUST be used by both ProceduralTerrain and Flora
 * to guarantee trees sit exactly on the terrain surface.
 */
export function getTerrainHeight(type, x, z, size = 30) {
  switch (type) {
    case 'karst': {
      const base = noise2D(x * 0.03, z * 0.03) * 1.5;
      const gentleHills = noise2D(x * 0.06, z * 0.06) * 0.8;

      const d1 = Math.sqrt(Math.pow(x - (-2.5), 2) + Math.pow(z - 1.5, 2));
      const p1 = Math.pow(Math.max(0, 1 - d1 / 4.0), 0.55) * 12;

      const d2 = Math.sqrt(Math.pow(x - 2.5, 2) + Math.pow(z - 1.0, 2));
      const p2 = Math.pow(Math.max(0, 1 - d2 / 3.5), 0.55) * 10;

      const d3 = Math.sqrt(Math.pow(x - (-0.5), 2) + Math.pow(z - (-3.0), 2));
      const p3 = Math.pow(Math.max(0, 1 - d3 / 4.5), 0.6) * 8.5;

      let morros = Math.max(p1, p2, p3);

      if (morros > 0.5) {
        const angle = Math.atan2(z, x);
        const ridges = Math.sin(angle * 15) * 0.2;
        const rockNoise = noise2D(x * 0.3, z * 0.3) * 0.4;
        const slopeMask = Math.sin(Math.min(1, morros / 10.0) * Math.PI);
        morros += (ridges + rockNoise) * slopeMask * 0.6;
      }

      const foothill1 = Math.pow(Math.max(0, 1 - d1 / 8.0), 2.0) * 2.0;
      const foothill2 = Math.pow(Math.max(0, 1 - d2 / 7.0), 2.0) * 1.5;
      const foothill3 = Math.pow(Math.max(0, 1 - d3 / 9.0), 2.0) * 1.5;
      const foothills = Math.max(foothill1, foothill2, foothill3);

      return base + gentleHills + morros + foothills;
    }
    case 'valley': {
      const half = size / 2;
      const nx = x / half;
      const nz = z / half;

      // === FLAT BASE with very gentle rolling hills ===
      // === FLAT BASE with very gentle rolling hills ===
      const base = 1.0;
      let noiseSum = noise2D(x * 0.04, z * 0.04) * 0.6 
                   + noise2D(x * 0.08, z * 0.08) * 0.3 
                   + noise2D(x * 0.15, z * 0.15) * 0.1;
      
      // Prevent deep holes in the terrain so we can raise the water level safely
      noiseSum = Math.max(-0.2, noiseSum);

      // === VERY SUBTLE HILLS at the edges (just gentle bumps, not walls) ===
      // === NARROW RIVER (gentle depression through center) ===
      const riverCenterX = Math.sin(nz * 2.5) * 0.12 + nz * 0.15;
      const distToRiver = Math.abs(nx - riverCenterX);

      const edgeDist = Math.max(Math.abs(nx), Math.abs(nz));
      let edgeBump = 0;
      if (edgeDist > 0.6) {
        edgeBump = Math.pow((edgeDist - 0.6) / 0.4, 1.5) * 1.5;
        // Suppress edge bump near the river so it flows off the map
        const edgeFade = Math.min(1.0, distToRiver / 0.35);
        edgeBump *= edgeFade;
      }

      // === MORE DEFINED RIVER (deeper depression through center) ===
      const riverWidth = 0.1; // Wider river bed
      const riverBankWidth = 0.22; // Wider banks
      let riverCarve = 0;
      
      if (distToRiver < riverWidth) {
        riverCarve = -0.9 * (1.0 - Math.pow(distToRiver / riverWidth, 2.0)); // Deeper carve
      } else if (distToRiver < riverBankWidth) {
        const bankT = (distToRiver - riverWidth) / (riverBankWidth - riverWidth);
        riverCarve = -0.9 * (1.0 - bankT) * 0.3;
      }

      // === FLAT TOWN AREA (suppress noise around hotspot Capital del Estado moved inland: x=-6.0, z=-3.0) ===
      const townDist = Math.sqrt(Math.pow(nx - (-6.0/15), 2) + Math.pow(nz - (-3.0/15), 2));
      let flatten = 1.0;
      if (townDist < 0.3) {
        flatten = 0.2 + 0.8 * (townDist / 0.3);
      }

      return base + noiseSum * flatten + edgeBump + riverCarve;
    }
    case 'mountain': {
      const height = size;
      const normalizedZ = (z + height / 2) / height;

      const plains = noise2D(x * 0.03, z * 0.03) * 1.2;
      const hills = noise2D(x * 0.07, z * 0.07) * 0.6;
      const detail = noise2D(x * 0.15, z * 0.15) * 0.2;

      const mountainDist = Math.sqrt(Math.pow(x - 4.0, 2) + Math.pow(z - 6.0, 2));
      let mountainMass = Math.max(0, 10.0 - mountainDist) * 1.5;

      const peak2Dist = Math.sqrt(Math.pow(x - (-3.0), 2) + Math.pow(z - 4.0, 2));
      let peak2 = Math.max(0, 7.0 - peak2Dist) * 0.8;

      const ridge = (1.0 - Math.abs(noise2D(x * 0.08, z * 0.08))) * 3.5;
      mountainMass += ridge * Math.min(1.0, mountainMass / 5.0);
      peak2 += ridge * Math.min(1.0, peak2 / 4.0) * 0.5;

      const collinaDist1 = Math.sqrt(Math.pow(x - 1.0, 2) + Math.pow(z - 2.0, 2));
      const collina1 = Math.pow(Math.max(0, 1 - collinaDist1 / 6.0), 2.0) * 3.0;

      const collinaDist2 = Math.sqrt(Math.pow(x - (-5.0), 2) + Math.pow(z - 1.0, 2));
      const collina2 = Math.pow(Math.max(0, 1 - collinaDist2 / 5.0), 2.0) * 2.0;

      const transition = Math.pow(normalizedZ, 1.5);

      const lakeDist = Math.sqrt(Math.pow(x - (-2.0), 2) + Math.pow(z - (-5.0), 2));
      const lake = lakeDist < 3.0 ? -(Math.pow(1.0 - lakeDist / 3.0, 2.0)) * 1.2 : 0;

      return plains + hills + detail + ((mountainMass + peak2) * transition) + collina1 + collina2 + lake;
    }
    default:
      return noise2D(x * 0.05, z * 0.05) * 2;
  }
}

/**
 * Get terrain slope at a point (for flora distribution)
 */
export function getTerrainSlope(type, x, z, size = 30) {
  const eps = 0.5;
  const hC = getTerrainHeight(type, x, z, size);
  const hX = getTerrainHeight(type, x + eps, z, size);
  const hZ = getTerrainHeight(type, x, z + eps, size);
  const dx = (hX - hC) / eps;
  const dz = (hZ - hC) / eps;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Generate full heightmap grid for ProceduralTerrain geometry
 */
export function generateHeightMap(type, width, height, segments) {
  const data = [];
  for (let j = 0; j <= segments; j++) {
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * width;
      const z = (j / segments - 0.5) * height;
      data.push(getTerrainHeight(type, x, z, width));
    }
  }
  return data;
}
