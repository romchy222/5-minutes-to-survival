import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { scene } from './scene.js';
import { player } from './player.js';
import { updateInventoryUI } from './ui.js';
import { gameTimer } from './timer.js';

export const resources = [];
export const inventory = { wood: 0, stone: 0, iron: 0 };

let nearbyResource = null;
const keys = {};

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function spawnResource(type, count, islandRadius = 20) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * (islandRadius - 2);
        let x = Math.cos(angle) * distance;
        let z = Math.sin(angle) * distance;
        let y = 0.2;

        let mesh = createResourceMesh(type);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        resources.push({ type, mesh });
    }
}

function createResourceMesh(type) {
    switch(type) {
        case 'wood': return createTree();
        case 'stone': return createRock();
        case 'iron': return createIronOre();
        default: return createRock();
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

function createIronOre() {
    const geo = new THREE.OctahedronGeometry(0.4);
    const mat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    return new THREE.Mesh(geo, mat);
}

export function initResources() {
    spawnResource('wood', 20);
    spawnResource('stone', 15);
    spawnResource('iron', 10);
}

export function checkResourceCollection() {
    nearbyResource = null;
    
    for (let i = 0; i < resources.length; i++) {
        const res = resources[i];
        const dist = player.position.distanceTo(res.mesh.position);

        if (dist < 2) {
            nearbyResource = res;
            break;
        }
    }
    
    // Show collection prompt
    updateCollectionPrompt();
    
    // Check for 'E' key press to collect
    if (keys['e'] && nearbyResource) {
        collectResource(nearbyResource);
    }
}

function updateCollectionPrompt() {
    let promptElement = document.getElementById('collectionPrompt');
    
    if (nearbyResource) {
        if (!promptElement) {
            promptElement = document.createElement('div');
            promptElement.id = 'collectionPrompt';
            promptElement.style.position = 'absolute';
            promptElement.style.top = '50%';
            promptElement.style.left = '50%';
            promptElement.style.transform = 'translate(-50%, -50%)';
            promptElement.style.padding = '10px 20px';
            promptElement.style.background = 'rgba(0,0,0,0.7)';
            promptElement.style.color = 'white';
            promptElement.style.borderRadius = '5px';
            promptElement.style.fontFamily = 'Arial, sans-serif';
            promptElement.style.fontSize = '16px';
            promptElement.style.zIndex = '100';
            document.body.appendChild(promptElement);
        }
        promptElement.textContent = `Press E to collect ${nearbyResource.type}`;
        promptElement.style.display = 'block';
    } else if (promptElement) {
        promptElement.style.display = 'none';
    }
}

function collectResource(resource) {
    const index = resources.indexOf(resource);
    if (index === -1) return;
    
    inventory[resource.type]++;
    scene.remove(resource.mesh);
    resources.splice(index, 1);
    updateInventoryUI(inventory);
    
    // Add score points
    const points = { wood: 10, stone: 15, iron: 25 };
    gameTimer.addScore(points[resource.type] || 10);
    
    nearbyResource = null;
    updateCollectionPrompt();
}
