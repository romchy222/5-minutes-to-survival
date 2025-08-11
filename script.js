// The three.js scene: the 3D world where you put objects
const scene = new THREE.Scene();

// The camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

// The renderer: something that draws 3D objects onto the canvas
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa, 1);
// Append the renderer canvas into <body>
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(100, 100);
const material = new THREE.MeshBasicMaterial({ color: 0x228B22 });

const ground = new THREE.Mesh(geometry, material);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

function _rendering(){
  renderer.render(scene, camera);
  requestAnimationFrame(_rendering);
}

_rendering();

