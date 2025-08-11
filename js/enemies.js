import * as THREE from 'https://esm.sh/three@0.160.0';
import { scene } from './scene.js';
import { player } from './player.js';
import { buildings } from './buildings.js';
import { gameTimer } from './timer.js';

export const enemies = [];
export const projectiles = [];

let lastSpawnTime = 0;
const spawnInterval = 3000; // 3 seconds
const islandRadius = 20;

export function updateEnemySystem() {
    if (gameTimer.gameEnded) return;
    
    spawnEnemies();
    updateEnemies();
    updateTurrets();
    updateProjectiles();
}

function spawnEnemies() {
    const now = Date.now();
    if (now - lastSpawnTime < spawnInterval) return;
    
    lastSpawnTime = now;
    
    // Spawn enemy at random edge position
    const angle = Math.random() * Math.PI * 2;
    const spawnDistance = islandRadius + 2;
    const x = Math.cos(angle) * spawnDistance;
    const z = Math.sin(angle) * spawnDistance;
    
    const enemy = createEnemy();
    enemy.position.set(x, 0.5, z);
    enemy.userData = { 
        type: 'enemy',
        health: 100,
        speed: 0.02,
        target: player.position.clone()
    };
    
    scene.add(enemy);
    enemies.push(enemy);
}

function createEnemy() {
    const geometry = new THREE.ConeGeometry(0.5, 1, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const userData = enemy.userData;
        
        // Move towards player
        const direction = new THREE.Vector3();
        direction.subVectors(player.position, enemy.position);
        direction.normalize();
        
        enemy.position.add(direction.multiplyScalar(userData.speed));
        
        // Check collision with player
        const distToPlayer = enemy.position.distanceTo(player.position);
        if (distToPlayer < 1) {
            // Damage player (for now just end game)
            gameTimer.endGame();
            return;
        }
        
        // Check collision with buildings
        for (let building of buildings) {
            const distToBuilding = enemy.position.distanceTo(building.position);
            if (distToBuilding < 1) {
                // Remove building and enemy
                scene.remove(building);
                const buildingIndex = buildings.indexOf(building);
                if (buildingIndex > -1) buildings.splice(buildingIndex, 1);
                
                destroyEnemy(i);
                break;
            }
        }
        
        // Remove enemies that are too far from the island
        if (enemy.position.distanceTo(new THREE.Vector3(0, 0, 0)) > islandRadius + 5) {
            destroyEnemy(i);
        }
    }
}

function updateTurrets() {
    const turrets = buildings.filter(b => b.userData.type === 'turret');
    
    for (let turret of turrets) {
        const nearestEnemy = findNearestEnemy(turret.position, 8); // 8 unit range
        
        if (nearestEnemy) {
            // Rotate turret towards enemy
            const direction = new THREE.Vector3();
            direction.subVectors(nearestEnemy.position, turret.position);
            direction.normalize();
            
            const angle = Math.atan2(direction.x, direction.z);
            if (turret.children[1]) { // cannon
                turret.children[1].rotation.y = angle;
            }
            
            // Shoot projectile
            if (!turret.userData.lastShot || Date.now() - turret.userData.lastShot > 1000) {
                shootProjectile(turret.position, nearestEnemy.position);
                turret.userData.lastShot = Date.now();
            }
        }
    }
}

function findNearestEnemy(position, maxDistance) {
    let nearest = null;
    let nearestDistance = maxDistance;
    
    for (let enemy of enemies) {
        const distance = position.distanceTo(enemy.position);
        if (distance < nearestDistance) {
            nearest = enemy;
            nearestDistance = distance;
        }
    }
    
    return nearest;
}

function shootProjectile(fromPos, toPos) {
    const projectile = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    
    projectile.position.copy(fromPos);
    projectile.position.y += 1;
    
    const direction = new THREE.Vector3();
    direction.subVectors(toPos, fromPos);
    direction.normalize();
    
    projectile.userData = {
        direction: direction,
        speed: 0.3,
        lifetime: 3000,
        startTime: Date.now()
    };
    
    scene.add(projectile);
    projectiles.push(projectile);
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const userData = projectile.userData;
        
        // Move projectile
        projectile.position.add(userData.direction.clone().multiplyScalar(userData.speed));
        
        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const distance = projectile.position.distanceTo(enemy.position);
            
            if (distance < 0.5) {
                // Hit enemy
                enemy.userData.health -= 50;
                
                if (enemy.userData.health <= 0) {
                    destroyEnemy(j);
                    gameTimer.addScore(100); // Score for killing enemy
                }
                
                // Remove projectile
                scene.remove(projectile);
                projectiles.splice(i, 1);
                break;
            }
        }
        
        // Remove old projectiles
        if (Date.now() - userData.startTime > userData.lifetime) {
            scene.remove(projectile);
            projectiles.splice(i, 1);
        }
    }
}

function destroyEnemy(index) {
    const enemy = enemies[index];
    scene.remove(enemy);
    enemies.splice(index, 1);
}