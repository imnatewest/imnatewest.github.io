import * as THREE from 'three';

export class Enemy {
    constructor(scene, position, type = 'slime') {
        this.scene = scene;
        this.type = type;
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.mesh.position.y = 0.5;
        
        this.knockback = new THREE.Vector3();
        this.isDead = false;
        this.time = Math.random() * 100;

        // Stats & Model based on Type
        switch (type) {
            case 'spider':
                this.speed = 5.5;
                this.health = 2;
                this.damage = 1;
                this.createSpiderModel();
                break;
            case 'golem':
                this.speed = 1.5;
                this.health = 8;
                this.damage = 2;
                this.createGolemModel();
                break;
            case 'car':
                this.speed = 6.0;
                this.health = 5;
                this.damage = 3;
                this.createCarModel();
                break;
            case 'slime':
            default:
                this.speed = 3;
                this.health = 3;
                this.damage = 1;
                this.createSlimeModel();
                break;
        }

        this.scene.add(this.mesh);
    }

    createSlimeModel() {
        // Slime Body
        const bodyGeo = new THREE.BoxGeometry(1, 0.8, 1);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.8,
            roughness: 0.2
        });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Eyes
        this.addEyes(0.5, 0.2);
    }

    createSpiderModel() {
        // Body
        const bodyGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Legs
        for (let i = 0; i < 8; i++) {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.8),
                bodyMat
            );
            leg.rotation.z = Math.PI / 2;
            leg.rotation.y = (i / 8) * Math.PI * 2;
            leg.position.y = -0.1;
            leg.castShadow = true;
            this.mesh.add(leg);
        }
        
        // Eyes
        this.addEyes(0.3, 0.1);
    }

    createGolemModel() {
        // Torso
        const bodyGeo = new THREE.BoxGeometry(1.2, 1.5, 0.8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // SaddleBrown
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 0.75;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x696969 }) // DimGray
        );
        head.position.y = 1.8;
        head.castShadow = true;
        this.mesh.add(head);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        const armL = new THREE.Mesh(armGeo, bodyMat);
        armL.position.set(0.9, 1.0, 0);
        armL.castShadow = true;
        this.mesh.add(armL);

        const armR = new THREE.Mesh(armGeo, bodyMat);
        armR.position.set(-0.9, 1.0, 0);
        armR.castShadow = true;
        this.mesh.add(armR);
        
        // Glowing Eyes (on head)
        const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 }); // Green glow
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.15, 1.8, 0.31);
        this.mesh.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(-0.15, 1.8, 0.31);
        this.mesh.add(eyeR);
    }

    createCarModel() {
        // Chassis
        const chassisGeo = new THREE.BoxGeometry(1.2, 0.5, 2.0);
        const chassisMat = new THREE.MeshStandardMaterial({ color: 0xCC0000 }); // Red Car
        this.body = new THREE.Mesh(chassisGeo, chassisMat);
        this.body.position.y = 0.5;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Cabin
        const cabinGeo = new THREE.BoxGeometry(1.0, 0.4, 1.0);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Dark windows
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.y = 0.5;
        cabin.position.z = -0.2;
        this.body.add(cabin);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        
        const positions = [
            [-0.6, 0, 0.6], [0.6, 0, 0.6], // Front
            [-0.6, 0, -0.6], [0.6, 0, -0.6] // Back
        ];

        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            this.mesh.add(wheel);
        });

        // Headlights
        const lightGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        
        const l1 = new THREE.Mesh(lightGeo, lightMat);
        l1.position.set(0.4, 0, 1.0);
        this.body.add(l1);

        const l2 = new THREE.Mesh(lightGeo, lightMat);
        l2.position.set(-0.4, 0, 1.0);
        this.body.add(l2);
    }

    addEyes(zOffset, yOffset) {
        const eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.2, yOffset, zOffset);
        this.mesh.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(-0.2, yOffset, zOffset);
        this.mesh.add(eyeR);
    }

    update(deltaTime, playerPosition) {
        if (this.isDead) return;

        // Apply Knockback
        if (this.knockback.length() > 0.1) {
            this.mesh.position.add(this.knockback.clone().multiplyScalar(deltaTime));
            this.knockback.multiplyScalar(0.9); // Friction
        } else {
            // Normal Movement
            const direction = new THREE.Vector3().subVectors(playerPosition, this.mesh.position);
            direction.y = 0; // Keep horizontal movement
            direction.normalize();

            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
        }
        
        // Animation based on type
        this.time += deltaTime * 5;
        
        if (this.type === 'slime') {
            const jump = Math.abs(Math.sin(this.time));
            this.mesh.position.y = 0.5 + jump * 0.5;
            this.body.scale.y = 1 - jump * 0.3;
            this.body.scale.x = 1 + jump * 0.15;
            this.body.scale.z = 1 + jump * 0.15;
        } else if (this.type === 'spider') {
            this.mesh.position.y = 0.3 + Math.sin(this.time * 2) * 0.1;
        } else if (this.type === 'golem') {
            this.mesh.rotation.z = Math.sin(this.time * 0.5) * 0.05; // Lumbering
        } else if (this.type === 'car') {
            this.body.position.y = 0.5 + Math.sin(this.time * 20) * 0.02; // Engine vibration
        }
        
        // Rotate to face player
        this.mesh.lookAt(playerPosition.x, this.mesh.position.y, playerPosition.z);
    }

    applyKnockback(force) {
        // Golems resist knockback
        if (this.type === 'golem') {
            this.knockback.add(force.multiplyScalar(0.2));
        } else {
            this.knockback.add(force);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Visual Feedback
        const originalColor = this.body.material.color.getHex();
        this.body.material.color.setHex(0xff0000);
        setTimeout(() => {
            if (!this.isDead && this.body) this.body.material.color.setHex(originalColor);
        }, 100);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.scene.remove(this.mesh);
    }

    dispose() {
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }
}
