import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/+esm';
import { scene } from './scene.js';

const noise2D = createNoise2D();



// ---------- ОСТРОВ ----------
export const islandRadius = 20;
const islandSegments = 128;

const geometry = new THREE.PlaneGeometry(islandRadius * 2, islandRadius * 2, islandSegments, islandSegments);
geometry.rotateX(-Math.PI / 2);

// добавляем высоту с шумом
for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const z = geometry.attributes.position.getZ(i);
    const dist = Math.sqrt(x * x + z * z);

    if (dist < islandRadius) {
        const height = (1 - dist / islandRadius) * 2 + noise2D(x * 0.1, z * 0.1);
        geometry.attributes.position.setY(i, height * 0.5);
    } else {
        geometry.attributes.position.setY(i, -2); // обрезаем края
    }
}

geometry.computeVertexNormals();

const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const islandMesh = new THREE.Mesh(geometry, islandMaterial);
scene.add(islandMesh);

// ---------- ВОДА ----------
const waterGeometry = new THREE.PlaneGeometry(islandRadius * 4, islandRadius * 4, 64, 64);
waterGeometry.rotateX(-Math.PI / 2);

const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.7
});

const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
waterMesh.position.y = 0;
scene.add(waterMesh);



// ---------- АНИМАЦИЯ ВОДЫ ----------
export function updateIsland(deltaTime) {
    const positions = waterGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] = Math.sin((positions[i] + deltaTime) * 0.2) * 0.1 +
                           Math.cos((positions[i + 2] + deltaTime) * 0.2) * 0.1;
    }
    waterGeometry.attributes.position.needsUpdate = true;
}
