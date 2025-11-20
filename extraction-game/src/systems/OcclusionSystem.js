import * as THREE from 'three';

export class OcclusionSystem {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.occludedObjects = new Set(); // Set of root objects (Groups) currently faded
    }

    update(camera, playerMesh, obstacles) {
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
        // obstacles is an array of objects. We need to raycast against their meshes.
        // BaseMap.props contains the meshes/groups directly.
        const intersects = this.raycaster.intersectObjects(obstacles, true); // Recursive

        const currentOccluders = new Set();

        for (const hit of intersects) {
            let obj = hit.object;

            // Ignore Player itself (if it somehow gets in list)
            if (obj === playerMesh || playerMesh.getObjectById(obj.id)) continue;

            // Ignore InstancedMesh (can't fade individual instances easily)
            if (obj.isInstancedMesh) continue;

            // Find the root group (e.g. the Tree group, Building group)
            // We assume props are added to scene as Groups or Meshes.
            // We traverse up until we hit the Scene or a parent that is in the 'obstacles' list.
            // Actually, 'obstacles' passed in might be the list of props.
            // Let's traverse up to find the top-most parent that is NOT the scene.
            let root = obj;
            while (root.parent && root.parent.type !== 'Scene') {
                root = root.parent;
            }

            currentOccluders.add(root);
        }

        // Handle Fading
        
        // 1. Restore objects that are no longer occluding
        for (const obj of this.occludedObjects) {
            if (!currentOccluders.has(obj)) {
                this.restoreObject(obj);
                this.occludedObjects.delete(obj);
            }
        }

        // 2. Fade new occluders
        for (const obj of currentOccluders) {
            if (!this.occludedObjects.has(obj)) {
                this.fadeObject(obj);
                this.occludedObjects.add(obj);
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
