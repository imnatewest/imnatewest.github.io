import * as THREE from 'three';

export class BaseMap {
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        
        this.ground = null;
        this.obstacles = [];
        this.breakables = [];
        this.walls = []; 
        this.props = []; // Track all generated meshes for cleanup
        this.extractionZone = null;
        
        this.allowEnemies = true;
        this.allowItems = true;
        
        this.assets = {};
    }

    loadAssets() {
        // Override in subclass
    }

    generate() {
        // Override in subclass
    }

    addCollisionBox(mesh, size) {
        const box = new THREE.Box3().setFromCenterAndSize(mesh.position, size);
        mesh.box = box;
        this.walls.push(mesh);
    }

    disposeHierarchy(node) {
        node.traverse((child) => {
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

    dispose() {
        // Remove Ground
        if (this.ground) {
            this.scene.remove(this.ground);
            if (this.ground.geometry) this.ground.geometry.dispose();
            if (this.ground.material) this.ground.material.dispose();
            this.ground = null;
        }

        // Remove Props (Trees, Rocks, etc.)
        this.props.forEach(mesh => {
            this.disposeHierarchy(mesh);
            this.scene.remove(mesh);
        });
        this.props = [];

        // Remove Obstacles (if any left)
        this.obstacles.forEach(obj => {
            if (obj.mesh) {
                this.disposeHierarchy(obj.mesh);
                this.scene.remove(obj.mesh);
            }
        });
        this.obstacles = [];

        // Remove Breakables
        this.breakables.forEach(obj => {
            if (obj.dispose) obj.dispose();
            this.scene.remove(obj.mesh);
        });
        this.breakables = [];

        // Remove Extraction Zone
        if (this.extractionZone) {
            this.disposeHierarchy(this.extractionZone);
            this.scene.remove(this.extractionZone);
            this.extractionZone = null;
        }
        
        this.walls = [];
    }
}
