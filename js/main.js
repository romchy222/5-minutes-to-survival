import * as THREE from 'https://esm.sh/three@0.160.0';
import { scene, renderer, camera } from './scene.js';
import { player, movePlayer } from './player.js';
import { initResources, checkResourceCollection, inventory } from './resources.js';
import { updateInventoryUI } from './ui.js';
import { updateIsland } from './island.js';
import { gameTimer } from './timer.js';
import { updateBuildingSystem } from './buildings.js';
import { updateEnemySystem } from './enemies.js';

// Initialize game
initResources();
updateInventoryUI(inventory);
player.name = 'player'; // Name the player for reference
scene.add(player);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getElapsedTime();

    // Update game timer
    gameTimer.update();
    
    // Only update game systems if game is still running
    if (!gameTimer.gameEnded) {
        movePlayer();
        checkResourceCollection();
        updateBuildingSystem();
        updateEnemySystem();
    }
    
    updateIsland(deltaTime); // Animation continues even after game ends

    renderer.render(scene, camera);
}

animate();
