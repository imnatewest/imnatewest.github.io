import * as THREE from 'three';
import { BaseMap } from './BaseMap.js';

export class CityMap extends BaseMap {
    constructor(scene, particleSystem) {
        super(scene, particleSystem);
        this.allowEnemies = true;
        this.allowItems = true; // Spawn canned food in city
        this.loadAssets();
    }

    loadAssets() {
        this.assets = {};

        // Geometries
        this.assets.buildingGeo = new THREE.BoxGeometry(1, 1, 1); // Scaled later
        this.assets.roadGeo = new THREE.PlaneGeometry(1, 1); // Scaled later
        this.assets.rubbleGeo = new THREE.DodecahedronGeometry(0.5, 0);
        
        // Street Light Assets
        this.assets.poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);
        this.assets.lampGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        
        // Traffic Light Assets
        this.assets.tlPoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5);
        this.assets.tlBoxGeo = new THREE.BoxGeometry(0.3, 0.8, 0.2);
        this.assets.tlLightGeo = new THREE.CircleGeometry(0.1, 16);

        // Prop Assets
        this.assets.benchGeo = new THREE.BoxGeometry(1.5, 0.1, 0.5); // Seat
        this.assets.trashGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 8);
        this.assets.hydrantGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
        this.assets.treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.0, 6);
        this.assets.treeLeavesGeo = new THREE.ConeGeometry(1.5, 2.5, 8);
        this.assets.carWreckGeo = new THREE.BoxGeometry(1.2, 0.5, 2.0); // Simple car shape

        // Materials
        this.assets.concreteMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.9 }); // Lighter Grey
        this.assets.asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, roughness: 0.9 }); // Very dark asphalt
        this.assets.sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 }); // Dark grey sidewalk
        this.assets.curbMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 }); // Darker curb
        this.assets.ruinMat = new THREE.MeshStandardMaterial({ color: 0x4A4A4A, roughness: 1.0 }); // Dark weathered concrete
        this.assets.windowMat = new THREE.MeshStandardMaterial({ 
            color: 0x88CCFF, // Light Blue
            roughness: 0.1, 
            metalness: 0.9,
            transparent: true,
            opacity: 0.7
        });
        this.assets.rubbleMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1.0 });
        this.assets.yellowLineMat = new THREE.MeshBasicMaterial({ color: 0x666633 }); // Dim olive yellow
        
        this.assets.poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.assets.lampMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFDDAA, // Dim warm white
            emissive: 0xFFDDAA,
            emissiveIntensity: 0.2
        });
        
        this.assets.tlBoxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        this.assets.redMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        this.assets.yellowMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        this.assets.greenMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });

        this.assets.benchMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 }); // Wood
        this.assets.trashMat = new THREE.MeshStandardMaterial({ color: 0x223322 }); // Dark Green
        this.assets.hydrantMat = new THREE.MeshStandardMaterial({ color: 0xCC0000 }); // Red
        this.assets.treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
        this.assets.treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        this.assets.carWreckMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });

        // Construction Assets
        this.assets.girderGeo = new THREE.BoxGeometry(0.2, 1, 0.2); // Scaled later
        this.assets.girderMat = new THREE.MeshStandardMaterial({ color: 0xFF8C00, metalness: 0.6, roughness: 0.4 }); // Dark Orange
        this.assets.grateGeo = new THREE.PlaneGeometry(1.5, 1.5);
        this.assets.grateMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, side: THREE.DoubleSide });
        this.assets.barrierGeo = new THREE.BoxGeometry(2, 1, 0.2);
        this.assets.barrierMat = new THREE.MeshStandardMaterial({ color: 0xFFCC00 }); // Yellow

        // Instanced Meshes (Max Counts Estimated)
        this.instanced = {};
        
        // Street Lights
        this.instanced.poles = new THREE.InstancedMesh(this.assets.poleGeo, this.assets.poleMat, 1000);
        this.instanced.lamps = new THREE.InstancedMesh(this.assets.lampGeo, this.assets.lampMat, 1000);
        
        // Traffic Lights
        this.instanced.tlPoles = new THREE.InstancedMesh(this.assets.tlPoleGeo, this.assets.poleMat, 200);
        this.instanced.tlBoxes = new THREE.InstancedMesh(this.assets.tlBoxGeo, this.assets.tlBoxMat, 200);
        this.instanced.tlReds = new THREE.InstancedMesh(this.assets.tlLightGeo, this.assets.redMat, 200);
        this.instanced.tlYellows = new THREE.InstancedMesh(this.assets.tlLightGeo, this.assets.yellowMat, 200);
        this.instanced.tlGreens = new THREE.InstancedMesh(this.assets.tlLightGeo, this.assets.greenMat, 200);
        
        // Rubble
        this.instanced.rubble = new THREE.InstancedMesh(this.assets.rubbleGeo, this.assets.rubbleMat, 500);

        // Props
        this.instanced.benches = new THREE.InstancedMesh(this.assets.benchGeo, this.assets.benchMat, 200);
        this.instanced.trashCans = new THREE.InstancedMesh(this.assets.trashGeo, this.assets.trashMat, 200);
        this.instanced.hydrants = new THREE.InstancedMesh(this.assets.hydrantGeo, this.assets.hydrantMat, 100);
        this.instanced.carWrecks = new THREE.InstancedMesh(this.assets.carWreckGeo, this.assets.carWreckMat, 50);
        this.instanced.sewerGrates = new THREE.InstancedMesh(this.assets.grateGeo, this.assets.grateMat, 100);
    }

    generate() {
        // Ground - Concrete/Asphalt Base
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.ground = ground;

        // Reset Instance Counts
        for (const key in this.instanced) {
            this.instanced[key].count = 0;
            this.scene.add(this.instanced[key]);
            // Add to props for cleanup if BaseMap disposes props
            this.props.push(this.instanced[key]); 
        }
        
        this.sewerGratePositions = []; // Store for steam particles

        // City Grid Generation
        const blockSize = 20;
        const roadWidth = 5; // Reduced for cramped city feel
        const gridSize = 6; // 6x6 grid of blocks
        const offset = (gridSize * (blockSize + roadWidth)) / 2;

        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                const bx = x * (blockSize + roadWidth) - offset;
                const bz = z * (blockSize + roadWidth) - offset;

                // Create a City Block
                // Check for Park Location (Center-ish)
                if (x === 2 && z === 3) {
                    // Pass center of the block
                    this.createPark(bx + blockSize / 2, bz + blockSize / 2, blockSize);
                } 
                // Check for Construction Site (Opposite Park)
                else if (x === 3 && z === 2) {
                    this.createConstructionSite(bx + blockSize / 2, bz + blockSize / 2, blockSize);
                }
                else {
                    this.createCityBlock(bx, bz, blockSize);
                }
            }
        }

        // Roads
        this.createRoads(gridSize, blockSize, roadWidth, offset);

        // Road debris/obstacles
        this.createRoadDebris(gridSize, blockSize, roadWidth, offset);
        this.createCarWrecks(gridSize, blockSize, roadWidth, offset);

        // Atmospheric elements
        this.createStreetLights(gridSize, blockSize, roadWidth, offset);
        this.createTrafficLights(gridSize, blockSize, roadWidth, offset);
        this.createSidewalkProps(gridSize, blockSize, roadWidth, offset);
        this.createSewerGrates(gridSize, blockSize, roadWidth, offset);

        // Extraction Zone - Convenience Store
        this.createConvenienceStore(15, 15);
        
        // Update Instance Matrices
        for (const key in this.instanced) {
            this.instanced[key].instanceMatrix.needsUpdate = true;
        }
    }
    
    update(deltaTime) {
        // Emit steam from sewer grates
        if (this.sewerGratePositions) {
            this.sewerGratePositions.forEach(pos => {
                if (Math.random() > 0.95) { // Occasional puff
                    // Use 'dust' for now, maybe add 'steam' later
                    // Emit slightly above ground
                    const p = pos.clone();
                    p.y += 0.2;
                    p.x += (Math.random() - 0.5) * 0.5;
                    p.z += (Math.random() - 0.5) * 0.5;
                    this.particleSystem.emit(p, 'dust', 1); 
                }
            });
        }
    }

    createConstructionSite(x, z, size) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Dirt Ground
        const dirtGeo = new THREE.PlaneGeometry(size, size);
        const dirtMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 1.0 });
        const dirt = new THREE.Mesh(dirtGeo, dirtMat);
        dirt.rotation.x = -Math.PI / 2;
        dirt.position.y = 0.06; // Above road/sidewalk
        dirt.receiveShadow = true;
        group.add(dirt);

        // Steel Framework (Grid of girders)
        const girderHeight = 8;
        const spacing = 6;
        
        for (let gx = -size/2 + 2; gx < size/2; gx += spacing) {
            for (let gz = -size/2 + 2; gz < size/2; gz += spacing) {
                // Vertical Column
                const col = new THREE.Mesh(this.assets.girderGeo, this.assets.girderMat);
                col.scale.set(2, girderHeight, 2);
                col.position.set(gx, girderHeight/2, gz);
                col.castShadow = true;
                group.add(col);
                
                // Horizontal Beams (Top)
                if (gx + spacing < size/2) {
                    const beamX = new THREE.Mesh(this.assets.girderGeo, this.assets.girderMat);
                    beamX.scale.set(spacing * 5, 1, 1); // Stretch X
                    beamX.rotation.z = Math.PI / 2;
                    beamX.position.set(gx + spacing/2, girderHeight, gz);
                    group.add(beamX);
                }
                if (gz + spacing < size/2) {
                    const beamZ = new THREE.Mesh(this.assets.girderGeo, this.assets.girderMat);
                    beamZ.scale.set(spacing * 5, 1, 1); // Stretch (rotated to Z)
                    beamZ.rotation.x = Math.PI / 2;
                    beamZ.position.set(gx, girderHeight, gz + spacing/2);
                    group.add(beamZ);
                }
            }
        }

        // Unfinished Wall (Brick)
        const wallGeo = new THREE.BoxGeometry(1, 1, 1);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.scale.set(size * 0.6, 4, 0.5);
        wall.position.set(0, 2, -size/3);
        wall.castShadow = true;
        group.add(wall);

        // Crane Base (Yellow)
        const craneBase = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), this.assets.barrierMat);
        craneBase.position.set(-size/3, 2, size/3);
        craneBase.castShadow = true;
        group.add(craneBase);
        
        // Crane Arm
        const craneArm = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), this.assets.barrierMat);
        craneArm.position.set(-size/3, 4, size/3 + 3);
        craneArm.rotation.x = -Math.PI / 6;
        craneArm.castShadow = true;
        group.add(craneArm);

        // Barriers around perimeter
        const barrierCount = 8;
        for (let i = 0; i < barrierCount; i++) {
            // Front
            const b1 = new THREE.Mesh(this.assets.barrierGeo, this.assets.barrierMat);
            b1.position.set((i - barrierCount/2) * 2.5, 0.5, size/2 - 1);
            group.add(b1);
            
            // Back
            const b2 = new THREE.Mesh(this.assets.barrierGeo, this.assets.barrierMat);
            b2.position.set((i - barrierCount/2) * 2.5, 0.5, -size/2 + 1);
            group.add(b2);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(size, 10, size));
    }

    createSewerGrates(gridSize, blockSize, roadWidth, offset) {
        const dummy = new THREE.Object3D();
        
        const addGrate = (x, z) => {
            if (this.instanced.sewerGrates.count >= this.instanced.sewerGrates.instanceMatrix.count) return;
            
            dummy.position.set(x, 0.02, z); // Just above road
            dummy.rotation.x = -Math.PI / 2;
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            
            const idx = this.instanced.sewerGrates.count++;
            this.instanced.sewerGrates.setMatrixAt(idx, dummy.matrix);
            
            this.sewerGratePositions.push(new THREE.Vector3(x, 0, z));
        };

        // Place randomly on roads
        // Vertical roads
        for (let x = 0; x < gridSize - 1; x++) {
            const rx = (x * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            for (let z = -offset; z < offset; z += 20) {
                if (Math.random() < 0.4) {
                    // Offset slightly from center of road
                    const sideOffset = (Math.random() - 0.5) * 2; 
                    addGrate(rx + sideOffset, z + Math.random() * 5);
                }
            }
        }
        
        // Horizontal roads
        for (let z = 0; z < gridSize - 1; z++) {
            const rz = (z * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            for (let x = -offset; x < offset; x += 20) {
                if (Math.random() < 0.4) {
                    const sideOffset = (Math.random() - 0.5) * 2;
                    addGrate(x + Math.random() * 5, rz + sideOffset);
                }
            }
        }
    }

    createSidewalkProps(gridSize, blockSize, roadWidth, offset) {
        const dummy = new THREE.Object3D();
        
        const addProp = (meshName, x, z, rotY = 0) => {
            if (this.instanced[meshName].count >= this.instanced[meshName].instanceMatrix.count) return;
            
            dummy.position.set(x, 0, z);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(1, 1, 1);
            
            // Adjust height for specific props
            if (meshName === 'benches') dummy.position.y = 0.2;
            if (meshName === 'trashCans') dummy.position.y = 0.4;
            if (meshName === 'hydrants') dummy.position.y = 0.3;

            dummy.updateMatrix();
            const idx = this.instanced[meshName].count++;
            this.instanced[meshName].setMatrixAt(idx, dummy.matrix);
        };

        // Iterate roads similar to street lights
        // Vertical roads
        for (let x = 0; x < gridSize - 1; x++) {
            const rx = (x * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            
            for (let z = -offset; z < offset; z += 15) {
                // Left Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', rx - roadWidth/2 - 0.5, z + 2);
                if (Math.random() < 0.2) addProp('hydrants', rx - roadWidth/2 - 0.5, z + 5);
                if (Math.random() < 0.2) addProp('benches', rx - roadWidth/2 - 1.0, z + 8, Math.PI/2);

                // Right Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', rx + roadWidth/2 + 0.5, z - 2);
                if (Math.random() < 0.2) addProp('hydrants', rx + roadWidth/2 + 0.5, z - 5);
                if (Math.random() < 0.2) addProp('benches', rx + roadWidth/2 + 1.0, z - 8, -Math.PI/2);
            }
        }

        // Horizontal roads
        for (let z = 0; z < gridSize - 1; z++) {
            const rz = (z * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            
            for (let x = -offset; x < offset; x += 15) {
                // Top Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', x + 2, rz - roadWidth/2 - 0.5);
                if (Math.random() < 0.2) addProp('hydrants', x + 5, rz - roadWidth/2 - 0.5);
                if (Math.random() < 0.2) addProp('benches', x + 8, rz - roadWidth/2 - 1.0, 0);

                // Bottom Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', x - 2, rz + roadWidth/2 + 0.5);
                if (Math.random() < 0.2) addProp('hydrants', x - 5, rz + roadWidth/2 + 0.5);
                if (Math.random() < 0.2) addProp('benches', x - 8, rz + roadWidth/2 + 1.0, Math.PI);
            }
        }
    }

    createCarWrecks(gridSize, blockSize, roadWidth, offset) {
        const dummy = new THREE.Object3D();
        const wreckCount = 15;
        
        for (let i = 0; i < wreckCount; i++) {
            // Random position on road
            const isVertical = Math.random() < 0.5;
            let x, z, rot;
            
            if (isVertical) {
                const roadIdx = Math.floor(Math.random() * (gridSize - 1));
                x = (roadIdx * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
                z = (Math.random() - 0.5) * offset * 2;
                rot = (Math.random() - 0.5) * 0.5; // Slight angle
            } else {
                const roadIdx = Math.floor(Math.random() * (gridSize - 1));
                z = (roadIdx * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
                x = (Math.random() - 0.5) * offset * 2;
                rot = Math.PI/2 + (Math.random() - 0.5) * 0.5;
            }

            // Avoid spawn (0,0)
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;

            dummy.position.set(x, 0.25, z);
            dummy.rotation.set(Math.random() * 0.1, rot, Math.random() * 0.1); // Tilted
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            
            if (this.instanced.carWrecks.count < 50) {
                const idx = this.instanced.carWrecks.count++;
                this.instanced.carWrecks.setMatrixAt(idx, dummy.matrix);
                
                // Add collision
                const collider = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 1, 2.0),
                    new THREE.MeshBasicMaterial({ visible: false })
                );
                collider.position.set(x, 0.5, z);
                collider.rotation.y = rot;
                this.scene.add(collider);
                this.props.push(collider);
                // Use addCollisionBox to ensure Player collides with it
                this.addCollisionBox(collider, new THREE.Vector3(1.2, 1, 2.0));
            }
        }
    }

    createPark(x, z, size) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Grass Base
        const grassGeo = new THREE.PlaneGeometry(size, size);
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 1.0 });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = 0.08; // Slightly above road to prevent Z-fighting
        grass.receiveShadow = true;
        group.add(grass);

        // Fountain in center
        const fBase = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 0.5, 16),
            new THREE.MeshStandardMaterial({ color: 0xAAAAAA })
        );
        fBase.position.y = 0.25;
        fBase.castShadow = true;
        group.add(fBase);

        const fWater = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x4444FF, roughness: 0.1 })
        );
        fWater.position.y = 0.5;
        group.add(fWater);
        
        const fSpout = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0xAAAAAA })
        );
        fSpout.position.y = 1.0;
        fSpout.castShadow = true;
        group.add(fSpout);

        // Trees
        const treeCount = 8;
        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2;
            const r = size * 0.35;
            const tx = Math.cos(angle) * r;
            const tz = Math.sin(angle) * r;
            
            const trunk = new THREE.Mesh(this.assets.treeTrunkGeo, this.assets.treeTrunkMat);
            trunk.position.set(tx, 0.5, tz);
            trunk.castShadow = true;
            group.add(trunk);
            
            const leaves = new THREE.Mesh(this.assets.treeLeavesGeo, this.assets.treeLeavesMat);
            leaves.position.set(tx, 2.0, tz);
            leaves.castShadow = true;
            group.add(leaves);
        }

        // Benches (using InstancedMesh for these would be tricky inside a group, 
        // so we'll just add simple meshes here or use the instanced ones if we calculate world pos.
        // Simpler to just add meshes for the park since it's unique)
        const benchGeo = new THREE.BoxGeometry(1.5, 0.4, 0.5);
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
        
        const b1 = new THREE.Mesh(benchGeo, benchMat);
        b1.position.set(3, 0.2, 3);
        b1.rotation.y = -Math.PI / 4;
        b1.castShadow = true;
        group.add(b1);

        const b2 = new THREE.Mesh(benchGeo, benchMat);
        b2.position.set(-3, 0.2, 3);
        b2.rotation.y = Math.PI / 4;
        b2.castShadow = true;
        group.add(b2);

        this.scene.add(group);
        this.props.push(group);
        
        // Collision for Fountain (World Space)
        // We create a separate collider because fBase is local to group
        const fCollider = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2, 4),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        fCollider.position.set(x, 1, z); // Center of park
        this.scene.add(fCollider);
        this.props.push(fCollider);
        this.addCollisionBox(fCollider, new THREE.Vector3(4, 2, 4));
    }

    createStreetLights(gridSize, blockSize, roadWidth, offset) {
        const lightHeight = 4;
        const dummy = new THREE.Object3D();
        
        let poleIdx = this.instanced.poles.count;
        let lampIdx = this.instanced.lamps.count;

        const addLight = (x, z) => {
            // Pole
            dummy.position.set(x, lightHeight/2, z);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            this.instanced.poles.setMatrixAt(poleIdx++, dummy.matrix);
            
            // Lamp
            dummy.position.set(x, lightHeight, z);
            dummy.updateMatrix();
            this.instanced.lamps.setMatrixAt(lampIdx++, dummy.matrix);
        };

        // Vertical roads
        for (let x = 0; x < gridSize - 1; x++) {
            const rx = (x * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            
            // Place lights along the road every 10 units
            for (let z = -offset; z < offset; z += 10) {
                addLight(rx - roadWidth/2 + 0.5, z); // Left
                addLight(rx + roadWidth/2 - 0.5, z); // Right
            }
        }

        // Horizontal roads
        for (let z = 0; z < gridSize - 1; z++) {
            const rz = (z * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            
            for (let x = -offset; x < offset; x += 10) {
                addLight(x, rz - roadWidth/2 + 0.5); // Top
                addLight(x, rz + roadWidth/2 - 0.5); // Bottom
            }
        }
        
        this.instanced.poles.count = poleIdx;
        this.instanced.lamps.count = lampIdx;
    }

    createTrafficLights(gridSize, blockSize, roadWidth, offset) {
        const poleHeight = 3.5;
        const dummy = new THREE.Object3D();
        
        let poleIdx = this.instanced.tlPoles.count;
        let boxIdx = this.instanced.tlBoxes.count;
        let redIdx = this.instanced.tlReds.count;
        let yellowIdx = this.instanced.tlYellows.count;
        let greenIdx = this.instanced.tlGreens.count;

        // Calculate intersection positions
        const verticalRoadPositions = [];
        const horizontalRoadPositions = [];
        
        for (let x = 0; x < gridSize - 1; x++) {
            verticalRoadPositions.push((x * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2);
        }
        
        for (let z = 0; z < gridSize - 1; z++) {
            horizontalRoadPositions.push((z * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2);
        }

        // Place traffic lights at intersections
        for (let vx of verticalRoadPositions) {
            for (let hz of horizontalRoadPositions) {
                const x = vx + roadWidth/2;
                const z = hz + roadWidth/2;
                
                // Pole
                dummy.position.set(x, poleHeight/2, z);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(1, 1, 1);
                dummy.updateMatrix();
                this.instanced.tlPoles.setMatrixAt(poleIdx++, dummy.matrix);
                
                // Box
                dummy.position.set(x, poleHeight, z);
                dummy.updateMatrix();
                this.instanced.tlBoxes.setMatrixAt(boxIdx++, dummy.matrix);
                
                // Lights (Red, Yellow, Green)
                // Red
                dummy.position.set(x, poleHeight + 0.25, z + 0.11);
                dummy.updateMatrix();
                this.instanced.tlReds.setMatrixAt(redIdx++, dummy.matrix);
                
                // Yellow
                dummy.position.set(x, poleHeight, z + 0.11);
                dummy.updateMatrix();
                this.instanced.tlYellows.setMatrixAt(yellowIdx++, dummy.matrix);
                
                // Green
                dummy.position.set(x, poleHeight - 0.25, z + 0.11);
                dummy.updateMatrix();
                this.instanced.tlGreens.setMatrixAt(greenIdx++, dummy.matrix);
            }
        }
        
        this.instanced.tlPoles.count = poleIdx;
        this.instanced.tlBoxes.count = boxIdx;
        this.instanced.tlReds.count = redIdx;
        this.instanced.tlYellows.count = yellowIdx;
        this.instanced.tlGreens.count = greenIdx;
    }

    createRoadDebris(gridSize, blockSize, roadWidth, offset) {
        // Place rubble on roads as obstacles
        const debrisCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < debrisCount; i++) {
            // Random position on the road network
            const isVerticalRoad = Math.random() < 0.5;
            let rx, rz;
            
            if (isVerticalRoad && gridSize > 1) {
                const roadIndex = Math.floor(Math.random() * (gridSize - 1));
                rx = (roadIndex * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
                rz = (Math.random() - 0.5) * offset * 2;
            } else if (gridSize > 1) {
                const roadIndex = Math.floor(Math.random() * (gridSize - 1));
                rz = (roadIndex * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
                rx = (Math.random() - 0.5) * offset * 2;
            }
            
            if (rx !== undefined) {
                this.createRubble(rx, rz);
            }
        }
    }
    
    createRubble(x, z) {
        // Use Instanced Rubble if possible, but we also need collision.
        // For now, we'll add to instanced mesh AND create a collision box (invisible or just use the position).
        // Since BaseMap handles collision via `this.obstacles`, we might need a separate collision mesh or just a bounding box.
        // The original createRubble (not shown in previous view_file, but inferred) likely added a mesh to props and obstacles.
        
        // Let's check if we can just use the instanced mesh for visuals and add a simple invisible box for collision.
        
        const dummy = new THREE.Object3D();
        dummy.position.set(x, 0.25, z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.scale.setScalar(0.8 + Math.random() * 0.5);
        dummy.updateMatrix();
        
        const idx = this.instanced.rubble.count++;
        this.instanced.rubble.setMatrixAt(idx, dummy.matrix);
        
        // Collision
        // We need to add something to this.obstacles for the player to collide with.
        // BaseMap usually expects meshes in obstacles.
        // We can create a simple invisible box.
        const collider = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        collider.position.set(x, 0.5, z);
        this.scene.add(collider);
        this.props.push(collider); // For cleanup
        
        // Assuming BaseMap has an obstacles array or we need to push to it.
        // Looking at Game.js, it uses this.world.walls (which are usually buildings).
        // Debris might just be visual or minor obstacles.
        // If they are obstacles, we should add them.
        // Let's assume we need to add to a list.
        // In the original code, createRubble wasn't fully visible but likely added to scene.
        // I'll add the collider to props.
        
        // Note: If `createRubble` was used by `createRuinedBuilding`, that one creates individual meshes.
        // `createRuinedBuilding` calls `createRubble`? No, it has "Enhanced debris at base" loop which creates meshes manually.
        // I should update `createRuinedBuilding` to use instanced rubble too if possible, but that's local to the building group.
        // InstancedMesh is world-space. It's hard to attach to a group.
        // So for `createRuinedBuilding`, we might keep individual meshes OR calculate world pos.
        // Calculating world pos is complex during generation if groups are used.
        // So I will leave `createRuinedBuilding` debris as is (local meshes) and only use InstancedMesh for the road debris.
    }


    createCityBlock(x, z, size) {
        // A block consists of 1-4 buildings
        const subdivisions = 2;
        const subSize = size / subdivisions;
        
        // Extraction zone position
        const extractionX = 15;
        const extractionZ = 15;
        const extractionRadius = 10; // Exclusion radius

        for (let i = 0; i < subdivisions; i++) {
            for (let j = 0; j < subdivisions; j++) {
                const sx = x + i * subSize + subSize/2;
                const sz = z + j * subSize + subSize/2;
                
                // Check distance to extraction zone
                const distToExtraction = Math.sqrt(
                    Math.pow(sx - extractionX, 2) + Math.pow(sz - extractionZ, 2)
                );
                
                // Skip if too close to extraction zone
                if (distToExtraction < extractionRadius) {
                    continue;
                }
                
                // Always create a building (no more empty lots)
                this.createBuilding(sx, sz, subSize - 2);
            }
        }
    }

    createBuilding(x, z, width) {
        const type = Math.random();
        
        // Core buildings (50%)
        if (type < 0.20) {
            this.createStandardBuilding(x, z, width);
        } else if (type < 0.40) {
            this.createSteppedBuilding(x, z, width);
        } else if (type < 0.50) {
            this.createWideBuilding(x, z, width);
        // Specialty buildings (50%)
        } else if (type < 0.56) {
            this.createTwinTowers(x, z, width);
        } else if (type < 0.61) {
            this.createGasStation(x, z, width);
        } else if (type < 0.66) {
            this.createParkingGarage(x, z, width);
        } else if (type < 0.71) {
            this.createDomeBuilding(x, z, width);
        } else if (type < 0.76) {
            this.createLShapedBuilding(x, z, width);
        } else if (type < 0.81) {
            this.createRadioTower(x, z, width);
        } else if (type < 0.85) {
            this.createWaterTower(x, z, width);
        } else if (type < 0.89) {
            this.createShoppingMall(x, z, width);
        } else if (type < 0.93) {
            this.createWarehouse(x, z, width);
        } else if (type < 0.97) {
            this.createFactory(x, z, width);
        } else {
            this.createRuinedBuilding(x, z, width);
        }
    }

    createStandardBuilding(x, z, width) {
        const height = 5 + Math.random() * 10;
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const building = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        building.position.y = height / 2;
        building.scale.set(width, height, width);
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);

        this.addWindows(group, width, height, width);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width));
        
        // Random neon sign (30% chance)
        if (Math.random() < 0.3) {
            this.addNeonSign(group, width, height);
        }
        
        // Random billboard on top (20% chance)
        if (Math.random() < 0.2) {
            this.addBillboard(group, width, height);
        }
    }

    createSteppedBuilding(x, z, width) {
        const height = 8 + Math.random() * 12;
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Base
        const baseHeight = height * 0.4;
        const base = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        base.position.y = baseHeight / 2;
        base.scale.set(width, baseHeight, width);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Top
        const topHeight = height * 0.6;
        const topWidth = width * 0.6;
        const top = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        top.position.y = baseHeight + topHeight / 2;
        top.scale.set(topWidth, topHeight, topWidth);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);

        this.addWindows(group, width, baseHeight, width, 0);
        this.addWindows(group, topWidth, topHeight, topWidth, baseHeight);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width)); // Simplified collision
        
        // Random neon sign on stepped buildings (25% chance)
        if (Math.random() < 0.25) {
            this.addNeonSign(group, width, baseHeight);
        }
    }

    createTwinTowers(x, z, width) {
        const height = 10 + Math.random() * 10;
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Podium
        const podiumHeight = 2;
        const podium = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        podium.position.y = podiumHeight / 2;
        podium.scale.set(width, podiumHeight, width);
        podium.castShadow = true;
        podium.receiveShadow = true;
        group.add(podium);

        // Towers
        const towerWidth = width * 0.35;
        const towerHeight = height - podiumHeight;
        
        // Tower 1 Group
        const t1Group = new THREE.Group();
        t1Group.position.set(-width/4, podiumHeight, -width/4);
        group.add(t1Group);

        const t1 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        t1.position.y = towerHeight/2;
        t1.scale.set(towerWidth, towerHeight, towerWidth);
        t1.castShadow = true;
        t1.receiveShadow = true;
        t1Group.add(t1);

        // Windows for Tower 1
        this.addWindows(t1Group, towerWidth, towerHeight, towerWidth, 0);

        // Tower 2 Group
        const t2Group = new THREE.Group();
        t2Group.position.set(width/4, podiumHeight, width/4);
        group.add(t2Group);

        const t2 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        t2.position.y = towerHeight/2;
        t2.scale.set(towerWidth, towerHeight, towerWidth);
        t2.castShadow = true;
        t2.receiveShadow = true;
        t2Group.add(t2);

        // Windows for Tower 2
        this.addWindows(t2Group, towerWidth, towerHeight, towerWidth, 0);

        // Skybridge
        const bridgeHeight = 1.5;
        const bridgeY = towerHeight * 0.66;
        // Calculate distance and angle between towers
        const dx = (width/4) - (-width/4); // width/2
        const dz = (width/4) - (-width/4); // width/2
        const dist = Math.sqrt(dx*dx + dz*dz); // sqrt( (w/2)^2 + (w/2)^2 ) = sqrt(2 * (w/2)^2) = sqrt(2) * w/2
        // Towers are at (-w/4, -w/4) and (w/4, w/4). The line connecting them is at 45 degrees to Z-axis.
        // So rotation.y should be Math.PI/4.

        const bridge = new THREE.Mesh(this.assets.buildingGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 }));
        bridge.position.set(0, podiumHeight + bridgeY, 0);
        bridge.rotation.y = Math.PI/4; 
        bridge.scale.set(dist, bridgeHeight, towerWidth * 0.6);
        bridge.castShadow = true;
        group.add(bridge);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width));
    }

    createWideBuilding(x, z, width) {
        const height = 3 + Math.random() * 3; // Short
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const building = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        building.position.y = height / 2;
        building.scale.set(width, height, width); // Full width
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);
        
        // Roof detail
        const roof = new THREE.Mesh(this.assets.buildingGeo, this.assets.asphaltMat);
        roof.position.y = height + 0.1;
        roof.scale.set(width * 0.9, 0.2, width * 0.9);
        group.add(roof);

        this.addWindows(group, width, height, width);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width));
    }

    createGasStation(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Office Building (small)
        const officeHeight = 3.5;
        const officeWidth = width * 0.35;
        const office = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        office.position.set(-width/3.5, officeHeight/2, -width/3.5);
        office.scale.set(officeWidth, officeHeight, officeWidth);
        office.castShadow = true;
        office.receiveShadow = true;
        group.add(office);

        // Office Door
        const doorGeo = new THREE.PlaneGeometry(1.2, 2.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(-width/3.5 + officeWidth/2 + 0.05, 1.1, -width/3.5);
        door.rotation.y = Math.PI/2;
        group.add(door);

        // Office Window
        const winGeo = new THREE.PlaneGeometry(2, 1.5);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x88CCFF, emissive: 0x112244, roughness: 0.2 });
        const windowMesh = new THREE.Mesh(winGeo, winMat);
        windowMesh.position.set(-width/3.5, 2, -width/3.5 + officeWidth/2 + 0.05);
        group.add(windowMesh);

        // Canopy
        const canopyHeight = 0.5;
        const canopyY = 4.5;
        const canopyWidth = width * 0.8;
        const canopyDepth = width * 0.5;
        
        const canopy = new THREE.Mesh(this.assets.buildingGeo, new THREE.MeshStandardMaterial({ color: 0xEEEEEE }));
        canopy.position.set(width/6, canopyY, width/6);
        canopy.scale.set(canopyWidth, canopyHeight, canopyDepth);
        canopy.castShadow = true;
        group.add(canopy);

        // Canopy Rim (Brand Color - Red)
        const rimGeo = new THREE.BoxGeometry(canopyWidth + 0.1, 0.6, canopyDepth + 0.1);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xCC0000 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(width/6, canopyY, width/6);
        group.add(rim);

        // Support Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, canopyY);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
        
        const pillarPositions = [
            [width/6 - canopyWidth/2 + 0.5, canopyY/2, width/6 - canopyDepth/2 + 0.5],
            [width/6 + canopyWidth/2 - 0.5, canopyY/2, width/6 - canopyDepth/2 + 0.5],
            [width/6 - canopyWidth/2 + 0.5, canopyY/2, width/6 + canopyDepth/2 - 0.5],
            [width/6 + canopyWidth/2 - 0.5, canopyY/2, width/6 + canopyDepth/2 - 0.5]
        ];

        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(...pos);
            pillar.castShadow = true;
            group.add(pillar);
        });

        // Pump Islands
        const islandGeo = new THREE.BoxGeometry(2.5, 0.2, 1.2);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x999999 });
        
        const pumpPositions = [
            [width/6 - 2, 0.1, width/6],
            [width/6 + 2, 0.1, width/6]
        ];

        pumpPositions.forEach(pos => {
            // Island
            const island = new THREE.Mesh(islandGeo, islandMat);
            island.position.set(...pos);
            island.receiveShadow = true;
            group.add(island);

            // Pump Body
            const pumpGeo = new THREE.BoxGeometry(0.8, 1.8, 0.5);
            const pumpMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const pump = new THREE.Mesh(pumpGeo, pumpMat);
            pump.position.set(pos[0], 1.0, pos[2]);
            pump.castShadow = true;
            group.add(pump);

            // Pump Screen (Black)
            const screenGeo = new THREE.PlaneGeometry(0.5, 0.4);
            const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const screen = new THREE.Mesh(screenGeo, screenMat);
            screen.position.set(pos[0], 1.4, pos[2] + 0.26);
            group.add(screen);
            const screen2 = screen.clone();
            screen2.rotation.y = Math.PI;
            screen2.position.z = pos[2] - 0.26;
            group.add(screen2);
        });

        // Price Sign (Tall)
        const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(width/2 - 1, 4, -width/2 + 1);
        pole.castShadow = true;
        group.add(pole);

        const signGeo = new THREE.BoxGeometry(2.5, 1.5, 0.3);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(width/2 - 1, 7, -width/2 + 1);
        sign.castShadow = true;
        group.add(sign);

        // Sign Border
        const signRimGeo = new THREE.BoxGeometry(2.6, 1.6, 0.2);
        const signRim = new THREE.Mesh(signRimGeo, rimMat);
        signRim.position.set(width/2 - 1, 7, -width/2 + 1);
        group.add(signRim);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, canopyY + canopyHeight, width));
    }

    createDomeBuilding(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Base Building
        const baseHeight = 4;
        const base = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        base.position.y = baseHeight / 2;
        base.scale.set(width, baseHeight, width);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Pillars (Classic look)
        const pillarCount = 4;
        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, baseHeight);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
        
        // Front pillars
        for(let i=0; i<pillarCount; i++) {
            const p = new THREE.Mesh(pillarGeo, pillarMat);
            const px = (i - (pillarCount-1)/2) * (width/pillarCount);
            p.position.set(px, baseHeight/2, width/2 + 0.2);
            p.castShadow = true;
            group.add(p);
        }

        // Cornice (Ring below dome)
        const corniceGeo = new THREE.BoxGeometry(width + 0.5, 0.4, width + 0.5);
        const cornice = new THREE.Mesh(corniceGeo, pillarMat);
        cornice.position.y = baseHeight;
        cornice.castShadow = true;
        group.add(cornice);

        // Dome (using sphere)
        const domeRadius = width * 0.6;
        const domeGeo = new THREE.SphereGeometry(domeRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ 
            color: 0xAAAAFF, // Light purple/blue
            roughness: 0.3,
            metalness: 0.7
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = baseHeight;
        dome.castShadow = true;
        dome.receiveShadow = true;
        group.add(dome);

        // Add windows to base building
        this.addWindows(group, width, baseHeight, width, 0);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, baseHeight + domeRadius, width));
    }

    createLShapedBuilding(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
    
        const height = 8 + Math.random() * 8;
        const wingWidth = width * 0.4;
    
        // Wing 1 (horizontal)
        const wing1 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        wing1.position.set(-width/4, height/2, 0);
        wing1.scale.set(width * 0.5, height, width);
        wing1.castShadow = true;
        wing1.receiveShadow = true;
        group.add(wing1);

        // Wing 2 (vertical)
        const wing2 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        wing2.position.set(width/4, height/2, -width/4);
        wing2.scale.set(width * 0.5, height, width * 0.5);
        wing2.castShadow = true;
        wing2.receiveShadow = true;
        group.add(wing2);

        // Note: Windows omitted to prevent overlap with complex L-shape geometry

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width));
    }

    createWaterTower(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const towerHeight = 8;
        const tankHeight = 3;
        const tankRadius = width * 0.4;

        // Support Legs (4 corners)
        const legGeo = new THREE.CylinderGeometry(0.2, 0.3, towerHeight);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        
        const legPositions = [
            [-width/3, towerHeight/2, -width/3],
            [width/3, towerHeight/2, -width/3],
            [-width/3, towerHeight/2, width/3],
            [width/3, towerHeight/2, width/3]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos);
            leg.castShadow = true;
            group.add(leg);
        });

        // Tank (cylinder)
        const tankGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x88AACC, metalness: 0.6 });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.y = towerHeight + tankHeight/2;
        tank.castShadow = true;
        tank.receiveShadow = true;
        group.add(tank);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, towerHeight + tankHeight, width));
    }

    createWarehouse(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const height = 4 + Math.random() * 2; // Low-rise (4-6 units)
        const warehouseMat = new THREE.MeshStandardMaterial({ 
            color: 0xCC6633, // Rust/orange industrial color
            roughness: 0.8,
            metalness: 0.3
        });

        // Main warehouse body
        const body = new THREE.Mesh(this.assets.buildingGeo, warehouseMat);
        body.position.y = height / 2;
        body.scale.set(width, height, width);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Loading dock doors (3 large doors on one side)
        const doorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 3; i++) {
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(-width/3 + i * 2, 1.3, width/2 + 0.05);
            group.add(door);
        }

        // Rooftop vents/HVAC units
        const ventGeo = new THREE.BoxGeometry(1, 0.5, 1);
        const ventMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        
        const ventPositions = [
            [-width/4, height + 0.25, -width/4],
            [width/4, height + 0.25, width/4]
        ];

        ventPositions.forEach(pos => {
            const vent = new THREE.Mesh(ventGeo, ventMat);
            vent.position.set(...pos);
            vent.castShadow = true;
            group.add(vent);
        });

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width));
    }

    createRuinedBuilding(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const baseHeight = 6 + Math.random() * 6;
        const collapseAmount = 0.3 + Math.random() * 0.4;

        // Main ruined structure
        const building = new THREE.Mesh(this.assets.buildingGeo, this.assets.ruinMat);
        building.position.y = baseHeight * collapseAmount / 2;
        building.scale.set(width, baseHeight * collapseAmount, width);
        building.castShadow = true;
        building.receiveShadow = true;
        building.rotation.z = (Math.random() - 0.5) * 0.1;
        group.add(building);

        // Jagged broken top (multiple boxes at different heights)
        const topSectionCount = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < topSectionCount; i++) {
            const section = new THREE.Mesh(this.assets.buildingGeo, this.assets.ruinMat);
            const sectionHeight = (Math.random() * 2) + 1;
            section.position.set(
                (Math.random() - 0.5) * width * 0.8,
                baseHeight * collapseAmount + sectionHeight / 2,
                (Math.random() - 0.5) * width * 0.8
            );
            section.scale.set(
                width * 0.2 + Math.random() * width * 0.2,
                sectionHeight,
                width * 0.2 + Math.random() * width * 0.2
            );
            section.castShadow = true;
            group.add(section);
        }

        // Exposed rebar sticking out
        const rebarCount = 6 + Math.floor(Math.random() * 6);
        const rebarGeo = new THREE.CylinderGeometry(0.05, 0.05, 2);
        const rebarMat = new THREE.MeshStandardMaterial({ color: 0x553311, metalness: 0.8 });
        
        for (let i = 0; i < rebarCount; i++) {
            const rebar = new THREE.Mesh(rebarGeo, rebarMat);
            const angle = Math.random() * Math.PI * 2;
            const distance = width * 0.3 + Math.random() * width * 0.2;
            rebar.position.set(
                Math.cos(angle) * distance,
                baseHeight * collapseAmount + 0.5 + Math.random(),
                Math.sin(angle) * distance
            );
            rebar.rotation.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.5
            );
            group.add(rebar);
        }

        // Broken window frames (dark rectangles on walls)
        const windowCount = 8 + Math.floor(Math.random() * 8);
        const brokenWindowGeo = new THREE.BoxGeometry(0.8, 1.2, 0.1);
        const brokenWindowMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        for (let i = 0; i < windowCount; i++) {
            const window = new THREE.Mesh(brokenWindowGeo, brokenWindowMat);
            const side = Math.floor(Math.random() * 4);
            const heightPos = 1 + Math.random() * (baseHeight * collapseAmount - 2);
            
            if (side === 0) { // Front
                window.position.set((Math.random() - 0.5) * width * 0.8, heightPos, width/2 + 0.05);
            } else if (side === 1) { // Back
                window.position.set((Math.random() - 0.5) * width * 0.8, heightPos, -width/2 - 0.05);
            } else if (side === 2) { // Left
                window.position.set(-width/2 - 0.05, heightPos, (Math.random() - 0.5) * width * 0.8);
                window.rotation.y = Math.PI / 2;
            } else { // Right
                window.position.set(width/2 + 0.05, heightPos, (Math.random() - 0.5) * width * 0.8);
                window.rotation.y = Math.PI / 2;
            }
            group.add(window);
        }

        // Wall damage holes
        const holeCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < holeCount; i++) {
            const hole = new THREE.Mesh(this.assets.buildingGeo, this.assets.ruinMat);
            const holeSize = width * 0.2 + Math.random() * width * 0.2;
            hole.position.set(
                (Math.random() - 0.5) * width * 0.6,
                1 + Math.random() * (baseHeight * collapseAmount - 2),
                (Math.random() - 0.5) * width * 0.6
            );
            hole.scale.set(holeSize, holeSize * 0.8, holeSize);
            hole.rotation.set(
                (Math.random() - 0.5) * 0.3,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.3
            );
            hole.castShadow = true;
            group.add(hole);
        }

        // Enhanced debris at base
        const debrisCount = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < debrisCount; i++) {
            const debris = new THREE.Mesh(this.assets.rubbleGeo, this.assets.rubbleMat);
            debris.position.set(
                (Math.random() - 0.5) * width * 1.4,
                0.2 + Math.random() * 0.4,
                (Math.random() - 0.5) * width * 1.4
            );
            debris.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            debris.scale.setScalar(0.6 + Math.random() * 1.2);
            debris.castShadow = true;
            group.add(debris);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, baseHeight * collapseAmount + 2, width));
    }

    createParkingGarage(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const levels = 3 + Math.floor(Math.random() * 2); // 3-4 levels
        const levelHeight = 2.5;
        const totalHeight = levels * levelHeight;

        // Support columns at corners
        const columnGeo = new THREE.BoxGeometry(0.4, totalHeight, 0.4);
        const columnMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        
        const columnPositions = [
            [-width/2.5, totalHeight/2, -width/2.5],
            [width/2.5, totalHeight/2, -width/2.5],
            [-width/2.5, totalHeight/2, width/2.5],
            [width/2.5, totalHeight/2, width/2.5]
        ];

        columnPositions.forEach(pos => {
            const column = new THREE.Mesh(columnGeo, columnMat);
            column.position.set(...pos);
            column.castShadow = true;
            group.add(column);
        });

        // Floor slabs for each level
        const floorGeo = new THREE.BoxGeometry(width, 0.2, width);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        
        for (let i = 0; i <= levels; i++) {
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.position.y = i * levelHeight;
            floor.castShadow = true;
            floor.receiveShadow = true;
            group.add(floor);
        }

        // Perimeter walls (partial, for open garage feel)
        const wallGeo = new THREE.BoxGeometry(width, levelHeight * 0.3, 0.2);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
        
        for (let i = 0; i < levels; i++) {
            // Back wall
            const backWall = new THREE.Mesh(wallGeo, wallMat);
            backWall.position.set(0, i * levelHeight + levelHeight/2, -width/2);
            backWall.scale.set(1, 1, 1);
            group.add(backWall);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, totalHeight, width));
    }

    createRadioTower(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const towerHeight = 18 + Math.random() * 8; // Tall tower (18-26 units)
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7 });

        // Base building/shack
        const base = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        base.position.y = 1;
        base.scale.set(width * 0.4, 2, width * 0.4);
        base.castShadow = true;
        group.add(base);

        // Central tower spine (thin)
        const spineGeo = new THREE.BoxGeometry(0.3, towerHeight, 0.3);
        const spine = new THREE.Mesh(spineGeo, baseMat);
        spine.position.y = towerHeight / 2;
        spine.castShadow = true;
        group.add(spine);

        // Lattice cross-braces (creates tower structure look)
        const braceGeo = new THREE.BoxGeometry(0.1, 1, 2);
        const braceCount = Math.floor(towerHeight / 2);
        
        for (let i = 0; i < braceCount; i++) {
            const y = 2 + i * 2;
            const size = width * 0.3 * (1 - (i / braceCount) * 0.5); // Tapers toward top
            
            // X braces
            const brace1 = new THREE.Mesh(braceGeo, baseMat);
            brace1.position.set(0, y, 0);
            brace1.scale.set(0.1, 1, size);
            brace1.rotation.y = Math.PI / 4;
            group.add(brace1);
            
            const brace2 = new THREE.Mesh(braceGeo, baseMat);
            brace2.position.set(0, y, 0);
            brace2.scale.set(0.1, 1, size);
            brace2.rotation.y = -Math.PI / 4;
            group.add(brace2);
        }

        // Antenna on top
        const antennaGeo = new THREE.CylinderGeometry(0.05, 0.1, 3);
        const antenna = new THREE.Mesh(antennaGeo, baseMat);
        antenna.position.y = towerHeight + 1.5;
        group.add(antenna);

        // Red warning light
        const lightGeo = new THREE.SphereGeometry(0.2);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.y = towerHeight + 3;
        group.add(light);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width * 0.5, towerHeight, width * 0.5));
    }

    createShoppingMall(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const height = 5;
        
        // Main mall structure (wide and low)
        const mall = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        mall.position.y = height / 2;
        mall.scale.set(width, height, width);
        mall.castShadow = true;
        mall.receiveShadow = true;
        group.add(mall);

        // Glass facade sections (blue-tinted)
        const glassGeo = new THREE.BoxGeometry(width * 0.8, height * 0.6, 0.1);
        const glassMat = new THREE.MeshStandardMaterial({ 
            color: 0x88CCFF, 
            transparent: true, 
            opacity: 0.5,
            metalness: 0.9
        });
        
        const frontGlass = new THREE.Mesh(glassGeo, glassMat);
        frontGlass.position.set(0, height / 2, width/2 + 0.05);
        group.add(frontGlass);

        // Entrance canopy
        const canopyGeo = new THREE.BoxGeometry(width * 0.4, 0.2, 2);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 2, width/2 + 1);
        canopy.castShadow = true;
        group.add(canopy);

        // Signage (empty frame on top)
        const signGeo = new THREE.BoxGeometry(width * 0.6, 1, 0.2);
        const signMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, height + 0.5, width/2 - 0.5);
        group.add(sign);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, width));
    }

    createFactory(x, z, width) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const buildingHeight = 6;
        
        // Main factory building
        const factory = new THREE.Mesh(this.assets.buildingGeo, this.assets.ruinMat);
        factory.position.y = buildingHeight / 2;
        factory.scale.set(width, buildingHeight, width);
        factory.castShadow = true;
        factory.receiveShadow = true;
        group.add(factory);

        // Windows (Industrial style - fewer, larger)
        // We can use addWindows but maybe with different params if possible, or just standard
        this.addWindows(group, width, buildingHeight, width, 1); // Start higher up

        // Loading Dock
        const dockWidth = width * 0.4;
        const dockHeight = 1.5;
        const dockDepth = 2;
        const dock = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        dock.position.set(0, dockHeight/2, width/2 + dockDepth/2);
        dock.scale.set(dockWidth, dockHeight, dockDepth);
        dock.castShadow = true;
        dock.receiveShadow = true;
        group.add(dock);

        // Dock Door
        const doorGeo = new THREE.PlaneGeometry(dockWidth * 0.8, dockHeight * 0.8);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 }); // Metal door
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, dockHeight/2, width/2 + dockDepth + 0.05);
        group.add(door);

        // Smokestack (tall chimney)
        const stackHeight = 12 + Math.random() * 4;
        const stackGeo = new THREE.CylinderGeometry(0.5, 0.6, stackHeight);
        const stackMat = new THREE.MeshStandardMaterial({ color: 0x442222 }); // Dark red brick
        const stack = new THREE.Mesh(stackGeo, stackMat);
        stack.position.set(width * 0.3, stackHeight / 2, width * 0.3);
        stack.castShadow = true;
        group.add(stack);

        // Stack top rim
        const rimGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.3);
        const rim = new THREE.Mesh(rimGeo, stackMat);
        rim.position.set(width * 0.3, stackHeight + 0.15, width * 0.3);
        group.add(rim);

        // Industrial vents/pipes
        const pipeCount = 4 + Math.floor(Math.random() * 3);
        const pipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 4);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.6 });
        
        for (let i = 0; i < pipeCount; i++) {
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.position.set(
                (Math.random() - 0.5) * width * 0.7,
                buildingHeight + 1 + Math.random(),
                (Math.random() - 0.5) * width * 0.7
            );
            pipe.rotation.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.5
            );
            group.add(pipe);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, Math.max(buildingHeight, stackHeight), width));
    }

    addNeonSign(group, buildingWidth, buildingHeight) {
        const signWidth = 2 + Math.random() * 2;
        const signHeight = 0.8 + Math.random() * 0.6;
        const signGeo = new THREE.BoxGeometry(signWidth, signHeight, 0.1);
        
        // Random neon colors
        const colors = [0xFF00FF, 0x00FFFF, 0xFF0066, 0x00FF00, 0xFFFF00];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const signMat = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.8 + Math.random() * 0.4 // Flickering effect
        });
        
        const sign = new THREE.Mesh(signGeo, signMat);
        const side = Math.floor(Math.random() * 4);
        const yPos = buildingHeight * 0.3 + Math.random() * buildingHeight * 0.4;
        
        if (side === 0) { // Front
            sign.position.set(0, yPos, buildingWidth/2 + 0.06);
        } else if (side === 1) { // Back
            sign.position.set(0, yPos, -buildingWidth/2 - 0.06);
        } else if (side === 2) { // Left
            sign.position.set(-buildingWidth/2 - 0.06, yPos, 0);
            sign.rotation.y = Math.PI / 2;
        } else { // Right
            sign.position.set(buildingWidth/2 + 0.06, yPos, 0);
            sign.rotation.y = Math.PI / 2;
        }
        
        group.add(sign);
    }

    addBillboard(group, buildingWidth, buildingHeight) {
        const boardWidth = 4;
        const boardHeight = 2.5;
        const poleHeight = 1.5;
        
        // Support poles
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, poleHeight);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        
        const pole1 = new THREE.Mesh(poleGeo, poleMat);
        pole1.position.set(-boardWidth/3, buildingHeight + poleHeight/2, 0);
        group.add(pole1);
        
        const pole2 = new THREE.Mesh(poleGeo, poleMat);
        pole2.position.set(boardWidth/3, buildingHeight + poleHeight/2, 0);
        group.add(pole2);
        
        // Billboard board
        const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.1);
        const boardMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            emissive: 0x111111,
            emissiveIntensity: 0.2
        });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(0, buildingHeight + poleHeight + boardHeight/2, 0);
        group.add(board);
    }

    addWindows(group, width, height, depth, yOffset = 0) {
        const windowSize = 0.4;
        const spacing = 0.8;
        
        const rows = Math.floor((height - 1) / spacing);
        const colsX = Math.floor((width - 0.5) / spacing);
        const colsZ = Math.floor((depth - 0.5) / spacing);

        // Helper to create window mesh
        const createWindow = (x, y, z, sx, sy, sz) => {
            if (Math.random() > 0.3) { // 70% chance of window being lit/exist
                const win = new THREE.Mesh(this.assets.buildingGeo, this.assets.windowMat);
                win.position.set(x, y, z);
                win.scale.set(sx, sy, sz);
                group.add(win);
            }
        };

        for (let r = 0; r < rows; r++) {
            const y = yOffset + 1.0 + r * spacing;
            
            // Front/Back (Z faces)
            for (let c = 0; c < colsX; c++) {
                const x = -width/2 + 0.5 + c * spacing;
                // Front
                createWindow(x, y, depth/2 + 0.05, windowSize, windowSize, 0.1);
                // Back
                createWindow(x, y, -depth/2 - 0.05, windowSize, windowSize, 0.1);
            }

            // Left/Right (X faces)
            for (let c = 0; c < colsZ; c++) {
                const z = -depth/2 + 0.5 + c * spacing;
                // Right
                createWindow(width/2 + 0.05, y, z, 0.1, windowSize, windowSize);
                // Left
                createWindow(-width/2 - 0.05, y, z, 0.1, windowSize, windowSize);
            }
        }
    }

    createRoads(gridSize, blockSize, roadWidth, offset) {
        const sidewalkWidth = 1.5; // Widened
        const curbHeight = 0.15; // Lowered
        
        // Calculate all intersection positions
        const verticalRoadPositions = [];
        const horizontalRoadPositions = [];
        
        for (let x = 0; x < gridSize - 1; x++) {
            verticalRoadPositions.push((x * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2);
        }
        
        for (let z = 0; z < gridSize - 1; z++) {
            horizontalRoadPositions.push((z * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2);
        }
        
        // Vertical Roads (along Z axis)
        for (let x = 0; x < gridSize - 1; x++) {
            const rx = verticalRoadPositions[x];
            
            // Create sidewalk segments avoiding intersections
            let currentZ = -offset;
            
            for (let i = 0; i <= horizontalRoadPositions.length; i++) {
                const segmentStart = currentZ;
                const segmentEnd = i < horizontalRoadPositions.length 
                    ? horizontalRoadPositions[i] - roadWidth/2 - 1.0 // Leave gap for crosswalk
                    : offset;
                
                if (segmentEnd > segmentStart) {
                    const segmentLength = segmentEnd - segmentStart;
                    const segmentCenter = (segmentStart + segmentEnd) / 2;
                    
                    // Left sidewalk segment
                    const leftSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    leftSidewalk.position.set(rx - roadWidth/2 - sidewalkWidth/2, 0.05, segmentCenter); // Positioned OUTSIDE road
                    leftSidewalk.rotation.x = -Math.PI / 2;
                    leftSidewalk.scale.set(sidewalkWidth, segmentLength, 1);
                    this.scene.add(leftSidewalk);
                    this.props.push(leftSidewalk);
                    
                    // Left curb segment
                    const leftCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    leftCurb.position.set(rx - roadWidth/2, curbHeight/2, segmentCenter); // On edge of road
                    leftCurb.scale.set(0.1, curbHeight, segmentLength);
                    this.scene.add(leftCurb);
                    this.props.push(leftCurb);
                    
                    // Right sidewalk segment
                    const rightSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    rightSidewalk.position.set(rx + roadWidth/2 + sidewalkWidth/2, 0.05, segmentCenter); // Positioned OUTSIDE road
                    rightSidewalk.rotation.x = -Math.PI / 2;
                    rightSidewalk.scale.set(sidewalkWidth, segmentLength, 1);
                    this.scene.add(rightSidewalk);
                    this.props.push(rightSidewalk);
                    
                    // Right curb segment
                    const rightCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    rightCurb.position.set(rx + roadWidth/2, curbHeight/2, segmentCenter); // On edge of road
                    rightCurb.scale.set(0.1, curbHeight, segmentLength);
                    this.scene.add(rightCurb);
                    this.props.push(rightCurb);
                }
                
                if (i < horizontalRoadPositions.length) {
                    currentZ = horizontalRoadPositions[i] + roadWidth/2 + 1.0;
                }
            }
            
            // Yellow lane markings
            for (let z = -offset; z < offset; z += 4) {
                // Skip intersections
                let inIntersection = false;
                for (const hz of horizontalRoadPositions) {
                    if (Math.abs(z - hz) < roadWidth/2 + 3.0) inIntersection = true; // Increased gap
                }
                if (inIntersection) continue;

                const dash = new THREE.Mesh(this.assets.roadGeo, this.assets.yellowLineMat);
                dash.position.set(rx, 0.02, z);
                dash.rotation.x = -Math.PI / 2;
                dash.scale.set(0.2, 2, 1); // Thinner
                this.scene.add(dash);
                this.props.push(dash);
            }
        }

        // Horizontal Roads (along X axis)
        for (let z = 0; z < gridSize - 1; z++) {
            const rz = horizontalRoadPositions[z];
            
            // Create sidewalk segments avoiding intersections
            let currentX = -offset;
            
            for (let i = 0; i <= verticalRoadPositions.length; i++) {
                const segmentStart = currentX;
                const segmentEnd = i < verticalRoadPositions.length 
                    ? verticalRoadPositions[i] - roadWidth/2 - 1.0
                    : offset;
                
                if (segmentEnd > segmentStart) {
                    const segmentLength = segmentEnd - segmentStart;
                    const segmentCenter = (segmentStart + segmentEnd) / 2;
                    
                    // Top sidewalk segment
                    const topSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    topSidewalk.position.set(segmentCenter, 0.05, rz - roadWidth/2 - sidewalkWidth/2);
                    topSidewalk.rotation.x = -Math.PI / 2;
                    topSidewalk.scale.set(segmentLength, sidewalkWidth, 1);
                    this.scene.add(topSidewalk);
                    this.props.push(topSidewalk);
                    
                    // Top curb segment
                    const topCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    topCurb.position.set(segmentCenter, curbHeight/2, rz - roadWidth/2);
                    topCurb.scale.set(segmentLength, curbHeight, 0.1);
                    this.scene.add(topCurb);
                    this.props.push(topCurb);
                    
                    // Bottom sidewalk segment
                    const botSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    botSidewalk.position.set(segmentCenter, 0.05, rz + roadWidth/2 + sidewalkWidth/2);
                    botSidewalk.rotation.x = -Math.PI / 2;
                    botSidewalk.scale.set(segmentLength, sidewalkWidth, 1);
                    this.scene.add(botSidewalk);
                    this.props.push(botSidewalk);
                    
                    // Bottom curb segment
                    const botCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    botCurb.position.set(segmentCenter, curbHeight/2, rz + roadWidth/2);
                    botCurb.scale.set(segmentLength, curbHeight, 0.1);
                    this.scene.add(botCurb);
                    this.props.push(botCurb);
                }
                
                if (i < verticalRoadPositions.length) {
                    currentX = verticalRoadPositions[i] + roadWidth/2 + 1.0;
                }
            }

            // Yellow lane markings
            for (let x = -offset; x < offset; x += 4) {
                let inIntersection = false;
                for (const vx of verticalRoadPositions) {
                    if (Math.abs(x - vx) < roadWidth/2 + 3.0) inIntersection = true; // Increased gap
                }
                if (inIntersection) continue;

                const dash = new THREE.Mesh(this.assets.roadGeo, this.assets.yellowLineMat);
                dash.position.set(x, 0.02, rz);
                dash.rotation.x = -Math.PI / 2;
                dash.scale.set(2, 0.2, 1);
                this.scene.add(dash);
                this.props.push(dash);
            }
        }

        // Crosswalks & Intersections
        const zebraMat = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.9 });
        const stripeCount = 6;
        const stripeWidth = 0.4;
        const stripeGap = 0.4;
        const crosswalkLength = (stripeCount * stripeWidth) + ((stripeCount-1) * stripeGap);
        const crosswalkOffset = roadWidth/2 + 0.5 + crosswalkLength/2;

        // Intersection center patch (to ensure clean look)
        const intersectionGeo = new THREE.PlaneGeometry(roadWidth + 2, roadWidth + 2); // Slightly larger to cover corners
        const intersectionMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

        for (let x = 0; x < gridSize - 1; x++) {
            for (let z = 0; z < gridSize - 1; z++) {
                const ix = verticalRoadPositions[x];
                const iz = horizontalRoadPositions[z];

                // Intersection Patch
                const patch = new THREE.Mesh(intersectionGeo, intersectionMat);
                patch.rotation.x = -Math.PI / 2;
                patch.position.set(ix, 0.04, iz); // Below crosswalks
                this.scene.add(patch);
                this.props.push(patch);

                // 4 Crosswalks per intersection
                const positions = [
                    { x: ix, z: iz - crosswalkOffset, rot: 0 }, // Top
                    { x: ix, z: iz + crosswalkOffset, rot: 0 }, // Bottom
                    { x: ix - crosswalkOffset, z: iz, rot: Math.PI/2 }, // Left
                    { x: ix + crosswalkOffset, z: iz, rot: Math.PI/2 }  // Right
                ];

                positions.forEach(pos => {
                    const group = new THREE.Group();
                    group.position.set(pos.x, 0.05, pos.z); // Slightly higher
                    group.rotation.y = pos.rot;

                    for(let s=0; s<stripeCount; s++) {
                        const stripe = new THREE.Mesh(this.assets.roadGeo, zebraMat);
                        stripe.scale.set(roadWidth, stripeWidth, 1);
                        stripe.rotation.x = -Math.PI/2;
                        stripe.position.z = (s - stripeCount/2) * (stripeWidth + stripeGap) + (stripeWidth+stripeGap)/2;
                        group.add(stripe);
                    }
                    this.scene.add(group);
                    this.props.push(group);
                });
            }
        }
    }

    createRubble(x, z) {
        const mesh = new THREE.Mesh(this.assets.rubbleGeo, this.assets.rubbleMat);
        mesh.position.set(
            x + (Math.random() - 0.5) * 5,
            0.5,
            z + (Math.random() - 0.5) * 5
        );
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        mesh.scale.setScalar(0.5 + Math.random());
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.props.push(mesh);
        // Small rubble doesn't need collision usually, or simple box
        this.addCollisionBox(mesh, new THREE.Vector3(1, 1, 1));
    }

    createConvenienceStore(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const storeWidth = 8;
        const storeDepth = 6;
        const storeHeight = 4;

        // Main building
        const buildingGeo = new THREE.BoxGeometry(storeWidth, storeHeight, storeDepth);
        const buildingMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        building.position.y = storeHeight / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);

        // Green roof stripe (like 7-11)
        const roofStripeGeo = new THREE.BoxGeometry(storeWidth + 0.2, 0.6, storeDepth + 0.2);
        const roofStripeMat = new THREE.MeshStandardMaterial({ 
            color: 0x00AA00,
            emissive: 0x00AA00,
            emissiveIntensity: 0.3
        });
        const roofStripe = new THREE.Mesh(roofStripeGeo, roofStripeMat);
        roofStripe.position.y = storeHeight;
        group.add(roofStripe);

        // Glass storefront (bright interior)
        const glassGeo = new THREE.BoxGeometry(storeWidth - 1, storeHeight - 1, 0.1);
        const glassMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 1.0, // Very bright to simulate interior lights
            transparent: true,
            opacity: 0.8
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(0, storeHeight / 2, storeDepth/2 + 0.05);
        group.add(glass);

        // Glowing sign on top
        const signGeo = new THREE.BoxGeometry(storeWidth * 0.6, 0.8, 0.2);
        const signMat = new THREE.MeshStandardMaterial({ 
            color: 0x00FF00,
            emissive: 0x00FF00,
            emissiveIntensity: 1.2
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, storeHeight + 1, 0);
        group.add(sign);

        // Entrance canopy
        const canopyGeo = new THREE.BoxGeometry(storeWidth * 0.5, 0.2, 1.5);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x00CC00 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 2.5, storeDepth/2 + 0.8);
        canopy.castShadow = true;
        group.add(canopy);

        // Point light for extra glow
        const light = new THREE.PointLight(0xFFFFFF, 2, 20);
        light.position.set(0, storeHeight, 0);
        group.add(light);

        this.scene.add(group);
        this.extractionZone = group;
        this.extractionZoneRadius = Math.max(storeWidth, storeDepth) * 0.6;
    }
}
