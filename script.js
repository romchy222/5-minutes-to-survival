// 5 Minutes to Survival 3D Game
// Fallback Three.js implementation for environments where CDN is blocked

// Minimal 3D Math utilities
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  
  add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
  subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
  multiply(s) { return new Vector3(this.x * s, this.y * s, this.z * s); }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  normalize() {
    const len = this.length();
    return len > 0 ? new Vector3(this.x / len, this.y / len, this.z / len) : new Vector3();
  }
}

// Simple 3D rendering context
class Simple3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    this.camera = { x: 0, y: 10, z: 20, rotX: -0.3, rotY: 0 };
    this.objects = [];
  }
  
  project(x, y, z) {
    // Simple isometric projection
    const scale = 400 / (z + 20);
    const screenX = this.width/2 + (x - this.camera.x) * scale;
    const screenY = this.height/2 + (y - this.camera.y) * scale;
    return { x: screenX, y: screenY, z: z };
  }
  
  clear() {
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  drawTerrain(heightMap, size) {
    const cellSize = 800 / size;
    
    for (let x = 0; x < size - 1; x++) {
      for (let z = 0; z < size - 1; z++) {
        const worldX1 = (x - size/2) * cellSize;
        const worldZ1 = (z - size/2) * cellSize;
        const worldX2 = (x + 1 - size/2) * cellSize;
        const worldZ2 = (z + 1 - size/2) * cellSize;
        
        const h1 = heightMap[x][z];
        const h2 = heightMap[x+1][z];
        const h3 = heightMap[x][z+1];
        const h4 = heightMap[x+1][z+1];
        
        const p1 = this.project(worldX1, h1, worldZ1);
        const p2 = this.project(worldX2, h2, worldZ1);
        const p3 = this.project(worldX1, h3, worldZ2);
        const p4 = this.project(worldX2, h4, worldZ2);
        
        // Draw triangles
        this.ctx.fillStyle = h1 < -2 ? '#4682B4' : h1 < 0 ? '#DEB887' : '#228B22';
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineTo(p3.x, p3.y);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(p2.x, p2.y);
        this.ctx.lineTo(p4.x, p4.y);
        this.ctx.lineTo(p3.x, p3.y);
        this.ctx.fill();
      }
    }
  }
  
  drawObject(obj) {
    const p = this.project(obj.x, obj.y, obj.z);
    if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) return;
    
    this.ctx.fillStyle = obj.color;
    
    if (obj.type === 'player') {
      this.ctx.fillRect(p.x - 8, p.y - 16, 16, 16);
    } else if (obj.type === 'tree') {
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(p.x - 3, p.y - 15, 6, 15);
      this.ctx.fillStyle = '#228B22';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y - 15, 12, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (obj.type === 'rock') {
      this.ctx.fillRect(p.x - 6, p.y - 6, 12, 6);
    } else if (obj.type === 'iron') {
      this.ctx.fillStyle = '#696969';
      this.ctx.fillRect(p.x - 4, p.y - 4, 8, 4);
    } else if (obj.type === 'enemy') {
      this.ctx.fillStyle = '#FF0000';
      this.ctx.fillRect(p.x - 6, p.y - 12, 12, 12);
    } else if (obj.type === 'building') {
      if (obj.buildType === 'wall') {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(p.x - 8, p.y - 12, 16, 12);
      } else if (obj.buildType === 'turret') {
        this.ctx.fillStyle = '#708090';
        this.ctx.fillRect(p.x - 10, p.y - 20, 20, 20);
      } else if (obj.buildType === 'trap') {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(p.x - 12, p.y - 2, 24, 2);
      }
    }
  }
  
  render() {
    this.clear();
    
    // Sort objects by z-depth for proper rendering
    const allObjects = [...this.objects];
    allObjects.sort((a, b) => b.z - a.z);
    
    allObjects.forEach(obj => this.drawObject(obj));
  }
}

