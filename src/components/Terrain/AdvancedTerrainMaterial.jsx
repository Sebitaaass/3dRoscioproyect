import { useMemo } from 'react';
import * as THREE from 'three';

// Low Poly Terrain Shader — Natural color transitions
// Height → color bands, Slope → darkening, Moisture → greener near water
export function useAdvancedTerrainMaterial({ 
  minHeight, 
  maxHeight, 
  viewMode,
  terrainConfig 
}) {
  return useMemo(() => {
    // Zone-specific color palettes with 6 bands for smooth natural transitions
    let colors = {};
    const moistureBase = terrainConfig.type === 'valley' ? 0.85 : (terrainConfig.type === 'mountain' ? 0.65 : 0.35);

    switch (terrainConfig.type) {
      case 'karst':
        // Los Morros: water edge → lush meadow → forest → exposed rock → grey peak
        colors = {
          water:   new THREE.Color('#3a8c5c'), // Dark green near water
          low:     new THREE.Color('#4a9e4e'), // Lush green meadow
          mid:     new THREE.Color('#5b8c3e'), // Forest green
          high:    new THREE.Color('#8B7355'), // Brown rock
          peak:    new THREE.Color('#a09080'), // Light grey-brown peak
          snow:    new THREE.Color('#b8b0a0'), // Lightest stone
        };
        break;
      case 'valley':
        // Valle: riverbank green → meadow → agricultural → dry farmland → hillside
        colors = {
          water:   new THREE.Color('#3d9e5a'), // Rich green riverbank
          low:     new THREE.Color('#5cb338'), // Bright green meadow
          mid:     new THREE.Color('#7cb342'), // Light agricultural green
          high:    new THREE.Color('#c8a94e'), // Ochre farmland
          peak:    new THREE.Color('#a08530'), // Dry ochre
          snow:    new THREE.Color('#8a7a50'), // Dark dry
        };
        break;
      case 'mountain':
        // Piedemonte: valley floor → dense forest → mountain forest → exposed slope → rocky peak
        colors = {
          water:   new THREE.Color('#4ade80'), // Light green valley floor
          low:     new THREE.Color('#2d8a40'), // Dense forest green
          mid:     new THREE.Color('#1a5c2e'), // Dark mountain forest
          high:    new THREE.Color('#6b5a3a'), // Brown exposed slope
          peak:    new THREE.Color('#8a8a8a'), // Grey rocky peak
          snow:    new THREE.Color('#a0a0a0'), // Light grey
        };
        break;
      default:
        colors = {
          water: new THREE.Color('#5cb338'),
          low:   new THREE.Color('#7cb342'),
          mid:   new THREE.Color('#8B7355'),
          high:  new THREE.Color('#a0a0a0'),
          peak:  new THREE.Color('#b0b0b0'),
          snow:  new THREE.Color('#c0c0c0'),
        };
    }

    return new THREE.ShaderMaterial({
      uniforms: {
        minHeight: { value: minHeight },
        maxHeight: { value: maxHeight },
        viewMode: { value: viewMode === 'topographic' ? 1.0 : 0.0 },
        time: { value: 0 },
        
        // 6-band color palette for smooth natural transitions
        uColorWater: { value: colors.water },
        uColorLow:   { value: colors.low },
        uColorMid:   { value: colors.mid },
        uColorHigh:  { value: colors.high },
        uColorPeak:  { value: colors.peak },
        uColorSnow:  { value: colors.snow },
        uMoistureBase: { value: moistureBase },

        // Sun direction
        lightDir: { value: new THREE.Vector3(0.5, 1.0, 0.3).normalize() },
        
        // Topographic mode colors
        topoLow:  { value: new THREE.Color('#22c55e') },
        topoMid:  { value: new THREE.Color('#eab308') },
        topoHigh: { value: new THREE.Color('#92400e') },
        topoSnow: { value: new THREE.Color('#e2e8f0') },
      },
      vertexShader: `
        varying float vHeight;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        
        void main() {
          vHeight = position.y;
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float minHeight;
        uniform float maxHeight;
        uniform float viewMode;
        uniform float time;
        uniform vec3 lightDir;
        uniform float uMoistureBase;
        
        uniform vec3 uColorWater;
        uniform vec3 uColorLow;
        uniform vec3 uColorMid;
        uniform vec3 uColorHigh;
        uniform vec3 uColorPeak;
        uniform vec3 uColorSnow;
        
        uniform vec3 topoLow;
        uniform vec3 topoMid;
        uniform vec3 topoHigh;
        uniform vec3 topoSnow;
        
        varying float vHeight;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        
        void main() {
          // Normalize height 0.0 to 1.0
          float h = clamp((vHeight - minHeight) / (maxHeight - minHeight), 0.0, 1.0);
          
          // --- SLOPE (steepness) ---
          float slope = dot(vNormal, vec3(0.0, 1.0, 0.0));
          
          // --- SMOOTH 6-BAND COLOR TRANSITION ---
          // Natural gradient: water edge → meadow → forest → rock → peak → snow
          vec3 terrainColor;
          if (h < 0.12) {
            terrainColor = mix(uColorWater, uColorLow, h / 0.12);
          } else if (h < 0.30) {
            terrainColor = mix(uColorLow, uColorMid, (h - 0.12) / 0.18);
          } else if (h < 0.52) {
            terrainColor = mix(uColorMid, uColorHigh, (h - 0.30) / 0.22);
          } else if (h < 0.75) {
            terrainColor = mix(uColorHigh, uColorPeak, (h - 0.52) / 0.23);
          } else {
            terrainColor = mix(uColorPeak, uColorSnow, (h - 0.75) / 0.25);
          }
          
          // --- SLOPE SHADING ---
          // Steep faces become darker and more rocky
          float slopeDarken = smoothstep(0.85, 0.35, slope);
          vec3 rockTint = mix(terrainColor, uColorHigh * 0.6, slopeDarken * 0.6);
          terrainColor = mix(terrainColor, rockTint, slopeDarken);
          
          // --- MOISTURE (lower areas near water get greener) ---
          float moistureFactor = pow(1.0 - h, 2.0) * uMoistureBase;
          terrainColor = mix(terrainColor, terrainColor * vec3(0.75, 1.2, 0.8), moistureFactor * 0.35);
          
          // --- TOPOGRAPHIC MODE ---
          vec3 topoColor;
          if (h < 0.25) topoColor = mix(topoLow, topoMid, h / 0.25);
          else if (h < 0.6) topoColor = mix(topoMid, topoHigh, (h - 0.25) / 0.35);
          else topoColor = mix(topoHigh, topoSnow, (h - 0.6) / 0.4);
          
          vec3 finalColor = mix(terrainColor, topoColor, viewMode);
          
          // --- SIMPLE LAMBERT LIGHTING with warm/cool split ---
          float NdotL = max(dot(vNormal, lightDir), 0.0);
          
          // Warm direct light
          float diffuse = NdotL * 0.55;
          
          // Cool ambient (slightly blue in shadows for depth)
          float ambient = 0.35;
          vec3 ambientColor = mix(vec3(0.6, 0.65, 0.8), vec3(1.0), NdotL);
          
          // Combine lighting
          finalColor *= (ambient * ambientColor + diffuse);
          
          // Subtle warm top-face highlight (simulates sun)
          float topFace = pow(max(slope, 0.0), 4.0);
          finalColor += vec3(1.0, 0.95, 0.85) * topFace * 0.06;
          
          // --- ATMOSPHERIC DEPTH (distance fog tinting) ---
          // Disabled to maintain clear daylight colors
          // float dist = length(vWorldPos - cameraPosition);
          // float fogFactor = smoothstep(15.0, 50.0, dist);
          // vec3 fogColor = vec3(0.82, 0.9, 0.95); // Pastel sky
          // finalColor = mix(finalColor, fogColor, fogFactor * 0.4);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [minHeight, maxHeight, viewMode, terrainConfig]);
}
