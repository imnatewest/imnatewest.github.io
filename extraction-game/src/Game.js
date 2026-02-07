import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Item } from './entities/Item.js';
import { World } from './World.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { AudioManager } from './systems/AudioManager.js';
import { OcclusionSystem } from './systems/OcclusionSystem.js';
import { AsylumMap } from './maps/AsylumMap.js';

export class Game {
    constructor() {
        this.renderer = new Renderer();
        this.input = new Input();
        this.particleSystem = new ParticleSystem(this.renderer.scene); // Init before World
        this.audioManager = new AudioManager();
        this.world = new World(this.renderer.scene, this.particleSystem);
        this.occlusionSystem = new OcclusionSystem();
        this.player = null;
        this.enemies = [];
        this.items = [];
        
        const savedLevel = localStorage.getItem('rpg_level');
        const savedQuota = localStorage.getItem('rpg_quota');
        
        this.level = savedLevel ? parseInt(savedLevel) : 1;
        this.quota = savedQuota ? parseInt(savedQuota) : 5;
        this.collected = 0;
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.playerDamage = 1; // Persistent Stat
        this.playerSpeed = 10; // Persistent Stat
        this.isGameOver = false;
        this.isPaused = false;
        
        this.collected = 0;
        this.quota = 5;
        this.gold = 0; // Currency for upgrades
        this.isGameOver = false;
        this.isShopOpen = false;
        this.currentMapType = 'forest'; // Default
        
        // Day/Night Cycle
        this.timeOfDay = 0; // 0.0 to 1.0 (0=Start of Day, 0.5=Sunset, 1.0=End of Night)
        this.dayDuration = 120; // 2 minutes per full cycle
        this.lastTime = 0;
        
        // UI Elements
        // UI Elements
        this.uiHealthBar = document.getElementById('health-bar-fill');
        this.collectedDisplay = document.getElementById('collected-display');
        this.quotaDisplay = document.getElementById('quota-display');
        this.itemIconElement = document.getElementById('item-icon'); // Mushroom or can icon
        this.uiLevel = document.getElementById('level-display');
        this.uiMessage = document.getElementById('message');
        this.uiFog = document.getElementById('fog-overlay');
        this.uiHud = document.getElementById('floating-hud');
        this.uiStart = document.getElementById('start-screen');
        
        // Shop UI
        this.uiShop = document.getElementById('shop-screen');
        this.uiShopGold = document.getElementById('shop-gold');
        this.uiStatHealth = document.getElementById('stat-health');
        this.uiStatDamage = document.getElementById('stat-damage');
        this.uiStatSpeed = document.getElementById('stat-speed');
        
        this.btnHeal = document.getElementById('btn-heal');
        this.btnDamage = document.getElementById('btn-damage');
        this.btnSpeed = document.getElementById('btn-speed');
        this.btnNextLevel = document.getElementById('btn-next-level');

        // Bind Shop Buttons
        this.btnHeal.onclick = () => this.buyHeal();
        this.btnDamage.onclick = () => this.buyDamage();
        this.btnSpeed.onclick = () => this.buySpeed();
        this.btnNextLevel.onclick = () => this.startNextLevel();
        
        // Screens
        this.uiSuccess = document.getElementById('success-screen');
        this.uiGameOver = document.getElementById('game-over-screen');
        this.uiPause = document.getElementById('pause-screen');
        
        // Pause Buttons
        document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-back-to-menu').addEventListener('click', () => this.backToMenu());
        
        // Mobile Controls
        this.fullscreenTarget = document.getElementById('game-container') || document.documentElement;
        this.uiMobileControls = document.getElementById('mobile-controls');
        this.btnMobilePause = document.getElementById('btn-mobile-pause');
        this.btnMobileAttack = document.getElementById('btn-mobile-attack');

        if (this.btnMobilePause) {
            this.btnMobilePause.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePause();
            });
            // Prevent touch from propagating to canvas
            this.btnMobilePause.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
        }

        if (this.btnMobileAttack) {
            this.btnMobileAttack.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent canvas touch
                this.input.keys.attack = true;
            }, { passive: false });
            
            this.btnMobileAttack.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.input.keys.attack = false;
            }, { passive: false });
        }
        
        this.btnMobileFullscreen = document.getElementById('btn-mobile-fullscreen');
        if (this.btnMobileFullscreen) {
            this.btnMobileFullscreen.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFullscreen();
            });
            // Prevent touch propagation
            this.btnMobileFullscreen.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
        }
        
        const minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = minimapCanvas.getContext('2d');
        this.minimapSize = minimapCanvas.width; // 200
        
        document.getElementById('btn-map-forest').addEventListener('click', () => {
            this.audioManager.resume();
            this.audioManager.startAmbience();
            this.start('forest');
        });
        
        document.getElementById('btn-map-city').addEventListener('click', () => {
            this.audioManager.resume();
            this.audioManager.startAmbience();
            this.start('city');
        });

        document.getElementById('btn-map-asylum').addEventListener('click', () => {
            this.audioManager.resume();
            this.audioManager.startAmbience();
            this.start('asylum');
        });
        document.getElementById('restart-btn').addEventListener('click', () => this.restart(false));
        // Note: btn-next-level is inside the shop screen now, handled by this.btnNextLevel binding below
        // document.getElementById('next-level-btn').addEventListener('click', () => this.restart(true));
        
        // Setup Escape key handler for pause
        this.input.onEscapePressed = () => this.togglePause();
        
        // Setup Input dependencies for touch controls (will be set when game starts)
        // These will be initialized in start() method
        
        // Auto-start only if triggered by "Next Level" (flag in sessionStorage)
        const shouldAutoStart = sessionStorage.getItem('rpg_auto_start') === 'true';
        
        if (shouldAutoStart && this.level > 1) {
            sessionStorage.removeItem('rpg_auto_start'); // Clear flag so refresh shows menu
            this.start();
        }
    }

    start(mapType = 'forest') {
        this.currentMapType = mapType;
        
        // Update item icon based on map
    if (this.itemIconElement) {
        if (mapType === 'city') this.itemIconElement.textContent = '🥫';
        else if (mapType === 'asylum') this.itemIconElement.textContent = '💊';
        else this.itemIconElement.textContent = '🍄';
    }

        this.uiStart.classList.add('hidden');
        this.uiHud.classList.remove('hidden');
        if (this.uiMobileControls) this.uiMobileControls.classList.remove('hidden');
        this.uiFog.classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');
        this.uiLevel.innerText = this.level;
        
        // Only generate if not already generated (to avoid double gen if called multiple times safely)
        if (!this.player) {
            this.world.loadMap(this.currentMapType); // Reload map
            this.spawnEntities();
            this.animate(0);
        }
    }

    // Cross-browser fullscreen toggle for mobile (supports iOS Safari prefix)
    toggleFullscreen() {
        const doc = document;
        const isFull = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
        if (!isFull) {
            const el = this.fullscreenTarget || doc.documentElement;
            const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
            if (request) {
                request.call(el).catch((err) => {
                    console.log(`Error attempting to enable fullscreen: ${err.message}`);
                });
            }
        } else {
            const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
            if (exit) exit.call(doc);
        }
    }

    spawnEntities() {
        // Player
        // Player
        this.player = new Player(this.renderer.scene, this.particleSystem, this.audioManager);
        this.player.damage = this.playerDamage;
        this.player.speed = this.playerSpeed;
        
        // Set spawn position from map if available
        if (this.world.currentMap && this.world.currentMap.playerSpawn) {
            this.player.mesh.position.copy(this.world.currentMap.playerSpawn);
        }
        
        // Setup Input dependencies for touch controls
        this.input.setDependencies(this.renderer.camera, this.renderer.renderer);
        
        // Items
        // Items
        // Spawn Items (Mushrooms/Pills)
        if (this.world.allowItems) {
            let spawnCount = 15;
            if (this.currentMapType === 'asylum') {
                spawnCount = this.quota + 1;
            }
            
            // Use map-specific safe spawns if available
            if (this.world.currentMap && this.world.currentMap.itemSpawns && this.world.currentMap.itemSpawns.length > 0) {
                const spawns = [...this.world.currentMap.itemSpawns];
                // Shuffle
                for (let i = spawns.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [spawns[i], spawns[j]] = [spawns[j], spawns[i]];
                }
                
                for (let i = 0; i < Math.min(spawnCount, spawns.length); i++) {
                    this.items.push(new Item(this.renderer.scene, spawns[i], this.currentMapType));
                }
            } else {
                for (let i = 0; i < spawnCount; i++) {
                    const x = (Math.random() - 0.5) * 100;
                    const z = (Math.random() - 0.5) * 100;
                    this.items.push(new Item(this.renderer.scene, new THREE.Vector3(x, 0, z), this.currentMapType));
                }
            }
            
            // Force one spawn near player for testing
            this.items.push(new Item(this.renderer.scene, new THREE.Vector3(0, 0, 5), this.currentMapType));
        }
        
        // We set spawnTimer to 7.0 so the first enemy spawns after 3 seconds (since day interval is 10s).
        this.spawnTimer = 7.0;
        
        this.updateUI();
    }

    spawnEnemy() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 20; // Closer spawn (20-40 units)
        const x = this.player.mesh.position.x + Math.cos(angle) * dist;
        const z = this.player.mesh.position.z + Math.sin(angle) * dist;
        
        const pos = new THREE.Vector3(x, 0, z);
        // Don't spawn too close to player
        if (this.player && pos.distanceTo(this.player.mesh.position) < 10) {
            return; 
        }
        
        // Random Type based on Map
        let type = 'slime';
        
        if (this.currentMapType === 'city') {
            // City Enemies: Car (50%), Drone (50%)
            type = Math.random() > 0.5 ? 'car' : 'drone';
        } else if (this.currentMapType === 'asylum') {
            // Asylum Enemies: Patient (100%)
            type = 'patient';
        } else {
            // Forest Enemies
            const rand = Math.random();
            if (rand > 0.8) type = 'golem'; // 20%
            else if (rand > 0.5) type = 'spider'; // 30%
        }
        
        this.enemies.push(new Enemy(this.renderer.scene, pos, type, this.particleSystem));
    }

    restart(nextLevel = false) {
        if (nextLevel) {
            localStorage.setItem('rpg_level', this.level);
            localStorage.setItem('rpg_quota', this.quota);
        } else {
            // Reset to level 1 on death/restart
            this.level = 1;
            this.quota = 5;
            localStorage.setItem('rogue_level', 1);
            localStorage.setItem('rogue_quota', 5);
        }
        
        // Soft Reset State
        // Soft Reset State
        this.collected = 0;
        
        if (!nextLevel) {
            this.health = this.maxHealth;
            this.playerDamage = 1;
            this.playerSpeed = 10;
        }
        
        this.isGameOver = false;
        this.isGameOver = false;
        this.damageCooldown = 0;
        this.timeOfDay = 0; // Reset to Day
        
        // Clear World & Entities
        this.world.clear();
        this.particleSystem.clear();
        
        if (this.player) {
            this.player.dispose();
            this.renderer.scene.remove(this.player.mesh);
            this.player = null;
        }
        
        this.enemies.forEach(e => {
            e.dispose();
            this.renderer.scene.remove(e.mesh);
        });
        this.enemies = [];
        
        this.items.forEach(i => {
            i.dispose();
            this.renderer.scene.remove(i.mesh);
        });
        this.items = [];
        
        // UI Reset
        this.uiSuccess.classList.add('hidden');
        this.uiGameOver.classList.add('hidden');
        this.uiHud.classList.remove('hidden');
        if (this.uiMobileControls) this.uiMobileControls.classList.remove('hidden');
        this.uiLevel.innerText = this.level;
        this.updateUI();
        
        // Re-generate
        this.world.loadMap(this.currentMapType);
        this.spawnEntities();
        
        // Audio (Ensure ambience is playing)
        this.audioManager.resume();
        this.audioManager.startAmbience();
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));

        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (!this.isGameOver && !this.isPaused && this.player) {
            this.update(deltaTime);
            
            // Ambient Fireflies
            if (Math.random() > 0.95) {
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    Math.random() * 2,
                    (Math.random() - 0.5) * 20
                );
                this.particleSystem.emit(this.player.mesh.position.clone().add(offset), 'spark', 1);
            }
        }
        
        // Spawn Enemies logic moved to update()
        this.particleSystem.update(deltaTime, this.renderer.camera);
        
        // Camera follow player
        if (this.player) {
            const target = this.player.mesh.position.clone();
            this.renderer.camera.position.x = target.x + 20;
            this.renderer.camera.position.y = target.y + 20;
            this.renderer.camera.position.z = target.z + 20;
            this.renderer.camera.lookAt(target);
            
            // Update Floating HUD Position
            // Project player position to screen space
            const hudPos = target.clone().add(new THREE.Vector3(0, 4.0, 0)); // Higher above head
            hudPos.project(this.renderer.camera);
            
            const x = (hudPos.x * .5 + .5) * window.innerWidth;
            const y = (-(hudPos.y * .5) + .5) * window.innerHeight;
            
            this.uiHud.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;

            // Update Directional Light to follow player (for shadows)
            // Maintain the original offset (20, 40, 10) defined in Renderer.js
            const lightOffset = new THREE.Vector3(20, 40, 10);
            this.renderer.dirLight.position.copy(target).add(lightOffset);
            this.renderer.dirLight.target.position.copy(target);
            this.renderer.dirLight.target.updateMatrixWorld(); // Important for target to update

            // Occlusion System
            if (this.world.currentMap) {
                this.occlusionSystem.update(
                    this.renderer.camera, 
                    this.player.mesh, 
                    this.world.currentMap.props
                );
            }
        }

        this.renderer.render();
        this.updateMinimap();
    }

    updateMinimap() {
        if (!this.player) return;
        
        const ctx = this.minimapCtx;
        const size = this.minimapSize;
        const mapRadius = 70;
        const scale = size / (mapRadius * 2);
        const center = size / 2;

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Background (optional, maybe semi-transparent circle)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(center, center, size/2, 0, Math.PI * 2);
        ctx.fill();

        // Helper to transform world to map
        const toMap = (pos) => {
            return {
                x: center + pos.x * scale,
                y: center + pos.z * scale
            };
        };

        // Draw Extraction Zone
        const exitPos = toMap(new THREE.Vector3(15, 0, 15));
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(exitPos.x - 4, exitPos.y - 4, 8, 8);

        // Draw Enemies
        ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            const p = toMap(enemy.mesh.position);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Player
        const playerPos = toMap(this.player.mesh.position);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(playerPos.x, playerPos.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Player Direction
        const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.mesh.quaternion);
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(playerPos.x, playerPos.y);
        ctx.lineTo(playerPos.x + dir.x * 8, playerPos.y + dir.z * 8);
        ctx.stroke();
    }

    update(deltaTime) {
        if (this.isShopOpen || this.isPaused) return; // Pause game when shop is open or paused

        // Update Time
        this.timeOfDay += deltaTime / this.dayDuration;
        if (this.timeOfDay >= 1.0) this.timeOfDay = 0; // Loop
        
        this.updateDayNightCycle();

        // Dynamic Spawning
        if (this.world.allowEnemies) {
            this.spawnTimer += deltaTime;
            let spawnInterval = 10.0; // Day: Every 10s
            let maxEnemies = 5 + this.level;
            
            // Night (0.5 to 1.0)
            if (this.timeOfDay > 0.5) {
                spawnInterval = 5.0; // Night: Every 5s
                maxEnemies = 12 + this.level;
            }
            
            if (this.spawnTimer > spawnInterval) {
                this.spawnTimer = 0;
                if (!this.isGameOver && this.enemies.length < maxEnemies) {
                    this.spawnEnemy();
                }
            }
        }

        if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;

        // Player Input
        if (this.input.keys.attack) {
            if (this.player.attack()) {
                // Check hits
                const attackRange = 6.0;
                const attackAngle = Math.PI; // 180 degrees cone
                
                // Player forward vector
                const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.mesh.quaternion);
                
                this.enemies.forEach(enemy => {
                    // Use 2D distance for hit detection to ignore height differences
                    const dx = enemy.mesh.position.x - this.player.mesh.position.x;
                    const dz = enemy.mesh.position.z - this.player.mesh.position.z;
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    
                    if (dist < attackRange) {
                        // Calculate angle in 2D
                        const toEnemyDir = new THREE.Vector3(dx, 0, dz).normalize();
                        const angle = forward.angleTo(toEnemyDir);
                        
                        // Allow hit if within angle OR very close (within 2.0 units)
                        if (angle < attackAngle / 2 || dist < 2.0) {
                            enemy.takeDamage(this.player.damage);
                            // Apply Knockback
                            const knockbackDir = toEnemyDir.clone();
                            enemy.applyKnockback(knockbackDir.multiplyScalar(15)); // Force of 15
                            
                            // Particles
                            this.particleSystem.emit(enemy.mesh.position, 'spark', 5);
                            this.audioManager.playHit();
                            
                            if (enemy.health <= 0) {
                                this.particleSystem.emit(enemy.mesh.position, 'poof', 10);
                            }
                        }
                    }
                });
            }
        }

        // Update player position for touch controls
        this.input.setPlayerPosition(this.player.mesh.position);
        
        const move = this.input.getMovementVector();
        // Update Entities
        this.player.update(deltaTime, move, this.world.walls);
        
        // Update World (e.g. Map animations)
        this.world.update(deltaTime);

        // Enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player.mesh.position, this.world.currentMap.obstacles);
            
            // Despawn if too far (recycle slots)
            if (enemy.mesh.position.distanceTo(this.player.mesh.position) > 80) {
                enemy.die();
            }
            
            // Collision with player (2D distance)
            if (!enemy.isDead) {
                const dx = enemy.mesh.position.x - this.player.mesh.position.x;
                const dz = enemy.mesh.position.z - this.player.mesh.position.z;
                // Increased collision radius from 1.5 (2.25 sq) to 2.0 (4.0 sq)
                if (dx * dx + dz * dz < 4.0) { 
                    this.takeDamage(enemy.damage || 1);
                }
            }
        });
        
        // Cleanup dead enemies
        this.enemies = this.enemies.filter(e => !e.isDead);

        // Breakables
        for (let i = this.world.breakables.length - 1; i >= 0; i--) {
            const obj = this.world.breakables[i];
            if (this.player.isAttacking && !obj.isBroken) {
                const dist = obj.mesh.position.distanceTo(this.player.mesh.position);
                // In front check
                const dirToObj = new THREE.Vector3().subVectors(obj.mesh.position, this.player.mesh.position).normalize();
                const playerDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.mesh.quaternion);
                const angle = dirToObj.dot(playerDir);

                if (dist < 2.5 && angle > 0.5) {
                    const drop = obj.hit();
                    this.audioManager.playBreak();
                    if (drop) {
                        this.items.push(drop);
                    }
                }
            }
            if (obj.isBroken) {
                this.world.breakables.splice(i, 1);
                // Also remove from obstacles if we added it there?
                // World.js added it to obstacles. We should probably remove it from there too to clear collision.
                // This is a bit tricky since obstacles is a simple array.
                // Let's just leave collision for now or filter it out.
                // Ideally World should handle removal.
                const obsIndex = this.world.obstacles.findIndex(o => o.mesh === obj.mesh);
                if (obsIndex !== -1) this.world.obstacles.splice(obsIndex, 1);
            }
        }

        // Items
        this.items.forEach(item => {
            item.update(deltaTime);
            if (item.checkCollision(this.player.mesh)) {
                item.collect();
                this.collected++;
                this.updateUI();
                this.particleSystem.emit(item.mesh.position, 'spark', 5);
                this.audioManager.playCollect();
            }
        });
        
        // Cleanup collected items
        this.items = this.items.filter(i => i.active);

        // Extraction
        // Extraction
        const distToExtraction = this.player.mesh.position.distanceTo(this.world.extractionZone.position);
        if (distToExtraction < 3) {
            if (this.collected >= this.quota) {
                this.nextLevel();
            }
        }
    }
    
    nextLevel() {
        if (this.isShopOpen) return;
        this.isShopOpen = true;

        // Convert collected items to gold
        this.gold += this.collected;
        this.collected = 0; // Reset collected so we don't double count if something weird happens
        
        // Show Shop
        this.uiSuccess.classList.add('hidden');
        this.uiShop.classList.remove('hidden');
        if (this.uiMobileControls) this.uiMobileControls.classList.add('hidden');
        this.updateShopUI();
        
        // Hide HUD
        document.getElementById('ui-layer').style.pointerEvents = 'auto';
    }

    updateShopUI() {
        this.uiShopGold.innerText = `Gold: ${this.gold}`;
        
        // Update Stats Display
        this.uiStatHealth.innerText = `${Math.ceil(this.health)}/${this.maxHealth}`;
        this.uiStatDamage.innerText = this.playerDamage;
        this.uiStatSpeed.innerText = this.playerSpeed;

        // Update Button States (Affordability)
        this.btnHeal.disabled = this.gold < 5 || this.health >= this.maxHealth;
        this.btnDamage.disabled = this.gold < 10;
        this.btnSpeed.disabled = this.gold < 8;
        
        // Optional: Change text if max health
        if (this.health >= this.maxHealth) {
            this.btnHeal.querySelector('.cost').innerText = "Full HP";
        } else {
            this.btnHeal.querySelector('.cost').innerText = "5 Gold";
        }
        
        // Update button states (visual feedback if affordable)
        this.btnHeal.style.opacity = this.gold >= 5 ? '1' : '0.5';
        this.btnDamage.style.opacity = this.gold >= 10 ? '1' : '0.5';
        this.btnSpeed.style.opacity = this.gold >= 8 ? '1' : '0.5';
    }

    buyHeal() {
        if (this.gold >= 5) {
            this.gold -= 5;
            this.health = Math.min(this.health + 5, 10);
            this.updateUI();
            this.updateShopUI();
            this.audioManager.playCollect(); // Reuse sound
        }
    }

    buyDamage() {
        if (this.gold >= 10) {
            this.gold -= 10;
            this.playerDamage += 1;
            if (this.player) this.player.damage = this.playerDamage;
            this.updateShopUI();
            this.audioManager.playCollect();
        }
    }

    buySpeed() {
        if (this.gold >= 8) {
            this.gold -= 8;
            this.playerSpeed *= 1.1; // +10%
            if (this.player) this.player.speed = this.playerSpeed;
            this.updateShopUI();
            this.audioManager.playCollect();
        }
    }

    startNextLevel() {
        this.uiShop.classList.add('hidden');
        document.getElementById('ui-layer').style.pointerEvents = 'none';
        
        this.level++;
        this.quota = Math.floor(this.quota * 1.5);
        
        // Save State (including stats)
        localStorage.setItem('rogue_level', this.level);
        localStorage.setItem('rogue_quota', this.quota);
        
        // Soft Reset
        this.isShopOpen = false;
        this.restart(true);
    }

    takeDamage(amount) {
        if (this.damageCooldown > 0) return;
        
        this.health -= amount;
        this.damageCooldown = 1.0; // 1 second invulnerability
        
        // Visual Feedback (Red Flash)
        const originalColor = this.uiFog.style.background;
        this.uiFog.style.background = 'radial-gradient(circle at center, rgba(255,0,0,0.5) 0%, var(--color-fog) 70%)';
        setTimeout(() => {
            this.uiFog.style.background = ''; // Reset to CSS default
        }, 200);
        
        this.audioManager.playDamage();

        if (this.health <= 0) {
            this.health = 0;
            this.gameOver();
        }
        this.updateUI();
    }

    updateUI() {
        this.collectedDisplay.innerText = this.collected;
        this.quotaDisplay.innerText = this.quota;
        this.uiLevel.innerText = this.level;
        // Update health bar width
        const pct = Math.max(0, (this.health / this.maxHealth) * 100);
        this.uiHealthBar.style.width = `${pct}%`;
    }

    gameOver() {
        this.isGameOver = true;
        this.uiGameOver.classList.remove('hidden');
        this.uiHud.classList.add('hidden');
        if (this.uiMobileControls) this.uiMobileControls.classList.add('hidden');
    }

    win() {
        this.isGameOver = true;
        this.uiSuccess.classList.remove('hidden');
        if (this.uiMobileControls) this.uiMobileControls.classList.add('hidden');
    }

    updateDayNightCycle() {
        const t = this.timeOfDay;
        const renderer = this.renderer;
        const scene = renderer.scene;
        
        // Colors
        const dayColor = new THREE.Color(0x87CEEB); // Sky Blue
        const sunsetColor = new THREE.Color(0x6A5ACD); // SlateBlue (Twilight)
        const nightColor = new THREE.Color(0x050510); // Very Dark Blue
        
        let skyColor = new THREE.Color();
        let ambientInt = 0.6;
        let dirInt = 1.2;
        let lanternInt = 0;
        
        // Fog Settings
        const dayFogNear = 30;
        const dayFogFar = 90;
        const nightFogNear = 20; // Pushed back so player isn't fully fogged
        const nightFogFar = 60;  // Extended gradient
        
        let fogNear = dayFogNear;
        let fogFar = dayFogFar;

        if (t < 0.4) {
            // Day
            skyColor.copy(dayColor);
        } else if (t < 0.5) {
            // Sunset Transition (0.4 - 0.5)
            const p = (t - 0.4) * 10; // 0 to 1
            skyColor.lerpColors(dayColor, sunsetColor, p);
            ambientInt = THREE.MathUtils.lerp(0.6, 0.4, p);
            dirInt = THREE.MathUtils.lerp(1.2, 0.8, p);
            
            // Fog starts closing in
            fogNear = THREE.MathUtils.lerp(dayFogNear, dayFogNear * 0.8, p);
            fogFar = THREE.MathUtils.lerp(dayFogFar, dayFogFar * 0.8, p);
        } else if (t < 0.6) {
            // Twilight (0.5 - 0.6)
            const p = (t - 0.5) * 10;
            skyColor.lerpColors(sunsetColor, nightColor, p);
            ambientInt = THREE.MathUtils.lerp(0.4, 0.1, p);
            dirInt = THREE.MathUtils.lerp(0.8, 0.0, p);
            lanternInt = THREE.MathUtils.lerp(0, 150, p);
            
            // Fog closes in tightly
            fogNear = THREE.MathUtils.lerp(dayFogNear * 0.8, nightFogNear, p);
            fogFar = THREE.MathUtils.lerp(dayFogFar * 0.8, nightFogFar, p);
        } else if (t < 0.9) {
            // Night
            skyColor.copy(nightColor);
            ambientInt = 0.1;
            dirInt = 0;
            lanternInt = 150;
            
            fogNear = nightFogNear;
            fogFar = nightFogFar;
        } else {
            // Sunrise (0.9 - 1.0)
            const p = (t - 0.9) * 10;
            skyColor.lerpColors(nightColor, dayColor, p);
            ambientInt = THREE.MathUtils.lerp(0.1, 0.6, p);
            dirInt = THREE.MathUtils.lerp(0.0, 1.2, p);
            lanternInt = THREE.MathUtils.lerp(150, 0, p);
            
            fogNear = THREE.MathUtils.lerp(nightFogNear, dayFogNear, p);
            fogFar = THREE.MathUtils.lerp(nightFogFar, dayFogFar, p);
        }

        // Apply Visuals
        if (scene.background instanceof THREE.Color) {
            scene.background.copy(skyColor);
        } else {
            scene.background = skyColor;
        }
        
        if (scene.fog && scene.fog.color) {
            scene.fog.color.copy(skyColor);
            scene.fog.near = fogNear;
            scene.fog.far = fogFar;
        }
        
        // Update UI Fog Overlay to match Sky Color
        const r = Math.floor(skyColor.r * 255);
        const g = Math.floor(skyColor.g * 255);
        const b = Math.floor(skyColor.b * 255);
        this.uiFog.style.background = `radial-gradient(circle at center, transparent 45%, rgb(${r},${g},${b}) 85%)`;

        renderer.ambientLight.intensity = ambientInt;
        renderer.dirLight.intensity = dirInt;
        renderer.dirLight.color.copy(skyColor); // Tint sunlight
        
        // Player Lantern
        if (this.player && this.player.lanternLight) {
            this.player.lanternLight.intensity = lanternInt;
        }
    }
    
    togglePause() {
        // Only allow pause during active gameplay (not in menu, shop, game over, or success)
        if (!this.player || this.isGameOver || this.isShopOpen || !this.uiStart.classList.contains('hidden')) {
            return;
        }
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.uiPause.classList.remove('hidden');
        } else {
            this.uiPause.classList.add('hidden');
        }
    }
    
    resumeGame() {
        this.isPaused = false;
        this.uiPause.classList.add('hidden');
    }
    
    backToMenu() {
        // Reset game state
        this.isPaused = false;
        this.uiPause.classList.add('hidden');
        this.uiHud.classList.add('hidden');
        this.uiFog.classList.add('hidden');
        document.getElementById('minimap').classList.add('hidden');
        
        // Clear world
        this.world.clear();
        this.particleSystem.clear();
        
        if (this.player) {
            this.player.dispose();
            this.renderer.scene.remove(this.player.mesh);
            this.player = null;
        }
        
        this.enemies.forEach(e => {
            e.dispose();
            this.renderer.scene.remove(e.mesh);
        });
        this.enemies = [];
        
        this.items.forEach(i => {
            i.dispose();
            this.renderer.scene.remove(i.mesh);
        });
        this.items = [];
        
        // Show start screen
        this.uiStart.classList.remove('hidden');
        
        // Reset game state
        this.isGameOver = false;
        this.collected = 0;
        this.timeOfDay = 0;
    }
}
