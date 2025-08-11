import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { scene, renderer, camera } from './scene.js';
import { player, movePlayer } from './player.js';
import { initResources, checkResourceCollection, inventory } from './resources.js';
import { updateInventoryUI } from './ui.js';
import { updateIsland } from './island.js';

initResources();
updateInventoryUI(inventory);
scene.add(player);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getElapsedTime();

    movePlayer();
    checkResourceCollection();
    updateIsland(deltaTime); // анимация воды и прочего

    renderer.render(scene, camera);
}

animate();
