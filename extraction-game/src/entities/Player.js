import * as THREE from 'three';

export class Player {
    constructor(scene, particleSystem, audioManager) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;
        this.speed = 10;
        this.damage = 1;
        
        this.mesh = new THREE.Group();
        
        // Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // Skin
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Green Shirt
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown Pants
        const backpackMat = new THREE.MeshStandardMaterial({ color: 0xcd853f }); // Leather Bag
        
        // Torso
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), shirtMat);
        this.torso.position.y = 1.5;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);
        
        // Head
        this.head = new THREE.Group();
        this.head.position.y = 0.6;
        this.torso.add(this.head);
        
        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
        headMesh.castShadow = true;
        this.head.add(headMesh);
        
        // Hat
        const hatBrim = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), backpackMat);
        hatBrim.position.y = 0.3;
        hatBrim.castShadow = true;
        this.head.add(hatBrim);
        
        const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), backpackMat);
        hatTop.position.y = 0.5;
        hatTop.castShadow = true;
        this.head.add(hatTop);
        
        // Backpack
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.3), backpackMat);
        backpack.position.set(0, 0, -0.4);
        backpack.castShadow = true;
        this.torso.add(backpack);
        
        // Limbs
        this.armL = this.createLimb(0.25, 0.8, 0.25, shirtMat, new THREE.Vector3(0.55, 0.3, 0));
        this.armR = this.createLimb(0.25, 0.8, 0.25, shirtMat, new THREE.Vector3(-0.55, 0.3, 0));
        this.legL = this.createLimb(0.3, 0.9, 0.3, pantsMat, new THREE.Vector3(0.25, -0.5, 0));
        this.legR = this.createLimb(0.3, 0.9, 0.3, pantsMat, new THREE.Vector3(-0.25, -0.5, 0));
        
        this.torso.add(this.armL);
        this.torso.add(this.armR);
        this.torso.add(this.legL);
        this.torso.add(this.legR);

        // Weapon (Sword)
        const swordGroup = new THREE.Group();
        const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), new THREE.MeshStandardMaterial({ color: 0x444444 }));
        hilt.position.y = -0.2;
        hilt.castShadow = true;
        swordGroup.add(hilt);
        
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.05), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 }));
        blade.position.y = 0.35;
        blade.castShadow = true;
        swordGroup.add(blade);
        
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.1), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        guard.position.y = -0.05;
        guard.castShadow = true;
        swordGroup.add(guard);

        swordGroup.position.set(0, -0.4, 0.2);
        swordGroup.rotation.x = Math.PI / 2; // Held forward
        this.armR.add(swordGroup);
        this.sword = swordGroup;

        // Lantern Light (Spotlight for radius effect)
        this.lanternLight = new THREE.SpotLight(0xffaa00, 0, 30, Math.PI / 4, 0.5, 1);
        this.lanternLight.position.set(0, 10, 0); // High above
        this.lanternLight.target = this.mesh; // Point at player
        this.lanternLight.castShadow = true;
        this.mesh.add(this.lanternLight);

        this.scene.add(this.mesh);
        
        this.inventory = 0;
        this.walkTime = 0;
        
        this.isAttacking = false;
        this.attackTime = 0;
        this.attackDuration = 0.3;
        this.attackCooldown = 0;
    }
    
    createLimb(w, h, d, mat, pos) {
        const group = new THREE.Group();
        group.position.copy(pos);
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.y = -h / 2; // Pivot at top
        mesh.castShadow = true;
        group.add(mesh);
        return group;
    }

    attack() {
        if (this.attackCooldown <= 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTime = 0;
            this.attackCooldown = 0.5;
            return true; // Triggered attack
        }
        return false;
    }

    update(deltaTime, inputVector, walls) {
        // Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;

        // Attack Animation
        if (this.isAttacking) {
            this.attackTime += deltaTime;
            const progress = Math.min(this.attackTime / this.attackDuration, 1);
            
            // Swing arm
            this.armR.rotation.x = -Math.PI / 2 + Math.sin(progress * Math.PI) * 1.5;
            
            if (progress >= 1) {
                this.isAttacking = false;
                this.armR.rotation.x = 0;
            }
        } else {
             this.armR.rotation.x = THREE.MathUtils.lerp(this.armR.rotation.x, 0, deltaTime * 10);
        }

        const isMoving = inputVector.x !== 0 || inputVector.z !== 0;
        
        if (isMoving) {
            // Rotate input to match camera (45 degrees)
            const inputRotation = -Math.PI / 4;
            const s = Math.sin(inputRotation);
            const c = Math.cos(inputRotation);
            
            const dx = inputVector.x * c - inputVector.z * s;
            const dz = inputVector.x * s + inputVector.z * c;

            const move = new THREE.Vector3(dx, 0, dz);

            // Movement
            if (move.length() > 0) {
                move.normalize();
                
                // Rotate towards movement
                const angle = Math.atan2(move.x, move.z);
                const targetRotation = new THREE.Quaternion();
                targetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                this.mesh.quaternion.slerp(targetRotation, 0.2);
                
                // Move
                const velocity = move.multiplyScalar(this.speed * deltaTime);
                const nextPos = this.mesh.position.clone().add(velocity);
                
                // Wall Collision
                if (this.checkWallCollision(nextPos, walls)) {
                    // Slide
                    if (!this.checkWallCollision(new THREE.Vector3(nextPos.x, 0, this.mesh.position.z), walls)) {
                        this.mesh.position.x = nextPos.x;
                    } else if (!this.checkWallCollision(new THREE.Vector3(this.mesh.position.x, 0, nextPos.z), walls)) {
                        this.mesh.position.z = nextPos.z;
                    }
                } else {
                    this.mesh.position.copy(nextPos);
                }

                // Clamp to map boundary (Radius 69)
                if (this.mesh.position.length() > 69) {
                    this.mesh.position.setLength(69);
                }

                // Walk Animation
                if (!this.isAttacking) {
                    const prevWalkTime = this.walkTime;
                    this.walkTime += deltaTime * 10;
                    
                    // Footstep Sound
                    if (Math.sin(prevWalkTime) < 0 && Math.sin(this.walkTime) >= 0) {
                        if (this.audioManager) this.audioManager.playStep();
                    }
                    if (Math.sin(prevWalkTime + Math.PI) < 0 && Math.sin(this.walkTime + Math.PI) >= 0) {
                        if (this.audioManager) this.audioManager.playStep();
                    }

                    this.legL.rotation.x = Math.sin(this.walkTime) * 0.5;
                    this.legR.rotation.x = Math.sin(this.walkTime + Math.PI) * 0.5;
                    this.armL.rotation.x = Math.sin(this.walkTime + Math.PI) * 0.5;
                    this.armR.rotation.x = Math.sin(this.walkTime) * 0.5;
                }

                // Dust Particles
                if (Math.random() > 0.8) {
                    const offset = new THREE.Vector3((Math.random()-0.5)*0.5, 0, (Math.random()-0.5)*0.5);
                    this.particleSystem.emit(this.mesh.position.clone().add(offset), 'dust', 1);
                }
            }
        } else {
            // Idle
            this.legL.rotation.x = THREE.MathUtils.lerp(this.legL.rotation.x, 0, deltaTime * 10);
            this.legR.rotation.x = THREE.MathUtils.lerp(this.legR.rotation.x, 0, deltaTime * 10);
            this.armL.rotation.x = THREE.MathUtils.lerp(this.armL.rotation.x, 0, deltaTime * 10);
            if (!this.isAttacking) {
                this.armR.rotation.x = THREE.MathUtils.lerp(this.armR.rotation.x, 0, deltaTime * 10);
            }
        }
    }
    
    checkWallCollision(pos, walls) {
        const playerBox = new THREE.Box3();
        const playerSize = new THREE.Vector3(0.8, 2, 0.8);
        playerBox.setFromCenterAndSize(new THREE.Vector3(pos.x, 1, pos.z), playerSize);
        
        for (const wall of walls) {
            if (playerBox.intersectsBox(wall.box)) return true;
        }
        return false;
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
