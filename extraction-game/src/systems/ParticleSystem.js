import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        
        // Shared Geometries & Materials
        this.geo = new THREE.PlaneGeometry(1, 1);
        this.mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
    }

    emit(position, type, count = 1) {
        for (let i = 0; i < count; i++) {
            const particle = {
                mesh: new THREE.Mesh(this.geo, this.mat.clone()),
                velocity: new THREE.Vector3(),
                life: 1.0,
                decay: 1.0 + Math.random(),
                type: type
            };

            particle.mesh.position.copy(position);
            particle.mesh.lookAt(this.scene.position); // Billboard effect (approx)

            // Initialize based on type
            if (type === 'spark') {
                particle.mesh.scale.set(0.1, 0.1, 0.1);
                particle.mesh.material.color.setHex(0xffff00);
                particle.velocity.set(
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5
                );
                particle.decay = 3.0 + Math.random() * 2;
            } else if (type === 'poof') {
                particle.mesh.scale.set(0.2, 0.2, 0.2);
                particle.mesh.material.color.setHex(0xdddddd);
                particle.velocity.set(
                    (Math.random() - 0.5) * 2,
                    Math.random() * 2,
                    (Math.random() - 0.5) * 2
                );
                particle.decay = 2.0;
            } else if (type === 'dust') {
                particle.mesh.scale.set(0.1, 0.1, 0.1);
                particle.mesh.material.color.setHex(0x8B4513); // Brown
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                particle.decay = 4.0;
            }

            this.scene.add(particle.mesh);
            this.particles.push(particle);
        }
    }

    update(deltaTime, camera) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.life -= p.decay * deltaTime;
            
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                if (p.mesh.material) p.mesh.material.dispose(); // Dispose cloned material
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            p.mesh.position.add(p.velocity.clone().multiplyScalar(deltaTime));
            p.velocity.y -= 5 * deltaTime; // Gravity (except for some types maybe?)
            
            // Visuals
            p.mesh.material.opacity = p.life;
            p.mesh.lookAt(camera.position); // Billboard
            
            if (p.type === 'poof') {
                p.mesh.scale.multiplyScalar(1.0 + deltaTime * 2); // Expand
            }
        }
    }
    clear() {
        for (const p of this.particles) {
            this.scene.remove(p.mesh);
            if (p.mesh.material) p.mesh.material.dispose();
        }
        this.particles = [];
    }
}