// Game State
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Simple3D(this.canvas);
    
    // Game state
    this.isRunning = false;
    this.gameTime = 300; // 5 minutes
    this.score = 0;
    this.resources = { wood: 0, stone: 0, iron: 0 };
    
    // Player
    this.player = { x: 0, y: 0, z: 0, type: 'player', color: '#0000FF' };
    
    // Game objects
    this.trees = [];
    this.rocks = [];
    this.ironOres = [];
    this.enemies = [];
    this.buildings = [];
    this.enemySpawners = [];
    
    // Input
    this.keys = {};
    this.buildMode = false;
    this.selectedBuildType = null;
    
    // Generate terrain
    this.generateTerrain();
    this.generateResources();
    this.setupEnemySpawners();
    
    this.setupEventListeners();
    this.startGame();
  }
  
  generateTerrain() {
    const size = 64;
    const noise = new SimplexNoise();
    this.heightMap = [];
    
    for (let x = 0; x < size; x++) {
      this.heightMap[x] = [];
      for (let z = 0; z < size; z++) {
        let height = 0;
        height += noise.noise2D(x * 0.03, z * 0.03) * 8;
        height += noise.noise2D(x * 0.06, z * 0.06) * 4;
        height += noise.noise2D(x * 0.12, z * 0.12) * 2;
        
        // Create island shape (distance from center)
        const centerX = size / 2;
        const centerZ = size / 2;
        const dist = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2);
        const maxDist = size * 0.4;
        
        if (dist > maxDist) {
          height = -10; // Water
        } else if (dist > maxDist * 0.8) {
          height *= (maxDist - dist) / (maxDist * 0.2); // Fade to water
        }
        
        this.heightMap[x][z] = height;
      }
    }
  }
  
  generateResources() {
    const mapSize = 800;
    const cellSize = mapSize / 64;
    
    // Generate trees
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * mapSize;
      const z = (Math.random() - 0.5) * mapSize;
      const height = this.getHeightAt(x, z);
      
      if (height > 0 && Math.random() < 0.3) {
        this.trees.push({
          x, y: height, z, type: 'tree', color: '#228B22',
          resource: 'wood', amount: 3 + Math.floor(Math.random() * 3)
        });
      }
    }
    
    // Generate rocks
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * mapSize;
      const z = (Math.random() - 0.5) * mapSize;
      const height = this.getHeightAt(x, z);
      
      if (height > 0 && Math.random() < 0.4) {
        this.rocks.push({
          x, y: height, z, type: 'rock', color: '#696969',
          resource: 'stone', amount: 2 + Math.floor(Math.random() * 3)
        });
      }
    }
    
    // Generate iron ore
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * mapSize;
      const z = (Math.random() - 0.5) * mapSize;
      const height = this.getHeightAt(x, z);
      
      if (height > 2 && Math.random() < 0.5) {
        this.ironOres.push({
          x, y: height, z, type: 'iron', color: '#C0C0C0',
          resource: 'iron', amount: 1 + Math.floor(Math.random() * 2)
        });
      }
    }
  }
  
  getHeightAt(x, z) {
    const size = 64;
    const mapSize = 800;
    const cellSize = mapSize / size;
    
    const gridX = Math.floor((x + mapSize/2) / cellSize);
    const gridZ = Math.floor((z + mapSize/2) / cellSize);
    
    if (gridX < 0 || gridX >= size || gridZ < 0 || gridZ >= size) {
      return -10; // Water outside map
    }
    
    return this.heightMap[gridX][gridZ];
  }
  
  setupEnemySpawners() {
    const mapEdge = 350;
    this.enemySpawners = [
      { x: mapEdge, z: 0 },
      { x: -mapEdge, z: 0 },
      { x: 0, z: mapEdge },
      { x: 0, z: -mapEdge }
    ];
  }
  
  setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      if (e.code === 'KeyB') {
        this.toggleBuildMenu();
      }
      if (e.code === 'KeyE') {
        this.collectNearbyResource();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    // UI Event listeners
    document.getElementById('buildWall').addEventListener('click', () => {
      this.selectBuildType('wall');
    });
    
    document.getElementById('buildTurret').addEventListener('click', () => {
      this.selectBuildType('turret');
    });
    
    document.getElementById('buildTrap').addEventListener('click', () => {
      this.selectBuildType('trap');
    });
    
    document.getElementById('closeBuild').addEventListener('click', () => {
      this.closeBuildMenu();
    });
    
    document.getElementById('restartBtn').addEventListener('click', () => {
      this.restartGame();
    });
    
    // Canvas click for building
    this.canvas.addEventListener('click', (e) => {
      if (this.buildMode && this.selectedBuildType) {
        this.placeBuildingAtCursor(e);
      }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.renderer.width = this.canvas.width = window.innerWidth;
      this.renderer.height = this.canvas.height = window.innerHeight;
    });
  }
  
  startGame() {
    this.isRunning = true;
    this.gameLoop();
  }
  
  gameLoop() {
    if (!this.isRunning) return;
    
    this.update();
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  }
  
  update() {
    if (this.gameTime <= 0) {
      this.endGame();
      return;
    }
    
    this.gameTime -= 1/60; // Assume 60 FPS
    
    this.updatePlayer();
    this.updateEnemies();
    this.updateBuildings();
    this.spawnEnemies();
    this.updateUI();
  }
  
  updatePlayer() {
    const speed = 3;
    let moveX = 0, moveZ = 0;
    
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= speed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += speed;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= speed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += speed;
    
    if (moveX !== 0 || moveZ !== 0) {
      const newX = this.player.x + moveX;
      const newZ = this.player.z + moveZ;
      const height = this.getHeightAt(newX, newZ);
      
      if (height > -1) { // Don't walk into water
        this.player.x = newX;
        this.player.z = newZ;
        this.player.y = height;
        
        // Update camera to follow player
        this.renderer.camera.x = this.player.x;
        this.renderer.camera.z = this.player.z + 20;
      }
    }
  }
  
  updateEnemies() {
    this.enemies.forEach(enemy => {
      // Move toward player
      const dx = this.player.x - enemy.x;
      const dz = this.player.z - enemy.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist > 1) {
        const speed = 1;
        enemy.x += (dx / dist) * speed;
        enemy.z += (dz / dist) * speed;
        enemy.y = this.getHeightAt(enemy.x, enemy.z);
      } else {
        // Enemy reached player - damage or game over logic
        this.score = Math.max(0, this.score - 10);
      }
    });
  }
  
  updateBuildings() {
    this.buildings.forEach(building => {
      if (building.buildType === 'turret') {
        // Turret shooting logic
        const nearestEnemy = this.findNearestEnemy(building.x, building.z, 50);
        if (nearestEnemy && Math.random() < 0.1) {
          // Remove enemy (simplified shooting)
          const index = this.enemies.indexOf(nearestEnemy);
          if (index > -1) {
            this.enemies.splice(index, 1);
            this.score += 10;
          }
        }
      }
    });
  }
  
  findNearestEnemy(x, z, range) {
    let nearest = null;
    let minDist = range;
    
    this.enemies.forEach(enemy => {
      const dist = Math.sqrt((enemy.x - x) ** 2 + (enemy.z - z) ** 2);
      if (dist < minDist) {
        nearest = enemy;
        minDist = dist;
      }
    });
    
    return nearest;
  }
  
  spawnEnemies() {
    if (Math.random() < 0.02) { // 2% chance per frame
      const spawner = this.enemySpawners[Math.floor(Math.random() * this.enemySpawners.length)];
      this.enemies.push({
        x: spawner.x, y: 0, z: spawner.z,
        type: 'enemy', color: '#FF0000'
      });
    }
  }
  
  collectNearbyResource() {
    const range = 30;
    
    // Check trees
    for (let i = this.trees.length - 1; i >= 0; i--) {
      const tree = this.trees[i];
      const dist = Math.sqrt((tree.x - this.player.x) ** 2 + (tree.z - this.player.z) ** 2);
      if (dist < range) {
        this.resources.wood += tree.amount;
        this.score += tree.amount * 2;
        this.trees.splice(i, 1);
        return;
      }
    }
    
    // Check rocks
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const rock = this.rocks[i];
      const dist = Math.sqrt((rock.x - this.player.x) ** 2 + (rock.z - this.player.z) ** 2);
      if (dist < range) {
        this.resources.stone += rock.amount;
        this.score += rock.amount * 3;
        this.rocks.splice(i, 1);
        return;
      }
    }
    
    // Check iron
    for (let i = this.ironOres.length - 1; i >= 0; i--) {
      const iron = this.ironOres[i];
      const dist = Math.sqrt((iron.x - this.player.x) ** 2 + (iron.z - this.player.z) ** 2);
      if (dist < range) {
        this.resources.iron += iron.amount;
        this.score += iron.amount * 5;
        this.ironOres.splice(i, 1);
        return;
      }
    }
  }
  
  toggleBuildMenu() {
    const menu = document.getElementById('buildMenu');
    if (menu.style.display === 'none') {
      menu.style.display = 'block';
      this.buildMode = true;
    } else {
      this.closeBuildMenu();
    }
  }
  
  closeBuildMenu() {
    document.getElementById('buildMenu').style.display = 'none';
    this.buildMode = false;
    this.selectedBuildType = null;
  }
  
  selectBuildType(type) {
    const costs = {
      wall: { wood: 10 },
      turret: { wood: 5, stone: 5 },
      trap: { wood: 3, iron: 2 }
    };
    
    const cost = costs[type];
    let canBuild = true;
    
    for (const resource in cost) {
      if (this.resources[resource] < cost[resource]) {
        canBuild = false;
        break;
      }
    }
    
    if (canBuild) {
      this.selectedBuildType = type;
      this.closeBuildMenu();
    }
  }
  
  placeBuildingAtCursor(event) {
    if (!this.selectedBuildType) return;
    
    // Simple cursor to world conversion (approximate)
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates (simplified)
    const worldX = this.player.x + (x - this.renderer.width/2) * 0.1;
    const worldZ = this.player.z + (y - this.renderer.height/2) * 0.1;
    const height = this.getHeightAt(worldX, worldZ);
    
    if (height > 0) { // Can't build in water
      const costs = {
        wall: { wood: 10 },
        turret: { wood: 5, stone: 5 },
        trap: { wood: 3, iron: 2 }
      };
      
      const cost = costs[this.selectedBuildType];
      
      // Deduct resources
      for (const resource in cost) {
        this.resources[resource] -= cost[resource];
      }
      
      // Place building
      this.buildings.push({
        x: worldX, y: height, z: worldZ,
        type: 'building', buildType: this.selectedBuildType,
        color: '#8B4513'
      });
      
      this.score += 20; // Building bonus
    }
    
    this.selectedBuildType = null;
  }
  
  updateUI() {
    document.getElementById('timer').textContent = `Time: ${Math.ceil(this.gameTime)}s`;
    document.getElementById('wood').textContent = this.resources.wood;
    document.getElementById('stone').textContent = this.resources.stone;
    document.getElementById('iron').textContent = this.resources.iron;
    document.getElementById('scoreValue').textContent = this.score;
  }
  
  render() {
    // Prepare objects for rendering
    this.renderer.objects = [
      this.player,
      ...this.trees,
      ...this.rocks,
      ...this.ironOres,
      ...this.enemies,
      ...this.buildings
    ];
    
    // Draw terrain first
    this.renderer.clear();
    this.renderer.drawTerrain(this.heightMap, 64);
    this.renderer.render();
  }
  
  endGame() {
    this.isRunning = false;
    
    // Save high score
    const savedScore = localStorage.getItem('survival_highscore') || 0;
    if (this.score > savedScore) {
      localStorage.setItem('survival_highscore', this.score);
    }
    
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').style.display = 'block';
  }
  
  restartGame() {
    // Reset game state
    this.gameTime = 300;
    this.score = 0;
    this.resources = { wood: 0, stone: 0, iron: 0 };
    this.player = { x: 0, y: 0, z: 0, type: 'player', color: '#0000FF' };
    this.enemies = [];
    this.buildings = [];
    this.buildMode = false;
    this.selectedBuildType = null;
    
    // Regenerate resources
    this.generateResources();
    
    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
    
    // Restart game loop
    this.isRunning = true;
    this.gameLoop();
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});