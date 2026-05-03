import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Platform() {
  const mapMeshRef = useRef();

  // Load the Guárico map texture
  const mapTexture = useTexture('/guarico-map-new.png');

  // Configure texture
  useMemo(() => {
    if (mapTexture) {
      mapTexture.colorSpace = THREE.SRGBColorSpace;
      mapTexture.minFilter = THREE.LinearFilter;
      mapTexture.magFilter = THREE.LinearFilter;
    }
  }, [mapTexture]);

  // Map overlay shader - blends map with glowing edges and highlights Roscio
  const mapMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mapTex: { value: mapTexture },
        glowColor: { value: new THREE.Color('#6d28d9') }, // Purple accent
        accentColor: { value: new THREE.Color('#22c55e') }, // Green accent
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D mapTex;
        uniform vec3 glowColor;
        uniform vec3 accentColor;
        varying vec2 vUv;
        varying vec3 vPos;
        
        void main() {
          vec4 texColor = texture2D(mapTex, vUv);
          
          // Only apply map if it's not completely transparent or white background
          float isWhite = smoothstep(0.85, 1.0, (texColor.r + texColor.g + texColor.b) / 3.0);
          float alpha = texColor.a * (1.0 - isWhite);
          
          // Define Roscio Area (Expanded for better visibility)
          float roscioX = smoothstep(0.10, 0.28, vUv.x) * (1.0 - smoothstep(0.28, 0.42, vUv.x));
          float roscioY = smoothstep(0.70, 0.85, vUv.y) * (1.0 - smoothstep(0.85, 0.98, vUv.y));
          float roscioFactor = roscioX * roscioY;
          
          // Darken the base map for more contrast
          vec3 baseColor = mix(texColor.rgb, glowColor * 0.5, 0.1) * 0.8;
          
          // High intensity pulse
          float pulse = sin(time * 2.0) * 0.15 + 0.85;
          
          // Stronger Highlight
          vec3 highlightColor = mix(baseColor, glowColor * 2.5, roscioFactor * pulse);
          
          // Add a stronger bloom effect for Roscio
          float bloom = pow(roscioFactor, 0.8) * (sin(time * 3.0) * 0.3 + 1.2);
          highlightColor += glowColor * bloom * 0.8;
          
          // Add inner glow
          float innerGlow = smoothstep(0.0, 0.5, roscioFactor) * (1.0 - roscioFactor);
          highlightColor += vec3(1.0) * innerGlow * 0.3;
          
          // Gentle pulse on the whole map
          highlightColor *= (sin(time * 0.5) * 0.05 + 0.95);
          
          // Scanline effect
          float scanline = sin(vPos.z * 15.0 + time * 1.2) * 0.02 + 0.98;
          highlightColor *= scanline;
          
          // Edge glow
          vec3 edgeGlow = glowColor * 0.15 * alpha;
          vec3 finalColor = highlightColor + edgeGlow;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [mapTexture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mapMeshRef.current) {
      // Gentle floating
      mapMeshRef.current.position.y = Math.sin(t * 0.4) * 0.05 - 1.5;
    }
    mapMaterial.uniforms.time.value = t;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Guárico Map */}
      <mesh ref={mapMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[16, 13.5, 1, 1]} />
        <primitive object={mapMaterial} attach="material" />
      </mesh>
    </group>
  );
}
