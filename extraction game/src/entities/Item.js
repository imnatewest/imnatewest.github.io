import * as THREE from 'three';

export class Item {
    constructor(scene, position, mapType = 'forest') {
        this.scene = scene;
        this.mapType = mapType;
        
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.mesh.position.y = 0;
        this.mesh.scale.set(2.0, 2.0, 2.0);

        if (mapType === 'city') {
            // Canned Food
            const canGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16);
            const canMat = new THREE.MeshStandardMaterial({ color: 0xCC3333 }); // Red can
            const can = new THREE.Mesh(canGeo, canMat);
            can.position.y = 0.2;
            can.castShadow = true;
            this.mesh.add(can);

            // Label stripe
            const labelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.15, 16);
            const labelMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const label = new THREE.Mesh(labelGeo, labelMat);
            label.position.y = 0.2;
            this.mesh.add(label);

            // Top
            const topGeo = new THREE.CircleGeometry(0.15, 16);
            const topMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const top = new THREE.Mesh(topGeo, topMat);
            top.position.y = 0.4;
            top.rotation.x = -Math.PI / 2;
            this.mesh.add(top);
        } else {
            // Mushroom (forest)
            const stalkGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.4);
            const stalkMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const stalk = new THREE.Mesh(stalkGeo, stalkMat);
            stalk.position.y = 0.2;
            stalk.castShadow = true;
            this.mesh.add(stalk);

            const capGeo = new THREE.ConeGeometry(0.3, 0.3, 8);
            const capMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 0.4;
            cap.castShadow = true;
            this.mesh.add(cap);

            // Spots
            const spotGeo = new THREE.DodecahedronGeometry(0.05);
            const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            for(let i=0; i<3; i++) {
                const spot = new THREE.Mesh(spotGeo, spotMat);
                spot.position.set(
                    Math.sin(i*2)*0.15,
                    0.45,
                    Math.cos(i*2)*0.15
                );
                this.mesh.add(spot);
            }
        }

        this.scene.add(this.mesh);
        
        this.active = true;
        this.time = Math.random() * 100;
    }

    update(deltaTime) {
        this.time += deltaTime;
        // Gentle sway
        this.mesh.rotation.z = Math.sin(this.time * 2) * 0.1;
    }

    checkCollision(playerMesh) {
        if (!this.active) return false;
        const dx = this.mesh.position.x - playerMesh.position.x;
        const dz = this.mesh.position.z - playerMesh.position.z;
        return (dx * dx + dz * dz) < 2.25; // 1.5^2
    }

    collect() {
        this.active = false;
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
