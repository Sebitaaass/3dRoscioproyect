import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function FloatingSphere({ position, color, glowColor, name, subtitle, texture, onClick, index = 0 }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();
  const ringRef = useRef();
  const hovered = useRef(false);
  const targetScale = useRef(1);

  // Load texture if available, otherwise use a placeholder or null
  const zoneTexture = texture ? useTexture(texture) : null;

  const baseY = position[1];

  const glassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uGlowColor: { value: new THREE.Color(glowColor) },
        uTexture: { value: zoneTexture },
        uHasTexture: { value: !!zoneTexture },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uFresnelPower: { value: 2.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vViewDir = normalize(cameraPosition - worldPosition.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform sampler2D uTexture;
        uniform bool uHasTexture;
        uniform float uTime;
        uniform float uHover;
        uniform float uFresnelPower;

        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          // Fresnel effect for glass look
          float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), uFresnelPower);
          
          // Base glass appearance
          vec3 glassColor = mix(uColor * 0.2, uGlowColor, fresnel);
          float alpha = 0.4 + fresnel * 0.6;

          vec3 finalColor = glassColor;

          if (uHasTexture) {
            // Subtle spherical texture distortion for realism without losing clarity
            vec2 distortedUv = vUv;
            
            // Adjust texture scale (Zoom) - centering on 0.5, 0.5
            float texScale = 1.1; 
            distortedUv = (distortedUv - 0.5) * texScale + 0.5;
            
            distortedUv += vNormal.xy * 0.04 * (1.0 - fresnel);
            
            vec4 texColor = texture2D(uTexture, distortedUv);
            
            // Prioritize texture visibility (90% texture, 10% glass tint in center)
            finalColor = mix(texColor.rgb, glassColor, fresnel * 0.4);
            
            // Add extra brightness to the texture
            finalColor *= 1.1; 

            // Higher alpha for better visibility
            alpha = mix(0.95, 1.0, fresnel);
          }

          // Top highlight (ambient light)
          float highlight = pow(max(0.0, vNormal.y), 4.0) * 0.3;
          finalColor += vec3(highlight);

          // Subtle pulse based on time
          float pulse = sin(uTime * 1.5) * 0.03 + 1.0;
          finalColor *= pulse;

          // Hover glow boost
          finalColor += uGlowColor * uHover * fresnel * 0.6;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
    });
  }, [color, glowColor, zoneTexture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Premium levitation (no rotation for the main group to keep texture static)
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(t * 1.0 + index) * 0.25;
    }

    // Smooth scaling on hover
    const target = hovered.current ? 1.3 : 1.0;
    targetScale.current += (target - targetScale.current) * 0.1;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(targetScale.current);
    }

    // Update shader uniforms
    glassMaterial.uniforms.uTime.value = t;
    glassMaterial.uniforms.uHover.value = THREE.MathUtils.lerp(
      glassMaterial.uniforms.uHover.value,
      hovered.current ? 1.0 : 0.0,
      0.1
    );

    // Rotate ring independently (decorative)
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
    }
  });

  const shadowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.4 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float dist = distance(vUv, vec2(0.5));
          // Soft radial falloff for the shadow (calado)
          float alpha = smoothstep(0.5, 0.0, dist) * uOpacity;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow plane below with soft radial falloff */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.8]} />
        <primitive object={shadowMaterial} attach="material" />
      </mesh>

      {/* Halo Border Effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]} ref={ringRef}>
        <ringGeometry args={[0.65, 0.7, 64]} />
        <meshBasicMaterial 
          color={glowColor} 
          transparent 
          opacity={hovered.current ? 0.6 : 0.3} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Main glass sphere */}
      <mesh
        ref={meshRef}
        rotation={[0, Math.PI, 0]} // Rotate to face the camera/front by default
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          hovered.current = true; 
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          hovered.current = false; 
          document.body.style.cursor = 'default'; 
        }}
      >
        <sphereGeometry args={[0.5, 64, 64]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Outer subtle glow */}
      <mesh scale={1.2}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshBasicMaterial 
          color={glowColor} 
          transparent 
          opacity={hovered.current ? 0.1 : 0.05} 
          side={THREE.BackSide} 
        />
      </mesh>

      {/* Premium HTML Label */}
      <Html position={[0, -1.2, 0]} center distanceFactor={15}>
        <div className={`sphere-label ${hovered.current ? 'hovered' : ''}`} style={{ borderColor: color }}>
          <div className="sphere-label-badge" style={{ backgroundColor: color, color: color }}></div>
          <div className="sphere-label-content">
            <div className="sphere-label-name">{name}</div>
            <div className="sphere-label-sub">{subtitle}</div>
            {hovered.current && (
              <div className="sphere-tooltip-hint">Explorar Zona →</div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

