import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function TourController({ isActive, hotspots, onTourEnd, onHotspotReached }) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const currentTargetIndex = useRef(0);
  const isPaused = useRef(false);
  const pauseTimer = useRef(0);
  
  // Store original camera position to return to it
  const initialCameraPos = useRef(new THREE.Vector3());
  const initialCameraRot = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (isActive) {
      // Save initial state when tour starts
      initialCameraPos.current.copy(camera.position);
      initialCameraRot.current.copy(camera.quaternion);
      
      progressRef.current = 0;
      currentTargetIndex.current = 0;
      isPaused.current = false;
      pauseTimer.current = 0;
    } else {
      // If cancelled or ended, we could restore position, but let's just let OrbitControls take over from where it is
    }
  }, [isActive, camera]);

  useFrame((state, delta) => {
    if (!isActive || !hotspots || hotspots.length === 0) return;

    if (isPaused.current) {
      pauseTimer.current -= delta;
      if (pauseTimer.current <= 0) {
        isPaused.current = false;
        currentTargetIndex.current++;
        
        if (currentTargetIndex.current >= hotspots.length) {
          // Tour ended
          if (onTourEnd) onTourEnd();
          return;
        }
      }
      return;
    }

    const currentHotspot = hotspots[currentTargetIndex.current];
    
    // Slightly closer panoramic view — still wide but a bit nearer
    const targetPos = new THREE.Vector3(
      currentHotspot.position[0],
      currentHotspot.position[1] + 8,
      currentHotspot.position[2] - 17
    );
    
    // We want to look at the hotspot
    const lookAtPos = new THREE.Vector3(...currentHotspot.position);

    // Calculate how far we are
    const dist = camera.position.distanceTo(targetPos);
    
    if (dist < 0.1) {
      // Reached hotspot
      isPaused.current = true;
      pauseTimer.current = 4.0; // Pause for 4 seconds to read
      if (onHotspotReached) onHotspotReached(currentHotspot);
    } else {
      // Move towards target smoothly
      camera.position.lerp(targetPos, delta * 1.5);
      
      // Smoothly rotate to look at hotspot
      const targetRotation = new THREE.Quaternion();
      const currentPos = camera.position.clone();
      const lookMatrix = new THREE.Matrix4().lookAt(currentPos, lookAtPos, new THREE.Vector3(0, 1, 0));
      targetRotation.setFromRotationMatrix(lookMatrix);
      
      camera.quaternion.slerp(targetRotation, delta * 2.5);
    }
  });

  return null;
}
