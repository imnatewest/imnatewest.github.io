import * as THREE from 'three';
import { BaseMap } from './BaseMap.js';
import { Breakable } from '../entities/Breakable.js';

export class ForestMap extends BaseMap {
    constructor(scene, particleSystem) {
        super(scene, particleSystem);
        this.loadAssets();
    }

    loadAssets() {
        this.assets = {};

        // Geometries
        this.assets.pineTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.0, 6);
        this.assets.pineLeaves1Geo = new THREE.ConeGeometry(1.2, 1.5, 7);
        this.assets.pineLeaves2Geo = new THREE.ConeGeometry(0.9, 1.2, 7);
        this.assets.pineLeaves3Geo = new THREE.ConeGeometry(0.6, 1.0, 7);
        
        this.assets.oakTrunkGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
        this.assets.oakLeaves1Geo = new THREE.DodecahedronGeometry(1.2);
        this.assets.oakLeaves2Geo = new THREE.DodecahedronGeometry(0.9);
        
        this.assets.birchTrunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.8, 6);
        this.assets.birchLeaves1Geo = new THREE.DodecahedronGeometry(0.9);
        this.assets.birchLeaves2Geo = new THREE.DodecahedronGeometry(0.7);

        this.assets.willowTrunkGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 8);
        this.assets.willowTopGeo = new THREE.SphereGeometry(1.5, 8, 8);
        this.assets.willowBranchGeo = new THREE.CylinderGeometry(0.1, 0.05, 1.5, 4);

        this.assets.redwoodTrunkGeo = new THREE.CylinderGeometry(0.8, 1.0, 6.0, 8);
        this.assets.redwoodLeavesGeo = new THREE.ConeGeometry(2.5, 3.0, 8);

        this.assets.flowerStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4);
        this.assets.flowerPetalGeo1 = new THREE.DodecahedronGeometry(0.25, 0);
        this.assets.flowerPetalGeo2 = new THREE.ConeGeometry(0.25, 0.4, 5);
        this.assets.flowerPetalGeo3 = new THREE.SphereGeometry(0.25, 4, 4);

        this.assets.houseWallGeo = new THREE.BoxGeometry(4, 3, 4);
        this.assets.houseRoofGeo = new THREE.ConeGeometry(3.5, 2, 4);
        this.assets.houseDoorGeo = new THREE.BoxGeometry(1, 2, 0.2);

        this.assets.deadTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 5);
        this.assets.deadBranch1Geo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 4);
        this.assets.deadBranch2Geo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 4);

        this.assets.rockGeo = new THREE.DodecahedronGeometry(1, 0); // Scale this one
        this.assets.bushGeo = new THREE.DodecahedronGeometry(1, 1); // Scale this one
        this.assets.logGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 5); // Scale length

        // Materials
        this.assets.pineLeafMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
        this.assets.pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
        this.assets.oakLeafMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        this.assets.oakTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        this.assets.birchLeafMat = new THREE.MeshStandardMaterial({ color: 0x9ACD32 });
        this.assets.birchTrunkMat = new THREE.MeshStandardMaterial({ color: 0xF0F0F0 });
        this.assets.willowLeafMat = new THREE.MeshStandardMaterial({ color: 0x556B2F });
        this.assets.willowTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3C31 });
        this.assets.redwoodLeafMat = new THREE.MeshStandardMaterial({ color: 0x1B4D3E }); // Darker Green
        this.assets.redwoodTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); // Dark Red
        this.assets.flowerMatPink = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });
        this.assets.flowerMatYellow = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
        this.assets.flowerMatBlue = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
        this.assets.flowerMatPurple = new THREE.MeshStandardMaterial({ color: 0x9370DB });
        this.assets.flowerMatWhite = new THREE.MeshStandardMaterial({ color: 0xF0F8FF });
        this.assets.flowerStemMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
        this.assets.houseWallMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }); // Wood
        this.assets.houseRoofMat = new THREE.MeshStandardMaterial({ color: 0x2F4F4F, roughness: 0.8 }); // Dark Slate Gray
        this.assets.deadMat = new THREE.MeshStandardMaterial({ color: 0x404040 });
        this.assets.rockMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 });
        this.assets.bushMat = new THREE.MeshStandardMaterial({ color: 0x32CD32 });
        this.assets.logMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
        
        // Cell Tower Assets
        this.assets.towerBaseGeo = new THREE.BoxGeometry(3, 1, 3);
        this.assets.towerLegGeo = new THREE.CylinderGeometry(0.1, 0.2, 15, 4);
        this.assets.towerPlatformGeo = new THREE.BoxGeometry(2, 0.2, 2);
        this.assets.towerDishGeo = new THREE.ConeGeometry(0.5, 0.2, 8);
        this.assets.towerAntennaGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 4);
        
        this.assets.towerMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 }); // Rusted
        this.assets.concreteMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.9 });
        this.assets.dishMat = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });

        // Campfire Assets
        this.assets.campfireLogGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 5);
        this.assets.campfireStoneGeo = new THREE.DodecahedronGeometry(0.15, 0);
        this.assets.fireMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 0.5 });
    }

    generate() {
        // Ground - Grass
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4caf50,
            roughness: 0.8,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.ground = ground;

        // Dense Forest Generation
        // We'll create several "biomes" or clusters
        this.createObstacleBlock(0, 0, 150, 150, 'mixed_forest'); // Main forest expanded
        
        // Specific structures
        this.createObstacleBlock(-20, 20, 10, 10, 'ruins');
        this.createObstacleBlock(25, -15, 8, 8, 'ruins');
        this.createObstacleBlock(-30, -30, 15, 5, 'pine_grove');
        
        // Abandoned House
        this.createAbandonedHouse(-25, -25);

        // Abandoned Cell Tower
        this.createCellTower(40, -40);

        // Campfire (In front of Abandoned House)
        this.createCampfire(-22, -20);

        // Natural Boundary
        this.createBoundary();

        // Extraction Zone - Campsite
        this.extractionZone = new THREE.Group();
        this.extractionZone.position.set(15, 0, 15);
        this.scene.add(this.extractionZone);

        // 1. The Tent
        const tentGeo = new THREE.CylinderGeometry(0, 1.5, 3, 3); // Triangular Prism
        const tentMat = new THREE.MeshStandardMaterial({ color: 0x2F4F4F }); // Dark Slate Gray/Green
        const tent = new THREE.Mesh(tentGeo, tentMat);
        tent.position.set(2, 0.75, 0); // Offset from center
        tent.rotation.set(0, 0, 0); // Upright
        tent.scale.set(1, 1, 1.5); // Elongate
        tent.castShadow = true;
        this.extractionZone.add(tent);

        // 2. Fireplace Ring
        const stoneGeo = new THREE.DodecahedronGeometry(0.2);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const fireRadius = 0.8;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(Math.cos(angle) * fireRadius, 0.1, Math.sin(angle) * fireRadius);
            stone.castShadow = true;
            this.extractionZone.add(stone);
        }

        // 3. Logs
        const logGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2);
        const logMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const log1 = new THREE.Mesh(logGeo, logMat);
        log1.rotation.x = Math.PI / 2;
        log1.rotation.z = Math.PI / 4;
        log1.position.y = 0.1;
        this.extractionZone.add(log1);
        
        const log2 = new THREE.Mesh(logGeo, logMat);
        log2.rotation.x = Math.PI / 2;
        log2.rotation.z = -Math.PI / 4;
        log2.position.y = 0.1;
        this.extractionZone.add(log2);

        // 4. Fire Particles (Sparks)
        const particleGeo = new THREE.DodecahedronGeometry(0.05);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xFF4500 }); // OrangeRed
        for(let i=0; i<15; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat);
            p.position.set(
                (Math.random() - 0.5) * 0.5, 
                Math.random() * 1.5, 
                (Math.random() - 0.5) * 0.5
            );
            this.extractionZone.add(p);
            
            // Animation data
            p.userData = {
                speed: 0.5 + Math.random(),
                yOffset: Math.random() * Math.PI * 2,
                radius: Math.random() * 0.3
            };
        }
        
        // 5. Fire Light (Warm)
        const light = new THREE.PointLight(0xFF8C00, 2, 15); // DarkOrange
        light.position.y = 1.0;
        light.castShadow = true;
        this.extractionZone.add(light);
    }

    createBoundary() {
        const radius = 70;
        const count = 400; // Doubled again for larger radius
        
        // Inner Ring
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 3;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            if (Math.random() > 0.3) this.createPineTree(x, z);
            else this.createRock(x, z);
        }

        // Outer Ring (to fill gaps)
        const outerCount = 300;
        for (let i = 0; i < outerCount; i++) {
            const angle = (i / outerCount) * Math.PI * 2 + 0.1; // Offset angle
            const r = radius + 4 + (Math.random() - 0.5) * 3;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            if (Math.random() > 0.4) this.createPineTree(x, z);
            else if (Math.random() > 0.5) this.createBush(x, z); // Add bushes to boundary
            else this.createRock(x, z);
        }
    }

    createObstacleBlock(x, z, w, d, type) {
        const area = w * d;
        let density = 0.05; // Default
        if (type === 'mixed_forest') density = 0.15; // Increased density for more flowers
        if (type === 'pine_grove') density = 0.12;
        if (type === 'ruins') density = 0.08;

        const count = Math.floor(area * density);

        for (let i = 0; i < count; i++) {
            const ox = x + (Math.random() - 0.5) * w;
            const oz = z + (Math.random() - 0.5) * d;
            
            // Avoid center spawn area
            if (Math.abs(ox) < 5 && Math.abs(oz) < 5) continue;
            // Avoid extraction zone
            if (Math.abs(ox - 15) < 5 && Math.abs(oz - 15) < 5) continue;
            // Avoid Abandoned House area
            if (Math.abs(ox - (-25)) < 6 && Math.abs(oz - (-25)) < 6) continue;

            const rand = Math.random();

            if (type === 'mixed_forest') {
                if (rand < 0.1) this.createOakTree(ox, oz);
                else if (rand < 0.2) this.createBirchTree(ox, oz);
                else if (rand < 0.3) this.createPineTree(ox, oz);
                else if (rand < 0.35) this.createWillowTree(ox, oz);
                else if (rand < 0.38) this.createRedwoodTree(ox, oz); // Rare giant
                else if (rand < 0.5) this.createBush(ox, oz);
                else if (rand < 0.55) this.createLog(ox, oz);
                else if (rand < 0.6) this.createBrokenPillar(ox, oz); // Rare
                else if (rand < 0.65) this.createRock(ox, oz);
                else this.createFlower(ox, oz); // 35% chance for flowers (0.65 to 1.0)
            } else if (type === 'pine_grove') {
                if (rand < 0.6) this.createPineTree(ox, oz);
                else if (rand < 0.7) this.createDeadTree(ox, oz);
                else if (rand < 0.8) this.createLog(ox, oz);
                else if (rand < 0.9) this.createRock(ox, oz);
                else this.createFlower(ox, oz); // 10% chance
            } else if (type === 'ruins') {
                if (rand < 0.3) this.createOldWall(ox, oz);
                else if (rand < 0.5) this.createBrokenPillar(ox, oz);
                else if (rand < 0.6) this.createDeadTree(ox, oz);
                else if (rand < 0.7) this.createCrate(ox, oz);
                else if (rand < 0.8) this.createRock(ox, oz);
                else if (rand < 0.9) this.createBush(ox, oz);
                else this.createFlower(ox, oz); // 10% chance
            }
        }
    }

    createOakTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const scale = 0.8 + Math.random() * 0.4;
        group.scale.set(scale, scale, scale);

        // Trunk
        const trunk = new THREE.Mesh(this.assets.oakTrunkGeo, this.assets.oakTrunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const l1 = new THREE.Mesh(this.assets.oakLeaves1Geo, this.assets.oakLeafMat);
        l1.position.y = 2.2;
        l1.castShadow = true;
        group.add(l1);
        
        const l2 = new THREE.Mesh(this.assets.oakLeaves2Geo, this.assets.oakLeafMat);
        l2.position.set(0.8, 1.8, 0);
        l2.castShadow = true;
        group.add(l2);
        
        const l3 = new THREE.Mesh(this.assets.oakLeaves2Geo, this.assets.oakLeafMat);
        l3.position.set(-0.7, 2.0, 0.6);
        l3.castShadow = true;
        group.add(l3);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(1, 10, 1));
    }

    createPineTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const scale = 0.8 + Math.random() * 0.6;
        group.scale.set(scale, scale * 1.2, scale);

        // Trunk
        const trunk = new THREE.Mesh(this.assets.pineTrunkGeo, this.assets.pineTrunkMat);
        trunk.position.y = 0.5;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const c1 = new THREE.Mesh(this.assets.pineLeaves1Geo, this.assets.pineLeafMat);
        c1.position.y = 1.5;
        c1.castShadow = true;
        group.add(c1);

        const c2 = new THREE.Mesh(this.assets.pineLeaves2Geo, this.assets.pineLeafMat);
        c2.position.y = 2.2;
        c2.castShadow = true;
        group.add(c2);

        const c3 = new THREE.Mesh(this.assets.pineLeaves3Geo, this.assets.pineLeafMat);
        c3.position.y = 2.8;
        c3.castShadow = true;
        group.add(c3);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(0.8, 10, 0.8));
    }

    createBirchTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const scale = 0.8 + Math.random() * 0.4;
        group.scale.set(scale, scale * 1.1, scale);

        // Trunk
        const trunk = new THREE.Mesh(this.assets.birchTrunkGeo, this.assets.birchTrunkMat);
        trunk.position.y = 0.9;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const l1 = new THREE.Mesh(this.assets.birchLeaves1Geo, this.assets.birchLeafMat);
        l1.position.y = 2.0;
        l1.castShadow = true;
        group.add(l1);
        
        const l2 = new THREE.Mesh(this.assets.birchLeaves2Geo, this.assets.birchLeafMat);
        l2.position.set(0.4, 2.5, 0);
        l2.castShadow = true;
        group.add(l2);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(0.6, 10, 0.6));
    }

    createWillowTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const scale = 1.0 + Math.random() * 0.3;
        group.scale.set(scale, scale, scale);

        // Trunk
        const trunk = new THREE.Mesh(this.assets.willowTrunkGeo, this.assets.willowTrunkMat);
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        group.add(trunk);

        // Canopy
        const top = new THREE.Mesh(this.assets.willowTopGeo, this.assets.willowLeafMat);
        top.position.y = 2.0;
        top.scale.y = 0.6;
        top.castShadow = true;
        group.add(top);

        // Branches
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const branch = new THREE.Mesh(this.assets.willowBranchGeo, this.assets.willowLeafMat);
            branch.position.set(Math.cos(angle) * 1.2, 1.2, Math.sin(angle) * 1.2);
            branch.rotation.x = Math.random() * 0.2;
            branch.rotation.z = Math.random() * 0.2;
            branch.castShadow = true;
            group.add(branch);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(1.2, 10, 1.2));
    }

    createRedwoodTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const scale = 1.2 + Math.random() * 0.5;
        group.scale.set(scale, scale, scale);

        // Trunk
        const trunk = new THREE.Mesh(this.assets.redwoodTrunkGeo, this.assets.redwoodTrunkMat);
        trunk.position.y = 3.0;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves (Layers)
        for(let i=0; i<4; i++) {
            const leaves = new THREE.Mesh(this.assets.redwoodLeavesGeo, this.assets.redwoodLeafMat);
            leaves.position.y = 4.0 + i * 1.5;
            leaves.scale.set(1 - i*0.15, 1, 1 - i*0.15);
            leaves.castShadow = true;
            group.add(leaves);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(2.0, 20, 2.0));
    }

    createDeadTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI;
        const scale = 0.9 + Math.random() * 0.3;
        group.scale.set(scale, scale, scale);

        // Trunk
        const trunk = new THREE.Mesh(this.assets.deadTrunkGeo, this.assets.deadMat);
        trunk.position.y = 0.75;
        trunk.rotation.z = (Math.random() - 0.5) * 0.2;
        trunk.castShadow = true;
        group.add(trunk);

        // Branches
        const b1 = new THREE.Mesh(this.assets.deadBranch1Geo, this.assets.deadMat);
        b1.position.set(0.2, 1.2, 0);
        b1.rotation.z = -Math.PI / 4;
        b1.castShadow = true;
        group.add(b1);

        const b2 = new THREE.Mesh(this.assets.deadBranch2Geo, this.assets.deadMat);
        b2.position.set(-0.2, 1.0, 0.2);
        b2.rotation.z = Math.PI / 3;
        b2.castShadow = true;
        group.add(b2);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(0.6, 10, 0.6));
    }

    createRuins(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI;

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
        
        // Wall segment
        const w = 1 + Math.random() * 2;
        const h = 1 + Math.random() * 2;
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), stoneMat);
        wall.position.y = h/2;
        wall.castShadow = true;
        group.add(wall);

        // Debris
        if (Math.random() > 0.5) {
            const debris = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), stoneMat);
            debris.position.set(w/2 + 0.5, 0.25, 0.5);
            debris.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(debris);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(w, 10, 0.8));
    }

    createAbandonedHouse(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        // Rotate slightly for natural look
        group.rotation.y = Math.PI / 6;

        // Walls
        const walls = new THREE.Mesh(this.assets.houseWallGeo, this.assets.houseWallMat);
        walls.position.y = 1.5;
        walls.castShadow = true;
        group.add(walls);

        // Roof
        const roof = new THREE.Mesh(this.assets.houseRoofGeo, this.assets.houseRoofMat);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4; // Align corners
        roof.castShadow = true;
        group.add(roof);

        // Doorway (Visual only, just a dark rectangle)
        const door = new THREE.Mesh(this.assets.houseDoorGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        door.position.set(0, 1, 2.01); // Slightly in front
        group.add(door);

        // Debris / Planks
        const plankGeo = new THREE.BoxGeometry(0.2, 1.5, 0.1);
        const plank1 = new THREE.Mesh(plankGeo, this.assets.houseWallMat);
        plank1.position.set(0.5, 1, 2.1);
        plank1.rotation.z = 0.2;
        group.add(plank1);

        const plank2 = new THREE.Mesh(plankGeo, this.assets.houseWallMat);
        plank2.position.set(-0.5, 1, 2.1);
        plank2.rotation.z = -0.1;
        group.add(plank2);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(4, 5, 4));
    }

    createRock(x, z) {
        const scale = 0.5 + Math.random() * 0.8;
        const rock = new THREE.Mesh(this.assets.rockGeo, this.assets.rockMat);
        rock.scale.set(scale, scale, scale);
        rock.position.set(x, scale * 0.4, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        this.scene.add(rock);
        this.props.push(rock);
        
        this.addCollisionBox(rock, new THREE.Vector3(scale*1.5, scale*2, scale*1.5));
    }

    createBush(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // Cluster of 3 bushes
        const positions = [
            { x: 0, y: 0.4, z: 0, s: 0.5 },
            { x: 0.4, y: 0.3, z: 0.3, s: 0.4 },
            { x: -0.3, y: 0.3, z: 0.2, s: 0.4 }
        ];

        positions.forEach(p => {
            const mesh = new THREE.Mesh(this.assets.bushGeo, this.assets.bushMat);
            mesh.scale.set(p.s, p.s, p.s);
            mesh.position.set(p.x, p.y, p.z);
            mesh.castShadow = true;
            group.add(mesh);
        });

        this.scene.add(group);
        this.props.push(group);
        // Bushes are passable now
        // this.addCollisionBox(group, new THREE.Vector3(1.2, 1, 1.2));
    }

    createLog(x, z) {
        const len = 1.5 + Math.random();
        const log = new THREE.Mesh(this.assets.logGeo, this.assets.logMat);
        log.scale.set(1, len, 1); // Scale Y is length for cylinder
        log.position.set(x, 0.2, z);
        log.rotation.set(Math.PI/2, Math.random() * Math.PI, 0);
        log.castShadow = true;
        this.scene.add(log);
        this.props.push(log);
        this.addCollisionBox(log, new THREE.Vector3(len, 1, 0.5)); 
    }

    createFlower(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // Stem
        const stem = new THREE.Mesh(this.assets.flowerStemGeo, this.assets.flowerStemMat);
        stem.position.y = 0.3;
        group.add(stem);
        
        // Random Petal Shape
        const shapeRand = Math.random();
        let petalGeo;
        if (shapeRand < 0.33) petalGeo = this.assets.flowerPetalGeo1;
        else if (shapeRand < 0.66) petalGeo = this.assets.flowerPetalGeo2;
        else petalGeo = this.assets.flowerPetalGeo3;

        // Random Color
        const colorRand = Math.random();
        let petalMat;
        if (colorRand < 0.2) petalMat = this.assets.flowerMatPink;
        else if (colorRand < 0.4) petalMat = this.assets.flowerMatYellow;
        else if (colorRand < 0.6) petalMat = this.assets.flowerMatBlue;
        else if (colorRand < 0.8) petalMat = this.assets.flowerMatPurple;
        else petalMat = this.assets.flowerMatWhite;

        const flower = new THREE.Mesh(petalGeo, petalMat);
        flower.position.y = 0.6;
        // Random rotation for variety
        flower.rotation.set(Math.random()*0.5, Math.random()*Math.PI, Math.random()*0.5);
        group.add(flower);
        
        this.scene.add(group);
        this.props.push(group);
        // Flowers are passable, no collision
    }

    createBrokenPillar(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
        
        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8), mat);
        base.position.y = 0.6;
        base.castShadow = true;
        group.add(base);
        
        // Fallen top (sometimes)
        if (Math.random() > 0.3) {
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8), mat);
            top.position.set(0.6, 0.2, 0);
            top.rotation.z = Math.PI / 2 + 0.2;
            top.rotation.y = Math.random() * Math.PI;
            top.castShadow = true;
            group.add(top);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(1, 5, 1));
    }

    createOldWall(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI;
        
        const mat = new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0.9 });
        
        // Main wall
        const w = 2 + Math.random();
        const h = 1 + Math.random();
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), mat);
        wall.position.y = h/2;
        wall.castShadow = true;
        group.add(wall);
        
        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(w, 5, 0.6));
    }

    createCrate(x, z) {
        const breakable = new Breakable(this.scene, new THREE.Vector3(x, 0, z), 'crate', this.particleSystem);
        this.breakables.push(breakable);
        // Add to obstacles for simple collision if needed, or handle separately
        // For now, let's add the box to obstacles so player can't walk through it
        this.obstacles.push({ mesh: breakable.mesh, box: breakable.box });
    }

    createCellTower(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Base
        const base = new THREE.Mesh(this.assets.towerBaseGeo, this.assets.concreteMat);
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);

        // Tower Legs (4 angled legs)
        const legHeight = 15;
        const spreadBottom = 1.2;
        const spreadTop = 0.5;
        
        const legs = [
            { x: 1, z: 1 }, { x: -1, z: 1 }, { x: 1, z: -1 }, { x: -1, z: -1 }
        ];

        legs.forEach(pos => {
            const leg = new THREE.Mesh(this.assets.towerLegGeo, this.assets.towerMat);
            // Position at midpoint height
            leg.position.y = legHeight / 2 + 1;
            
            // Angle them
            const angleX = (pos.z > 0 ? -1 : 1) * 0.05;
            const angleZ = (pos.x > 0 ? 1 : -1) * 0.05;
            
            leg.position.x = pos.x * spreadBottom * 0.5; // Approximate base pos
            leg.position.z = pos.z * spreadBottom * 0.5;
            
            leg.rotation.x = angleX;
            leg.rotation.z = angleZ;
            
            leg.castShadow = true;
            group.add(leg);
        });

        // Platform at top
        const platform = new THREE.Mesh(this.assets.towerPlatformGeo, this.assets.towerMat);
        platform.position.y = legHeight + 1;
        platform.castShadow = true;
        group.add(platform);

        // Antenna
        const antenna = new THREE.Mesh(this.assets.towerAntennaGeo, this.assets.towerMat);
        antenna.position.y = legHeight + 1 + 1.5;
        antenna.castShadow = true;
        group.add(antenna);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(3, 20, 3));
    }
    
    createCampfire(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Logs
        const log1 = new THREE.Mesh(this.assets.campfireLogGeo, this.assets.logMat);
        log1.rotation.x = Math.PI / 2;
        log1.rotation.z = Math.PI / 4;
        log1.position.y = 0.1;
        group.add(log1);
        
        const log2 = new THREE.Mesh(this.assets.campfireLogGeo, this.assets.logMat);
        log2.rotation.x = Math.PI / 2;
        log2.rotation.z = -Math.PI / 4;
        log2.position.y = 0.1;
        group.add(log2);

        // Stones
        for(let i=0; i<6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const stone = new THREE.Mesh(this.assets.campfireStoneGeo, this.assets.rockMat);
            stone.position.set(Math.cos(angle) * 0.4, 0.1, Math.sin(angle) * 0.4);
            group.add(stone);
        }

        // Fire Light
        const light = new THREE.PointLight(0xff4500, 1, 8);
        light.position.y = 0.5;
        group.add(light);

        // Fire Mesh (Simple visual)
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 5), this.assets.fireMat);
        fire.position.y = 0.2;
        group.add(fire);

        this.scene.add(group);
        this.props.push(group);
        // No collision box, can walk over it (maybe take damage later?)
    }
}
