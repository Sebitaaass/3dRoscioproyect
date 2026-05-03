import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { getTerrainHeight } from './terrainUtils';

/**
 * Detailed Low Poly Town for Valle de San Juan
 * Organized blocks, clear streets, church, market, farms
 */
export default function LowPolyTown({ config, size = 30 }) {
  const housesRef = useRef();
  const roofsRef = useRef();
  const largeRef = useRef();
  const largeRoofRef = useRef();
  const churchRef = useRef();
  const churchRoofRef = useRef();
  const towerRef = useRef();
  const towerRoofRef = useRef();
  const farmRef = useRef();

  const townData = useMemo(() => {
    if (config.type !== 'valley') return null;

    const houses = [];
    const roofs = [];
    const large = [];
    const largeRoofs = [];
    const church = [];
    const churchRoofs = [];
    const tower = [];
    const towerRoofs = [];
    const farms = [];
    const roads = [];

    const tempObj = new THREE.Object3D();
    const getY = (x, z) => getTerrainHeight('valley', x, z, size);

    // Offset to move the entire town further into the plains
    const ox = -6.0;
    const oz = -3.0;

    // === ORGANIZED HOUSE BLOCKS ===
    const block1 = [
      [-1.8, -1.0], [-1.3, -1.0], [-0.8, -1.0], [-0.3, -1.0],
      [-1.8, -1.6], [-1.3, -1.6], [-0.8, -1.6], [-0.3, -1.6],
      [-1.8, -2.2], [-1.3, -2.2], [-0.8, -2.2], [-0.3, -2.2],
    ];
    const block2 = [
      [0.5, -0.8], [1.0, -0.8], [1.5, -0.8],
      [0.5, -1.4], [1.0, -1.4], [1.5, -1.4],
      [0.5, -2.0], [1.0, -2.0], [1.5, -2.0],
    ];
    const block3 = [
      [-1.5, 0.8], [-1.0, 0.8], [-0.5, 0.8],
      [-1.5, 1.4], [-1.0, 1.4], [-0.5, 1.4],
      [0.3, 0.9], [0.8, 0.9], [1.3, 0.9],
      [0.3, 1.5], [0.8, 1.5], [1.3, 1.5],
    ];
    const scattered = [
      [-2.8, -0.5], [-2.8, -1.5], [2.3, -0.4], [2.3, -1.2],
      [-2.5, 1.0], [2.0, 1.2], [0.0, 2.2], [-0.8, 2.5],
    ];

    const allHouses = [...block1, ...block2, ...block3, ...scattered];

    allHouses.forEach(([hx, hz]) => {
      const rx = hx + ox;
      const rz = hz + oz;
      const y = getY(rx, rz);
      const w = 0.22 + Math.random() * 0.12;
      const h = 0.18 + Math.random() * 0.08;
      const d = 0.2 + Math.random() * 0.12;
      const rot = Math.floor(Math.random() * 4) * (Math.PI / 2) + (Math.random() - 0.5) * 0.15;

      tempObj.position.set(rx, y + h * 0.5, rz);
      tempObj.rotation.set(0, rot, 0);
      tempObj.scale.set(w, h, d);
      tempObj.updateMatrix();
      houses.push(tempObj.matrix.clone());

      tempObj.position.set(rx, y + h + 0.06, rz);
      tempObj.scale.set(w * 1.2, h * 0.6, d * 1.2);
      tempObj.updateMatrix();
      roofs.push(tempObj.matrix.clone());
    });

    // === LARGER BUILDINGS ===
    const largeBuildings = [
      [0.0, -0.3, 0.4, 0.28, 0.35, 0],
      [-0.6, 0.1, 0.35, 0.25, 0.3, 0.2],
      [0.8, 0.2, 0.3, 0.22, 0.35, -0.1],
      [-1.2, -0.3, 0.3, 0.2, 0.3, 0.5],
    ];

    largeBuildings.forEach(([bx, bz, sw, sh, sd, rot]) => {
      const rx = bx + ox;
      const rz = bz + oz;
      const y = getY(rx, rz);
      tempObj.position.set(rx, y + sh * 0.5, rz);
      tempObj.rotation.set(0, rot, 0);
      tempObj.scale.set(sw, sh, sd);
      tempObj.updateMatrix();
      large.push(tempObj.matrix.clone());

      tempObj.position.set(rx, y + sh + 0.05, rz);
      tempObj.scale.set(sw * 1.15, sh * 0.5, sd * 1.15);
      tempObj.updateMatrix();
      largeRoofs.push(tempObj.matrix.clone());
    });

    // === CHURCH ===
    const cx = 0.1 + ox, cz = 0.15 + oz;
    const cy = getY(cx, cz);

    tempObj.position.set(cx, cy + 0.2, cz);
    tempObj.rotation.set(0, 0.1, 0);
    tempObj.scale.set(0.5, 0.3, 0.35);
    tempObj.updateMatrix();
    church.push(tempObj.matrix.clone());

    tempObj.position.set(cx, cy + 0.38, cz);
    tempObj.scale.set(0.55, 0.18, 0.4);
    tempObj.updateMatrix();
    churchRoofs.push(tempObj.matrix.clone());

    tempObj.position.set(cx - 0.15, cy + 0.3, cz);
    tempObj.rotation.set(0, 0, 0);
    tempObj.scale.set(0.1, 0.45, 0.1);
    tempObj.updateMatrix();
    tower.push(tempObj.matrix.clone());

    tempObj.position.set(cx - 0.15, cy + 0.6, cz);
    tempObj.scale.set(0.08, 0.15, 0.08);
    tempObj.updateMatrix();
    towerRoofs.push(tempObj.matrix.clone());

    // === FARMS ===
    const farmFields = [
      [-3.2, -2.0, 1.4, 1.0, '#c8a84e'],
      [2.8, -2.2, 1.2, 0.9, '#b8c840'],
      [-3.0, 1.8, 1.0, 1.2, '#d4a843'],
      [3.0, 1.5, 1.1, 0.8, '#a8c048'],
      [-2.0, 2.8, 0.9, 0.7, '#c8a84e'],
      [1.8, -3.0, 0.8, 1.0, '#b8c840'],
      [-0.5, -3.2, 1.3, 0.6, '#d4a843'],
      [0.8, 2.8, 1.0, 0.8, '#a8c048'],
    ];

    const translatedFarms = farmFields.map(([fx, fz, fw, fd, color]) => {
      return [fx + ox, fz + oz, fw, fd, color];
    });

    // === ROADS ===
    const roadDefs = [
      { pos: [0, 0.01, -1.0], rot: 0, w: 6.0, d: 0.2 },
      { pos: [0, 0.01, 0], rot: Math.PI / 2, w: 5.0, d: 0.18 },
      { pos: [-1.05, 0.01, -1.3], rot: Math.PI / 2, w: 2.5, d: 0.12 },
      { pos: [1.0, 0.01, -1.3], rot: Math.PI / 2, w: 2.5, d: 0.12 },
      { pos: [-1.3, 0.01, 1.1], rot: 0, w: 2.0, d: 0.12 },
      { pos: [0.8, 0.01, 1.2], rot: 0, w: 2.0, d: 0.12 },
      { pos: [-2.5, 0.01, -1.5], rot: 0.4, w: 2.0, d: 0.1 },
      { pos: [2.2, 0.01, -1.0], rot: -0.3, w: 2.0, d: 0.1 },
    ];

    roadDefs.forEach(r => {
      const rx = r.pos[0] + ox;
      const rz = r.pos[2] + oz;
      roads.push({ pos: [rx, r.pos[1], rz], rot: r.rot, w: r.w, d: r.d });
    });

    return { houses, roofs, large, largeRoofs, church, churchRoofs, tower, towerRoofs, farms: translatedFarms, roads };
  }, [config, size]);

  useLayoutEffect(() => {
    if (!townData) return;
    const setM = (ref, arr) => {
      if (ref.current && arr.length > 0) {
        arr.forEach((m, i) => ref.current.setMatrixAt(i, m));
        ref.current.instanceMatrix.needsUpdate = true;
      }
    };
    setM(housesRef, townData.houses);
    setM(roofsRef, townData.roofs);
    setM(largeRef, townData.large);
    setM(largeRoofRef, townData.largeRoofs);
    setM(churchRef, townData.church);
    setM(churchRoofRef, townData.churchRoofs);
    setM(towerRef, townData.tower);
    setM(towerRoofRef, townData.towerRoofs);
  }, [townData]);

  if (!townData) return null;

  const getY = (x, z) => getTerrainHeight('valley', x, z, size);

  return (
    <group>
      {/* House walls */}
      <instancedMesh ref={housesRef} args={[null, null, townData.houses.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e8dcc8" flatShading />
      </instancedMesh>

      {/* House roofs (terracotta pyramid) */}
      <instancedMesh ref={roofsRef} args={[null, null, townData.roofs.length]} castShadow>
        <coneGeometry args={[0.72, 1, 4]} />
        <meshStandardMaterial color="#b85c38" flatShading />
      </instancedMesh>

      {/* Larger buildings */}
      <instancedMesh ref={largeRef} args={[null, null, townData.large.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f0e6d2" flatShading />
      </instancedMesh>

      {/* Large building roofs */}
      <instancedMesh ref={largeRoofRef} args={[null, null, townData.largeRoofs.length]} castShadow>
        <coneGeometry args={[0.72, 1, 4]} />
        <meshStandardMaterial color="#a0522d" flatShading />
      </instancedMesh>

      {/* Church body */}
      <instancedMesh ref={churchRef} args={[null, null, townData.church.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f5f0e0" flatShading />
      </instancedMesh>

      {/* Church roof */}
      <instancedMesh ref={churchRoofRef} args={[null, null, townData.churchRoofs.length]} castShadow>
        <coneGeometry args={[0.72, 1, 4]} />
        <meshStandardMaterial color="#8b4513" flatShading />
      </instancedMesh>

      {/* Bell tower */}
      <instancedMesh ref={towerRef} args={[null, null, townData.tower.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f5f0e0" flatShading />
      </instancedMesh>

      {/* Tower roof (pointed) */}
      <instancedMesh ref={towerRoofRef} args={[null, null, townData.towerRoofs.length]} castShadow>
        <coneGeometry args={[0.72, 1, 4]} />
        <meshStandardMaterial color="#6b3a1a" flatShading />
      </instancedMesh>

      {/* Farm fields */}
      {townData.farms.map(([fx, fz, fw, fd, color], i) => {
        const y = getY(fx, fz);
        return (
          <mesh key={`farm-${i}`} position={[fx, y + 0.02, fz]} rotation={[-Math.PI / 2, 0, (i * 0.3) % 0.6]}>
            <planeGeometry args={[fw, fd]} />
            <meshStandardMaterial color={color} flatShading side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Roads */}
      {townData.roads.map((road, i) => {
        const y = getY(road.pos[0], road.pos[2]);
        return (
          <mesh key={`road-${i}`} position={[road.pos[0], y + road.pos[1], road.pos[2]]} rotation={[-Math.PI / 2, 0, road.rot]}>
            <planeGeometry args={[road.w, road.d]} />
            <meshStandardMaterial color="#8a7a60" flatShading side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}
