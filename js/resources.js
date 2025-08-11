import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { scene } from './scene.js';
import { player } from './player.js';
import { updateInventoryUI } from './ui.js';

export const resources = [];
export const inventory = { wood: 0, stone: 0 };

function spawnResource(type, count, islandRadius = 20) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * (islandRadius - 2);
        let x = Math.cos(angle) * distance;
        let z = Math.sin(angle) * distance;
        let y = 0.2;

        let mesh = type === 'wood' ? createTree() : createRock();
        mesh.position.set(x, y, z);
        scene.add(mesh);
        resources.push({ type, mesh });
    }
}

function createTree() {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);

    const leavesGeo = new THREE.ConeGeometry(0.8, 1.5, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 1.2;

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    return tree;
}

function createRock() {
    const geo = new THREE.DodecahedronGeometry(0.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    return new THREE.Mesh(geo, mat);
}

export function initResources() {
    spawnResource('wood', 20);
    spawnResource('stone', 15);
}

export function checkResourceCollection() {
    for (let i = resources.length - 1; i >= 0; i--) {
        const res = resources[i];
        const dist = player.position.distanceTo(res.mesh.position);

        if (dist < 1) {
            inventory[res.type]++;
            scene.remove(res.mesh);
            resources.splice(i, 1);
            updateInventoryUI(inventory);
        }
    }
}
