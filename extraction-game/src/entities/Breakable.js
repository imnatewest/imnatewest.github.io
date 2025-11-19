import * as THREE from 'three';
import { Item } from './Item.js';

export class Breakable {
    constructor(scene, position, type = 'crate', particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.type = type;
        this.isBroken = false;
        
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        
        if (type === 'crate') {
            const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const mat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // SaddleBrown
            this.model = new THREE.Mesh(geo, mat);
            this.model.position.y = 0.75;
            this.model.castShadow = true;
            this.mesh.add(this.model);
            
            // Detail
            const detailGeo = new THREE.BoxGeometry(1.6, 0.2, 1.6);
            const detailMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
            const d1 = new THREE.Mesh(detailGeo, detailMat); d1.position.y = 0.2; this.model.add(d1);
            const d2 = new THREE.Mesh(detailGeo, detailMat); d2.position.y = 1.3; this.model.add(d2);
            const d3 = new THREE.Mesh(detailGeo, detailMat); d3.rotation.z = Math.PI/4; d3.scale.set(0.1, 8, 1.05); d3.position.y = 0.75; d3.position.z = 0.76; this.model.add(d3);
        }

        this.scene.add(this.mesh);
        
        // Collision Box
        this.box = new THREE.Box3();
        this.updateBox();
    }

    updateBox() {
        this.box.setFromObject(this.mesh);
    }

    hit() {
        if (this.isBroken) return null;

        this.isBroken = true;
        this.scene.remove(this.mesh);
        
        // Particles
        if (this.particleSystem) {
            this.particleSystem.emit(this.mesh.position, 'dust', 10);
            this.particleSystem.emit(this.mesh.position, 'spark', 5);
        }

        // Drop Item?
        if (Math.random() > 0.5) {
            return new Item(this.scene, this.mesh.position.clone());
        }
        return null;
    }
}
