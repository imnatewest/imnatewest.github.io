import * as THREE from 'three';

export class Enemy {
    static resources = {
        geometries: {},
        materials: {},
        loaded: false
    };

    static loadResources() {
        if (this.resources.loaded) return;

        const r = this.resources;

        // Geometries
        r.geometries.box1 = new THREE.BoxGeometry(1, 0.8, 1);
        r.geometries.sphereSmall = new THREE.SphereGeometry(0.4, 8, 8);
        r.geometries.cylinderLeg = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
        r.geometries.boxGolemBody = new THREE.BoxGeometry(1.2, 1.5, 0.8);
        r.geometries.boxGolemHead = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        r.geometries.boxGolemArm = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        r.geometries.boxEye = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        r.geometries.boxCarChassis = new THREE.BoxGeometry(1.2, 0.5, 2.0);
        r.geometries.boxCarCabin = new THREE.BoxGeometry(1.0, 0.4, 1.0);
        r.geometries.cylinderWheel = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
        r.geometries.boxHeadlight = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        r.geometries.boxEyeSmall = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        r.geometries.droneBody = new THREE.SphereGeometry(0.5, 8, 8);
        r.geometries.droneWing = new THREE.BoxGeometry(0.8, 0.05, 0.3);

        // Materials (Base)
        r.materials.slime = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.8,
            roughness: 0.2
        });
        r.materials.spiderBody = new THREE.MeshStandardMaterial({ color: 0x222222 });
        r.materials.golemBody = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        r.materials.golemHead = new THREE.MeshStandardMaterial({ color: 0x696969 });
        r.materials.golemEye = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        r.materials.carChassis = new THREE.MeshStandardMaterial({ color: 0xCC0000 });
        r.materials.carCabin = new THREE.MeshStandardMaterial({ color: 0x333333 });
        r.materials.carWheel = new THREE.MeshStandardMaterial({ color: 0x111111 });
        r.materials.carLight = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        r.materials.carLight = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        r.materials.eyeBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });
        r.materials.droneBody = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 });
        r.materials.droneEye = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Patient Assets
        r.geometries.patientBody = new THREE.CylinderGeometry(0.3, 0.3, 1.0);
        r.geometries.patientHead = new THREE.SphereGeometry(0.25, 8, 8);
        r.geometries.patientLimb = new THREE.CylinderGeometry(0.08, 0.08, 0.8);
        
        r.materials.patientGown = new THREE.MeshStandardMaterial({ color: 0xADD8E6 }); // Light Blue
        r.materials.patientSkin = new THREE.MeshStandardMaterial({ color: 0xE0D0C0 }); // Pale Flesh

        this.resources.loaded = true;
    }

    constructor(scene, position, type = 'slime', particleSystem = null) {
        Enemy.loadResources(); // Ensure loaded
        
        this.scene = scene;
        this.particleSystem = particleSystem;
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
            case 'drone':
                this.speed = 7.0;
                this.health = 2;
                this.damage = 1;
                this.createDroneModel();
                break;
            case 'patient':
                this.speed = 4.5; // Fast but not spider fast
                this.health = 4;
                this.damage = 2;
                this.createPatientModel();
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
        const r = Enemy.resources;
        // Slime Body - Clone material for damage flash
        this.body = new THREE.Mesh(r.geometries.box1, r.materials.slime.clone());
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Eyes
        this.addEyes(0.5, 0.2);
    }

    createSpiderModel() {
        const r = Enemy.resources;
        // Body - Clone material for damage flash
        this.body = new THREE.Mesh(r.geometries.sphereSmall, r.materials.spiderBody.clone());
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Legs (Shared material ok, they don't flash usually, or we can flash body only)
        // If we want legs to flash, we should use the body material.
        // Let's use the body material for legs too so they flash together.
        for (let i = 0; i < 8; i++) {
            const leg = new THREE.Mesh(
                r.geometries.cylinderLeg,
                this.body.material // Share the cloned material
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
        const r = Enemy.resources;
        // Torso - Clone material
        this.body = new THREE.Mesh(r.geometries.boxGolemBody, r.materials.golemBody.clone());
        this.body.position.y = 0.75;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Head
        const head = new THREE.Mesh(r.geometries.boxGolemHead, r.materials.golemHead);
        head.position.y = 1.8;
        head.castShadow = true;
        this.mesh.add(head);

        // Arms - Use body material to flash together
        const armL = new THREE.Mesh(r.geometries.boxGolemArm, this.body.material);
        armL.position.set(0.9, 1.0, 0);
        armL.castShadow = true;
        this.mesh.add(armL);

        const armR = new THREE.Mesh(r.geometries.boxGolemArm, this.body.material);
        armR.position.set(-0.9, 1.0, 0);
        armR.castShadow = true;
        this.mesh.add(armR);
        
        // Glowing Eyes
        const eyeL = new THREE.Mesh(r.geometries.boxEye, r.materials.golemEye);
        eyeL.position.set(0.15, 1.8, 0.31);
        this.mesh.add(eyeL);
        const eyeR = new THREE.Mesh(r.geometries.boxEye, r.materials.golemEye);
        eyeR.position.set(-0.15, 1.8, 0.31);
        this.mesh.add(eyeR);
    }

    createCarModel() {
        const r = Enemy.resources;
        // Chassis - Clone material
        this.body = new THREE.Mesh(r.geometries.boxCarChassis, r.materials.carChassis.clone());
        this.body.position.y = 0.5;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Cabin
        const cabin = new THREE.Mesh(r.geometries.boxCarCabin, r.materials.carCabin);
        cabin.position.y = 0.5;
        cabin.position.z = -0.2;
        this.body.add(cabin);

        // Wheels
        const positions = [
            [-0.6, 0, 0.6], [0.6, 0, 0.6], // Front
            [-0.6, 0, -0.6], [0.6, 0, -0.6] // Back
        ];

        positions.forEach(pos => {
            const wheel = new THREE.Mesh(r.geometries.cylinderWheel, r.materials.carWheel);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            this.mesh.add(wheel);
        });

        // Headlights
        const l1 = new THREE.Mesh(r.geometries.boxHeadlight, r.materials.carLight);
        l1.position.set(0.4, 0, 1.0);
        this.body.add(l1);

        const l2 = new THREE.Mesh(r.geometries.boxHeadlight, r.materials.carLight);
        l2.position.set(-0.4, 0, 1.0);
        this.body.add(l2);
    }

    createDroneModel() {
        const r = Enemy.resources;
        // Body
        this.body = new THREE.Mesh(r.geometries.droneBody, r.materials.droneBody.clone());
        this.body.position.y = 1.5; // Fly high
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Eye
        const eye = new THREE.Mesh(r.geometries.boxEyeSmall, r.materials.droneEye);
        eye.position.set(0, 0, 0.4);
        eye.scale.set(0.5, 0.5, 0.5);
        this.body.add(eye);

        // Wings (4 distinct wings)
        for (let i = 0; i < 4; i++) {
            const wing = new THREE.Mesh(r.geometries.droneWing, r.materials.droneBody);
            wing.position.y = 0.2;
            wing.rotation.y = (i / 4) * Math.PI * 2;
            wing.translateZ(0.6); // Move out from center
            this.body.add(wing);
        }
    }

    createPatientModel() {
        const r = Enemy.resources;
        
        // Group for the whole character
        this.character = new THREE.Group();
        // Scale up the character (2.5x larger - Giant)
        this.character.scale.set(2.5, 2.5, 2.5);
        this.mesh.add(this.character);

        // Torso (Upper Gown) - Slightly thinner
        const torsoGeo = new THREE.BoxGeometry(0.35, 0.5, 0.2);
        this.torso = new THREE.Mesh(torsoGeo, r.materials.patientGown.clone());
        this.torso.position.y = 0.9; // Higher up due to longer legs
        this.torso.castShadow = true;
        this.character.add(this.torso);

        // Lower Gown (Skirt-like)
        const skirtGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.4, 8);
        this.skirt = new THREE.Mesh(skirtGeo, r.materials.patientGown);
        this.skirt.position.y = -0.45; // Relative to torso
        this.torso.add(this.skirt);

        // Head - Smaller relative to body for creepiness
        const head = new THREE.Mesh(r.geometries.patientHead, r.materials.patientSkin);
        head.scale.set(0.7, 0.8, 0.75);
        head.position.y = 0.4; // Relative to torso
        this.torso.add(head);
        this.head = head;

        // Legs - Longer and thinner
        this.legs = [];
        const legGeo = new THREE.BoxGeometry(0.08, 0.7, 0.08); // Longer (0.5 -> 0.7)
        
        const legL = new THREE.Mesh(legGeo, r.materials.patientSkin);
        legL.position.set(0.1, 0.35, 0); // Adjusted Y
        this.character.add(legL);
        this.legs.push(legL);

        const legR = new THREE.Mesh(legGeo, r.materials.patientSkin);
        legR.position.set(-0.1, 0.35, 0);
        this.character.add(legR);
        this.legs.push(legR);

        // Arms - Longer and thinner (slender man vibes)
        this.arms = [];
        const armGeo = new THREE.BoxGeometry(0.07, 0.7, 0.07); // Longer (0.5 -> 0.7)
        
        const armL = new THREE.Mesh(armGeo, r.materials.patientSkin);
        armL.position.set(0.25, 0.15, 0); // Relative to torso
        // Pivot at shoulder
        armL.geometry.translate(0, -0.3, 0); // Move pivot to top
        this.torso.add(armL);
        this.arms.push(armL);

        const armR = new THREE.Mesh(armGeo, r.materials.patientSkin);
        armR.position.set(-0.25, 0.15, 0);
        armR.geometry.translate(0, -0.3, 0);
        this.torso.add(armR);
        this.arms.push(armR);
        
        // Set main body reference for damage flash
        this.body = this.torso;
    }

    addEyes(zOffset, yOffset) {
        const r = Enemy.resources;
        const eyeL = new THREE.Mesh(r.geometries.boxEyeSmall, r.materials.eyeBlack);
        eyeL.position.set(0.2, yOffset, zOffset);
        this.mesh.add(eyeL);

        const eyeR = new THREE.Mesh(r.geometries.boxEyeSmall, r.materials.eyeBlack);
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
        } else if (this.type === 'drone') {
            this.body.position.y = 1.5 + Math.sin(this.time * 3) * 0.2; // Hover
        } else if (this.type === 'patient') {
            // Walk Cycle (Slower, more deliberate but lurching)
            const stride = 0.5; // Larger stride
            
            // Legs
            if (this.legs) {
                this.legs[0].rotation.x = Math.sin(this.time * 1.5) * stride;
                this.legs[1].rotation.x = Math.sin(this.time * 1.5 + Math.PI) * stride;
            }
            
            // Arms (Flailing/Twitching)
            if (this.arms) {
                // Base swing
                this.arms[0].rotation.x = Math.sin(this.time * 1.5 + Math.PI) * stride * 0.5;
                this.arms[1].rotation.x = Math.sin(this.time * 1.5) * stride * 0.5;
                
                // Random spasms
                this.arms[0].rotation.z = Math.sin(this.time * 10) * 0.2 + 0.2; // Flail out
                this.arms[1].rotation.z = -Math.sin(this.time * 12) * 0.2 - 0.2;
            }
            
            // Horror Twitching (Intensified)
            // Randomly snap head violently
            if (Math.random() < 0.08) {
                this.head.rotation.y = (Math.random() - 0.5) * 1.5; // 90 degree snaps
                this.head.rotation.z = (Math.random() - 0.5) * 0.8;
            } else {
                // Return to center
                this.head.rotation.y *= 0.8;
                this.head.rotation.z *= 0.8;
            }
            
            // Torso Shiver (Violent)
            this.torso.rotation.z = Math.sin(this.time * 30) * 0.08;
            this.torso.rotation.x = Math.sin(this.time * 25) * 0.05; // Forward/back shake
            
            // Bobbing
            this.character.position.y = Math.abs(Math.sin(this.time * 1.5)) * 0.1;
            
            // Blood Drips
            if (this.particleSystem && Math.random() < 0.2) { // 20% chance per frame
                // Emit from random body part
                const part = Math.random() > 0.5 ? this.torso : (Math.random() > 0.5 ? this.arms[0] : this.arms[1]);
                const worldPos = new THREE.Vector3();
                part.getWorldPosition(worldPos);
                // Add some randomness to position
                worldPos.x += (Math.random() - 0.5) * 0.3;
                worldPos.z += (Math.random() - 0.5) * 0.3;
                worldPos.y -= 0.2; // Drip from bottom
                
                this.particleSystem.emit(worldPos, 'blood', 1);
            }
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
        // Only dispose the cloned materials, NOT the shared geometries
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                // Do NOT dispose geometry as it is shared
                // child.geometry.dispose(); 
                
                if (child.material) {
                    // Only dispose if it's a cloned material (we know body has cloned material)
                    // Simple check: if it's not in our static resources list?
                    // Or just rely on GC for materials if they are small?
                    // Better: Explicitly dispose the body material which we know is cloned.
                    // The other materials (eyes, etc) are shared, so DO NOT dispose.
                    
                    // Check if material is one of the shared ones
                    const isShared = Object.values(Enemy.resources.materials).includes(child.material);
                    if (!isShared) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            }
        });
    }
}
