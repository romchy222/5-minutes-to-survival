import * as THREE from 'https://esm.sh/three@0.160.0';
import { scene, camera, renderer } from './scene.js';
import { inventory } from './resources.js';
import { updateInventoryUI } from './ui.js';
import { gameTimer } from './timer.js';

export const buildings = [];
let buildMenuOpen = false;
let selectedBuildingType = null;
let buildingGhost = null;

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

const buildingCosts = {
    wall: { wood: 10, stone: 0, iron: 0 },
    turret: { wood: 5, stone: 5, iron: 0 },
    trap: { wood: 3, stone: 0, iron: 2 }
};

const buildingScores = {
    wall: 50,
    turret: 100,
    trap: 75
};

export function updateBuildingSystem() {
    if (keys['b'] && !buildMenuOpen) {
        openBuildMenu();
    }
    
    if (selectedBuildingType && !buildMenuOpen) {
        updateBuildingGhost();
    }
}

function openBuildMenu() {
    buildMenuOpen = true;
    
    const menu = document.createElement('div');
    menu.id = 'buildMenu';
    menu.style.position = 'fixed';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0,0,0,0.9)';
    menu.style.padding = '20px';
    menu.style.borderRadius = '10px';
    menu.style.color = 'white';
    menu.style.fontFamily = 'Arial, sans-serif';
    menu.style.zIndex = '1000';
    
    menu.innerHTML = `
        <h3>Build Menu</h3>
        <div style="margin: 10px 0;">
            <button id="buildWall" style="display: block; margin: 5px 0; padding: 10px; width: 100%;">
                Wall (🌲 10 Wood) - Defense
            </button>
            <button id="buildTurret" style="display: block; margin: 5px 0; padding: 10px; width: 100%;">
                Turret (🌲 5 Wood, 🪨 5 Stone) - Auto-shoot enemies
            </button>
            <button id="buildTrap" style="display: block; margin: 5px 0; padding: 10px; width: 100%;">
                Trap (🌲 3 Wood, ⚙️ 2 Iron) - Damage enemies
            </button>
            <button id="closeBuild" style="display: block; margin: 10px 0; padding: 10px; width: 100%; background: #f44336;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('buildWall').addEventListener('click', () => selectBuilding('wall'));
    document.getElementById('buildTurret').addEventListener('click', () => selectBuilding('turret'));
    document.getElementById('buildTrap').addEventListener('click', () => selectBuilding('trap'));
    document.getElementById('closeBuild').addEventListener('click', closeBuildMenu);
}

function selectBuilding(type) {
    if (canAfford(type)) {
        selectedBuildingType = type;
        closeBuildMenu();
        createBuildingGhost(type);
    } else {
        alert('Not enough resources!');
    }
}

function canAfford(type) {
    const cost = buildingCosts[type];
    return inventory.wood >= cost.wood && 
           inventory.stone >= cost.stone && 
           inventory.iron >= cost.iron;
}

function closeBuildMenu() {
    buildMenuOpen = false;
    const menu = document.getElementById('buildMenu');
    if (menu) {
        menu.remove();
    }
}

function createBuildingGhost(type) {
    if (buildingGhost) {
        scene.remove(buildingGhost);
    }
    
    buildingGhost = createBuildingMesh(type);
    buildingGhost.material = buildingGhost.material.clone();
    buildingGhost.material.transparent = true;
    buildingGhost.material.opacity = 0.5;
    scene.add(buildingGhost);
}

function updateBuildingGhost() {
    if (!buildingGhost) return;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Get mouse position (for now, just place in front of player)
    // In a real implementation, you'd track mouse movement
    const playerPos = scene.getObjectByName('player')?.position || new THREE.Vector3(0, 0, 0);
    buildingGhost.position.copy(playerPos);
    buildingGhost.position.x += 2;
    buildingGhost.position.y = 0.5;
}

// Add click listener for placing buildings
renderer.domElement.addEventListener('click', (event) => {
    if (selectedBuildingType && buildingGhost) {
        placeBuildingAtGhost();
    }
});

function placeBuildingAtGhost() {
    if (!selectedBuildingType || !buildingGhost) return;
    
    // Deduct resources
    const cost = buildingCosts[selectedBuildingType];
    inventory.wood -= cost.wood;
    inventory.stone -= cost.stone;
    inventory.iron -= cost.iron;
    
    // Create actual building
    const building = createBuildingMesh(selectedBuildingType);
    building.position.copy(buildingGhost.position);
    building.userData = { type: selectedBuildingType };
    scene.add(building);
    buildings.push(building);
    
    // Add score
    gameTimer.addScore(buildingScores[selectedBuildingType]);
    
    // Clean up
    scene.remove(buildingGhost);
    buildingGhost = null;
    selectedBuildingType = null;
    
    updateInventoryUI(inventory);
}

function createBuildingMesh(type) {
    switch(type) {
        case 'wall':
            return new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x8B4513 })
            );
        case 'turret':
            const turretGroup = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.8, 1, 8),
                new THREE.MeshStandardMaterial({ color: 0x666666 })
            );
            const cannon = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            cannon.rotation.z = Math.PI / 2;
            cannon.position.y = 0.5;
            turretGroup.add(base);
            turretGroup.add(cannon);
            return turretGroup;
        case 'trap':
            return new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.1, 6),
                new THREE.MeshStandardMaterial({ color: 0x654321 })
            );
        default:
            return new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0x888888 })
            );
    }
}