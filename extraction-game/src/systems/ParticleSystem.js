import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.maxParticles = 2000;
        this.particles = [];
        this.activeCount = 0;
        
        // Shared Geometry & Material
        const geo = new THREE.PlaneGeometry(1, 1);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false, // Important for transparent particles
            vertexColors: true // REQUIRED for InstancedMesh color variation
        });

        this.mesh = new THREE.InstancedMesh(geo, mat, this.maxParticles);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.frustumCulled = false; // Prevent culling issues since bounds aren't updated
        
        // Initialize instanceColor attribute
        this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.maxParticles * 3), 3);
        this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
        
        this.scene.add(this.mesh);

        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        
        // Initialize pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                active: false,
                life: 0,
                decay: 0,
                velocity: new THREE.Vector3(),
                position: new THREE.Vector3(),
                scale: new THREE.Vector3(1, 1, 1),
                color: new THREE.Color(),
                type: 'none'
            });
            // Hide initially
            this.dummy.position.set(0, -1000, 0);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, new THREE.Color(0xffffff));
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
    }

    emit(position, type, count = 1) {
        for (let i = 0; i < count; i++) {
            // Find first inactive particle
            const p = this.particles.find(p => !p.active);
            if (!p) return; // Pool full

            p.active = true;
            p.life = 1.0;
            p.position.copy(position);
            p.type = type;

            // Initialize based on type
            if (type === 'spark') {
                p.scale.setScalar(0.1);
                p.color.setHex(0xffff00);
                p.velocity.set(
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5
                );
                p.decay = 3.0 + Math.random() * 2;
            } else if (type === 'poof') {
                p.scale.setScalar(0.2);
                p.color.setHex(0xdddddd);
                p.velocity.set(
                    (Math.random() - 0.5) * 2,
                    Math.random() * 2,
                    (Math.random() - 0.5) * 2
                );
                p.decay = 2.0;
            } else if (type === 'dust') {
                p.scale.setScalar(0.1);
                p.color.setHex(0x8B4513); // Brown
                p.velocity.set(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                p.decay = 4.0;
            }
        }
    }

    update(deltaTime, camera) {
        let needsUpdate = false;

        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.particles[i];
            
            if (!p.active) continue;

            p.life -= p.decay * deltaTime;

            if (p.life <= 0) {
                p.active = false;
                // Hide
                this.dummy.position.set(0, -1000, 0);
                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(i, this.dummy.matrix);
                needsUpdate = true;
                continue;
            }

            // Physics
            p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
            if (p.type !== 'dust') {
                 p.velocity.y -= 5 * deltaTime; // Gravity
            }

            // Visuals
            if (p.type === 'poof') {
                p.scale.addScalar(deltaTime * 2); // Expand
            }

            // Update Instance
            this.dummy.position.copy(p.position);
            
            // Scale logic: Base scale * Life (fade out effect)
            this.dummy.scale.copy(p.scale).multiplyScalar(p.life);
            
            this.dummy.lookAt(camera.position); // Billboard
            this.dummy.updateMatrix();
            
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, p.color);
            
            needsUpdate = true;
        }

        if (needsUpdate) {
            this.mesh.instanceMatrix.needsUpdate = true;
            if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
        }
    }

    clear() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles[i].active = false;
            this.dummy.position.set(0, -1000, 0);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }
}
