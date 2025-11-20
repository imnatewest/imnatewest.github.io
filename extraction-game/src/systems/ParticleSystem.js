/**
 * Particle System Class
 * ============================================================================
 * High-performance particle effect system using InstancedMesh and object
 * pooling. Handles visual effects like sparks, dust, and explosions.
 * Uses billboarding to keep particles always facing the camera.
 * ============================================================================
 */

import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.maxParticles = 2000;      // Pre-allocated pool size
        this.particles = [];          // Particle data pool
        this.activeCount = 0;         // Currently active particles
        
        // ====================================================================
        // Instanced Mesh Setup (Shared Geometry & Material)
        // ====================================================================
        // All particles share ONE mesh instance for maximum performance
        // Each particle is rendered as an "instance" of this mesh
        
        const geo = new THREE.PlaneGeometry(1, 1);  // Simple quad geometry
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false,      // Prevents transparent sorting issues
            vertexColors: true      // Required for per-instance color variation
        });

        // Create instanced mesh with maximum capacity
        this.mesh = new THREE.InstancedMesh(geo, mat, this.maxParticles);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Optimize for frequent updates
        this.mesh.frustumCulled = false;  // Don't cull - bounds not tracked for particles
        
        // Initialize per-instance color attribute
        // Each particle can have its own color
        this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
            new Float32Array(this.maxParticles * 3),  // RGB for each instance
            3  // 3 components per color (R, G, B)
        );
        this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
        
        this.scene.add(this.mesh);

        // Temporary object for matrix calculations
        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        
        // ====================================================================
        // Initialize Particle Pool (Object Pooling Pattern)
        // ====================================================================
        // Pre-create all particle data objects to avoid garbage collection
        // during gameplay. Particles are recycled when they expire.
        
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                active: false,                          // Is this particle currently visible?
                life: 0,                                // Remaining lifetime (1.0 = full, 0.0 = dead)
                decay: 0,                               // Life decay rate per second
                velocity: new THREE.Vector3(),          // Movement direction and speed
                position: new THREE.Vector3(),          // World position
                scale: new THREE.Vector3(1, 1, 1),      // Size scaling
                color: new THREE.Color(),               // Particle color
                type: 'none'                            // Particle effect type
            });
            
            // Hide particle off-screen initially
            this.dummy.position.set(0, -1000, 0);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, new THREE.Color(0xffffff));
        }
        
        // Apply initial state to GPU
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
    }

    /**
     * Emit particles from a position
     * Finds inactive particles in the pool and activates them
     * @param {THREE.Vector3} position - World position to spawn particles
     * @param {string} type - Particle type ('spark', 'poof', 'dust')
     * @param {number} count - Number of particles to emit
     */
    emit(position, type, count = 1) {
        for (let i = 0; i < count; i++) {
            // Find first inactive particle from pool
            const p = this.particles.find(p => !p.active);
            if (!p) return; // Pool exhausted, can't spawn more

            // Activate particle
            p.active = true;
            p.life = 1.0;  // Full lifetime
            p.position.copy(position);
            p.type = type;

            // Configure particle based on type
            // Different types have different physics and visual properties
            
            if (type === 'spark') {
                // Fast, bright yellow sparks (wood breaking, attacks)
                p.scale.setScalar(0.1);
                p.color.setHex(0xffff00);  // Yellow
                p.velocity.set(
                    (Math.random() - 0.5) * 5,   // Random X velocity
                    (Math.random() - 0.5) * 5,   // Random Y velocity
                    (Math.random() - 0.5) * 5    // Random Z velocity
                );
                p.decay = 3.0 + Math.random() * 2;  // Fast decay (0.2-0.33s lifespan)
                
            } else if (type === 'poof') {
                // Expanding smoke cloud (enemy death, large impacts)
                p.scale.setScalar(0.2);
                p.color.setHex(0xdddddd);  // Light gray
                p.velocity.set(
                    (Math.random() - 0.5) * 2,   // Moderate spread
                    Math.random() * 2,           // Upward bias
                    (Math.random() - 0.5) * 2
                );
                p.decay = 2.0;  // Medium decay (0.5s lifespan)
                
            } else if (type === 'dust') {
                // Small ground dust (footsteps, minor impacts)
                p.scale.setScalar(0.1);
                p.color.setHex(0x8B4513);  // Brown
                p.velocity.set(
                    (Math.random() - 0.5) * 0.5,  // Subtle movement
                    Math.random() * 0.5,          // Slight rise
                    (Math.random() - 0.5) * 0.5
                );
                p.decay = 4.0;  // Slow decay (0.25s lifespan)
            }
        }
    }

    /**
     * Update all active particles
     * Handles physics, lifetime, and visual updates
     * @param {number} deltaTime - Time since last frame (in seconds)
     * @param {THREE.Camera} camera - Camera for billboard effect
     */
    update(deltaTime, camera) {
        let needsUpdate = false;  // Track if GPU data needs updating

        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.particles[i];
            
            // Skip inactive particles
            if (!p.active) continue;

            // Decrease lifetime
            p.life -= p.decay * deltaTime;

            // Check if particle has expired
            if (p.life <= 0) {
                p.active = false;
                // Move particle off-screen
                this.dummy.position.set(0, -1000, 0);
                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(i, this.dummy.matrix);
                needsUpdate = true;
                continue;
            }

            // ================================================================
            // Physics Simulation
            // ================================================================
            
            // Apply velocity to position
            p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
            
            // Apply gravity (except for dust which floats)
            if (p.type !== 'dust') {
                 p.velocity.y -= 5 * deltaTime;  // Downward acceleration
            }

            // ================================================================
            // Visual Effects
            // ================================================================
            
            // Poof particles expand over time
            if (p.type === 'poof') {
                p.scale.addScalar(deltaTime * 2);  // Grow bigger
            }

            // ================================================================
            // Update Instance Transform
            // ================================================================
            
            // Set position
            this.dummy.position.copy(p.position);
            
            // Scale fades with lifetime (particles get smaller as they die)
            this.dummy.scale.copy(p.scale).multiplyScalar(p.life);
            
            // Billboard effect: Always face the camera
            // Makes 2D planes look 3D from any angle
            this.dummy.lookAt(camera.position);
            
            // Calculate final transformation matrix
            this.dummy.updateMatrix();
            
            // Upload to GPU
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, p.color);
            
            needsUpdate = true;
        }

        // Mark GPU buffers for update if any particle changed
        if (needsUpdate) {
            this.mesh.instanceMatrix.needsUpdate = true;
            if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
        }
    }

    /**
     * Clear all active particles
     * Useful for scene transitions or cleanup
     */
    clear() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles[i].active = false;
            // Hide all particles off-screen
            this.dummy.position.set(0, -1000, 0);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }
}

