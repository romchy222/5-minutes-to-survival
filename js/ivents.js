import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { scene } from "./island.js";

window.spawnTornado = function () {
  const geometry = new THREE.CylinderGeometry(0.5, 1, 3, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.6 });
  const tornado = new THREE.Mesh(geometry, material);

  const x = Math.random() - 0.5) * 100;
  const z = Math.random() - 0.5) * 100;

  tornado.position.set(x, 0, z);
  scene.add(tornado);
  return tornado;
  
}
