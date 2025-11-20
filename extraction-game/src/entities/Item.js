/**
 * Item Class
 * ============================================================================
 * Represents collectable items that spawn on maps. Visual appearance changes
 * based on map type (mushrooms in forest, canned food in city). Items bob
 * gently and can be collected by the player to increase score.
 * ============================================================================
 */

import * as THREE from 'three';

export class Item {
    /**
     * Create a collectible item
     * @param {THREE.Scene} scene - Scene to add the item to
     * @param {THREE.Vector3} position - World position to spawn at
     * @param {string} mapType - Map type ('forest' or 'city') determines appearance
     */
    constructor(scene, position, mapType = 'forest') {
        this.scene = scene;
        this.mapType = mapType;
        
        // Create container group for item geometry
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.mesh.position.y = 0;  // Place on ground
        this.mesh.scale.set(2.0, 2.0, 2.0);  // Extra large for visibility

        // ====================================================================
        // Build Item Geometry (Map-Specific Appearance)
        // ====================================================================
        
        if (mapType === 'city') {
            // ------------------------------------------------------------
            // CITY ITEM: Canned Food
            // ------------------------------------------------------------
            
            // Main can body (red cylinder)
            const canGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16);
            const canMat = new THREE.MeshStandardMaterial({ color: 0xCC3333 });  // Red
            const can = new THREE.Mesh(canGeo, canMat);
            can.position.y = 0.2;  // Raise above ground
            can.castShadow = true;
            this.mesh.add(can);

            // White label stripe around middle
            const labelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.15, 16);
            const labelMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const label = new THREE.Mesh(labelGeo, labelMat);
            label.position.y = 0.2;
            this.mesh.add(label);

            // Metal top lid (circular disk)
            const topGeo = new THREE.CircleGeometry(0.15, 16);
            const topMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const top = new THREE.Mesh(topGeo, topMat);
            top.position.y = 0.4;  // Top of can
            top.rotation.x = -Math.PI / 2;  // Face upward
            this.mesh.add(top);
            
        } else {
            // ------------------------------------------------------------
            // FOREST ITEM: Mushroom
            // ------------------------------------------------------------
            
            // White stalk (tapered cylinder)
            const stalkGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.4);
            const stalkMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const stalk = new THREE.Mesh(stalkGeo, stalkMat);
            stalk.position.y = 0.2;
            stalk.castShadow = true;
            this.mesh.add(stalk);

            // Red cap (cone shape)
            const capGeo = new THREE.ConeGeometry(0.3, 0.3, 8);
            const capMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 0.4;
            cap.castShadow = true;
            this.mesh.add(cap);

            // White spots on cap (3 small dodecahedrons)
            const spotGeo = new THREE.DodecahedronGeometry(0.05);
            const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            for(let i=0; i<3; i++) {
                const spot = new THREE.Mesh(spotGeo, spotMat);
                // Position spots in a circle around cap
                spot.position.set(
                    Math.sin(i*2)*0.15,  // X position
                    0.45,                // Y position
                    Math.cos(i*2)*0.15   // Z position
                );
                this.mesh.add(spot);
            }
        }

        this.scene.add(this.mesh);
        
        this.active = true;  // Can be collected
        this.time = Math.random() * 100;  // Random start time for animation variety
    }

    /**
     * Update item animation
     * Makes item sway gently to attract player attention
     * @param {number} deltaTime - Time since last frame (in seconds)
     */
    update(deltaTime) {
        this.time += deltaTime;
        // Gentle rotation sway effect (sin wave)
        this.mesh.rotation.z = Math.sin(this.time * 2) * 0.1;
    }

    /**
     * Check if player is close enough to collect this item
     * @param {THREE.Mesh} playerMesh - Player's mesh for distance calculation
     * @returns {boolean} True if player is within collection range
     */
    checkCollision(playerMesh) {
        if (!this.active) return false;
        
        // Calculate 2D distance (ignore Y axis)
        const dx = this.mesh.position.x - playerMesh.position.x;
        const dz = this.mesh.position.z - playerMesh.position.z;
        
        // Check if distance squared is within collection radius squared
        // Using squared distance avoids expensive sqrt() calculation
        return (dx * dx + dz * dz) < 2.25;  // 1.5 units collection radius (1.5^2 = 2.25)
    }

    /**
     * Collect this item
     * Deactivates and removes from scene
     */
    collect() {
        this.active = false;
        this.scene.remove(this.mesh);
    }

    /**
     * Clean up Three.js resources
     * Disposes of geometries and materials to free GPU memory
     */
    dispose() {
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                // Dispose geometry
                if (child.geometry) child.geometry.dispose();
                
                // Dispose material(s)
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        // Handle multiple materials
                        child.material.forEach(m => m.dispose());
                    } else {
                        // Single material
                        child.material.dispose();
                    }
                }
            }
        });
    }
}

