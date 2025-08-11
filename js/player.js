import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { camera } from './scene.js';

export const player = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x0066cc })
);

player.position.set(0, 0.5, 0);

const keys = {};
let cameraAngle = 0;
const islandRadius = 20;

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

export function movePlayer() {
    const speed = 0.1;
    let forward = 0;
    let strafe = 0;

    if (keys['w'] || keys['arrowup']) forward = 1;
    if (keys['s'] || keys['arrowdown']) forward = -1;
    if (keys['a'] || keys['arrowleft']) strafe = -1;
    if (keys['d'] || keys['arrowright']) strafe = 1;

    // нормализация диагоналей
    const length = Math.hypot(forward, strafe);
    if (length > 0) {
        forward /= length;
        strafe /= length;
    }

    if (keys['q']) cameraAngle += 0.02;
    if (keys['e'] && !nearbyResource) cameraAngle -= 0.02; // Don't rotate when trying to collect

    const angle = cameraAngle;
    player.position.x += Math.sin(angle) * forward * speed + Math.cos(angle) * strafe * speed;
    player.position.z += Math.cos(angle) * forward * speed - Math.sin(angle) * strafe * speed;

    // Ограничение по радиусу острова
    const distFromCenter = Math.sqrt(player.position.x ** 2 + player.position.z ** 2);
    if (distFromCenter > islandRadius - 1) {
        const scale = (islandRadius - 1) / distFromCenter;
        player.position.x *= scale;
        player.position.z *= scale;
    }

    // More isometric camera
    const camDist = 12;
    const camHeight = 8;
    camera.position.x = player.position.x + Math.sin(angle) * camDist;
    camera.position.z = player.position.z + Math.cos(angle) * camDist;
    camera.position.y = player.position.y + camHeight;
    camera.lookAt(player.position);
}
