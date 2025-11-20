import * as THREE from 'three';

export class OcclusionSystem {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.occludedObjects = new Set(); // Set of root objects (Groups) currently faded
        this.fadeStates = new Map(); // Map<Object3D, { timeSinceHit: number }>
    }

    update(camera, playerMesh, obstacles, deltaTime = 0.016) {
        if (!playerMesh) return;

        // Raycast from camera to player
        const playerPos = playerMesh.position.clone();
        // Aim slightly up to catch the head/body, not just feet
        playerPos.y += 1.0; 

        const direction = new THREE.Vector3().subVectors(playerPos, camera.position).normalize();
        const distance = camera.position.distanceTo(playerPos);

        this.raycaster.set(camera.position, direction);
        this.raycaster.far = distance; // Only check objects BETWEEN camera and player

        // Intersect against obstacles (props)
        const intersects = this.raycaster.intersectObjects(obstacles, true); // Recursive

        const currentFrameOccluders = new Set();

        for (const hit of intersects) {
            let obj = hit.object;

            // Ignore Player itself
            if (obj === playerMesh || playerMesh.getObjectById(obj.id)) continue;

            // Ignore InstancedMesh
            if (obj.isInstancedMesh) continue;

            // Find the root group
            let root = obj;
            while (root.parent && root.parent.type !== 'Scene') {
                root = root.parent;
            }

            currentFrameOccluders.add(root);
        }

        // Update Fade States
        // 1. For objects currently hit: Reset timer
        for (const obj of currentFrameOccluders) {
            this.fadeStates.set(obj, { timeSinceHit: 0 });
            
            if (!this.occludedObjects.has(obj)) {
                this.fadeObject(obj);
                this.occludedObjects.add(obj);
            }
        }

        // 2. For objects NOT hit: Increment timer
        for (const [obj, state] of this.fadeStates) {
            if (!currentFrameOccluders.has(obj)) {
                state.timeSinceHit += deltaTime;
                
                // Only restore after a grace period (e.g. 0.2 seconds)
                if (state.timeSinceHit > 0.2) {
                    this.restoreObject(obj);
                    this.occludedObjects.delete(obj);
                    this.fadeStates.delete(obj);
                }
            }
        }
    }

    fadeObject(root) {
        root.traverse((child) => {
            if (child.isMesh && !child.isInstancedMesh) {
                // Store original material if not already stored
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material;
                    
                    // Clone and modify
                    // Handle array of materials? (Rare for simple props but possible)
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => {
                            const clone = m.clone();
                            clone.transparent = true;
                            clone.opacity = 0.3; // 30% opacity
                            return clone;
                        });
                    } else {
                        const clone = child.material.clone();
                        clone.transparent = true;
                        clone.opacity = 0.3;
                        child.material = clone;
                    }
                }
            }
        });
    }

    restoreObject(root) {
        root.traverse((child) => {
            if (child.isMesh && child.userData.originalMaterial) {
                // Dispose cloned material(s) to prevent leaks
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }

                // Restore original
                child.material = child.userData.originalMaterial;
                delete child.userData.originalMaterial;
            }
        });
    }
}
