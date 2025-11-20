/**
 * CityMap Class
 * ============================================================================
 * Procedurally generates a post-apocalyptic urban environment with buildings,
 * roads, props, and atmospheric elements. Uses a grid-based layout with varied
 * building types, instanced rendering for performance, and dynamic particle
 * effects. Features extraction zones, construction sites, parks, and city
 * infrastructure.
 * ============================================================================
 */

import * as THREE from 'three';
import { BaseMap } from './BaseMap.js';

export class CityMap extends BaseMap {
    constructor(scene, particleSystem) {
        super(scene, particleSystem);
        this.allowEnemies = true;      // Spawn enemies on city map
        this.allowItems = true;        // Spawn collectibles (canned food)
        this.loadAssets();             // Initialize geometries and materials
    }

    /**
     * Load all geometries, materials, and instanced meshes for the city
     * Pre-creates shared assets to improve performance through reuse
     * Uses InstancedMesh for props to render thousands of objects efficiently
     */
    loadAssets() {
        this.assets = {};

        // ====================================================================
        // Geometries (Shared Geometry Objects)
        // ====================================================================
        // These are reused across multiple buildings/props to save memory
        
        this.assets.buildingGeo = new THREE.BoxGeometry(1, 1, 1);  // Base unit cube, scaled per use
        this.assets.roadGeo = new THREE.PlaneGeometry(1, 1);        // Road/sidewalk surface
        this.assets.rubbleGeo = new THREE.DodecahedronGeometry(0.5, 0);  // Debris chunks
        
        // Street Light Components
        this.assets.poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);     // Light pole
        this.assets.lampGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);        // Lamp housing
        
        // Traffic Light Components
        this.assets.tlPoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5);  // Traffic light pole
        this.assets.tlBoxGeo = new THREE.BoxGeometry(0.3, 0.8, 0.2);          // Signal housing
        this.assets.tlLightGeo = new THREE.CircleGeometry(0.1, 16);           // Individual light circles

        // Street Props
        this.assets.benchGeo = new THREE.BoxGeometry(1.5, 0.1, 0.5);         // Park bench seat
        this.assets.trashGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 8); // Trash can
        this.assets.hydrantGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8); // Fire hydrant
        this.assets.treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.0, 6); // Tree trunk
        this.assets.treeLeavesGeo = new THREE.ConeGeometry(1.5, 2.5, 8);      // Tree foliage
        this.assets.carWreckGeo = new THREE.BoxGeometry(1.2, 0.5, 2.0);        // Abandoned vehicle

        // ====================================================================
        // Materials (Shared Material Objects)
        // ====================================================================
        // Reused across objects for performance and consistent appearance
        
        this.assets.concreteMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.9 });
        this.assets.asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, roughness: 0.9 });  // Very dark
        this.assets.asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, roughness: 0.9 });  // Very dark
        this.assets.sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 }); // Darker grey
        this.assets.curbMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
        this.assets.ruinMat = new THREE.MeshStandardMaterial({ color: 0x4A4A4A, roughness: 1.0 });     // Weathered
        
        // Glass material for windows
        this.assets.windowMat = new THREE.MeshStandardMaterial({ 
            color: 0x88CCFF,        // Light blue tint
            roughness: 0.1,         // Very smooth/reflective
            metalness: 0.9,         // Metallic sheen
            transparent: true,
            opacity: 0.7            // Semi-transparent
        });
        
        this.assets.rubbleMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1.0 });
        this.assets.yellowLineMat = new THREE.MeshBasicMaterial({ color: 0x666633 });  // Dim olive yellow road markings
        
        // Light post materials
        this.assets.poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.assets.lampMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFDDAA,        // Warm white glow
            emissive: 0xFFDDAA,     // Self-illuminated
            emissiveIntensity: 0.2  // Subtle glow
        });
        
        // Traffic light materials
        this.assets.tlBoxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        this.assets.redMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });     // Red signal
        this.assets.yellowMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });  // Yellow signal
        this.assets.greenMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });   // Green signal

        // Prop materials
        this.assets.benchMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });    // Wood
        this.assets.trashMat = new THREE.MeshStandardMaterial({ color: 0x223322 });    // Dark green
        this.assets.hydrantMat = new THREE.MeshStandardMaterial({ color: 0xCC0000 });  // Red
        this.assets.treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
        this.assets.treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        this.assets.carWreckMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });

        // Construction Site Assets
        this.assets.girderGeo = new THREE.BoxGeometry(0.2, 1, 0.2);  // Steel beam (scaled later)
        this.assets.girderMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF8C00,    // Dark orange rust
            metalness: 0.6, 
            roughness: 0.4 
        });
        this.assets.grateGeo = new THREE.PlaneGeometry(1.5, 1.5);  // Sewer grate
        this.assets.grateMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0.9, 
            side: THREE.DoubleSide 
        });
        this.assets.barrierGeo = new THREE.BoxGeometry(2, 1, 0.2);  // Safety barrier
        this.assets.barrierMat = new THREE.MeshStandardMaterial({ color: 0xFFCC00 });  // Yellow

        // ====================================================================
        // Instanced Meshes (Maximum Performance Rendering)
        // ====================================================================
        // InstancedMesh allows rendering thousands of identical objects with
        // different transforms in a single draw call. Each instance can have
        // its own position, rotation, and scale.
        
        this.instanced = {};
        
        // Street Lights (up to 1000 poles and lamps)
        this.instanced.poles = new THREE.InstancedMesh(this.assets.poleGeo, this.assets.poleMat, 1000);
        this.instanced.lamps = new THREE.InstancedMesh(this.assets.lampGeo, this.assets.lampMat, 1000);
        
        // Traffic Lights (up to 200 complete signals)
        this.instanced.tlPoles = new THREE.InstancedMesh(this.assets.tlPoleGeo, this.assets.poleMat, 200);
        this.instanced.tlBoxes = new THREE.InstancedMesh(this.assets.tlBoxGeo, this.assets.tlBoxMat, 200);
        this.instanced.tlReds = new THREE.InstancedMesh(this.assets.tlLightGeo, this.assets.redMat, 200);
        this.instanced.tlYellows = new THREE.InstancedMesh(this.assets.tlLightGeo, this.assets.yellowMat, 200);
        this.instanced.tlGreens = new THREE.InstancedMesh(this.assets.tlLightGeo, this.assets.greenMat, 200);
        
        // Environmental Props
        this.instanced.rubble = new THREE.InstancedMesh(this.assets.rubbleGeo, this.assets.rubbleMat, 500);
        this.instanced.benches = new THREE.InstancedMesh(this.assets.benchGeo, this.assets.benchMat, 200);
        this.instanced.trashCans = new THREE.InstancedMesh(this.assets.trashGeo, this.assets.trashMat, 200);
        this.instanced.hydrants = new THREE.InstancedMesh(this.assets.hydrantGeo, this.assets.hydrantMat, 100);
        this.instanced.carWrecks = new THREE.InstancedMesh(this.assets.carWreckGeo, this.assets.carWreckMat, 50);
        this.instanced.sewerGrates = new THREE.InstancedMesh(this.assets.grateGeo, this.assets.grateMat, 100);

        // Disable frustum culling for all instanced meshes
        // Since we don't update the bounding sphere of the instanced mesh to cover all instances,
        // Three.js might cull the entire batch if the origin (0,0,0) is out of view.
        // Disabling culling ensures they are always drawn (vertex shader handles per-instance clipping).
        for (const key in this.instanced) {
            this.instanced[key].frustumCulled = false;
        }
    }

    /**
     * Generate the entire city procedurally
     * Creates ground, buildings, roads, props, and atmospheric elements
     * Uses a grid-based layout with special zones (parks, construction, extraction)
     */
    generate() {
        // ====================================================================
        // Ground Plane (Asphalt)
        // ====================================================================
        const groundGeometry = new THREE.PlaneGeometry(300, 300);
        const groundMaterial = this.assets.asphaltMat;
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.ground = ground;

        // ====================================================================
        // Initialize Instanced Meshes
        // ====================================================================
        for (const key in this.instanced) {
            this.instanced[key].count = 0;
            this.scene.add(this.instanced[key]);
            this.props.push(this.instanced[key]);
        }
        this.sewerGratePositions = [];

        // ====================================================================
        // Irregular Grid Generation
        // ====================================================================
        // We generate a set of split lines for X and Z axes to create varied block sizes
        
        const mapSize = 200;
        const minBlockSize = 18; // 30% smaller for cramped feel
        const maxBlockSize = 32; // 30% smaller for cramped feel
        const roadWidth = 6; // Slightly wider for main roads

        // Generate split lines
        const xSplits = [-mapSize/2, mapSize/2];
        const zSplits = [-mapSize/2, mapSize/2];

        const addSplits = (splits) => {
            let current = -mapSize/2 + minBlockSize;
            while (current < mapSize/2 - minBlockSize) {
                // Random step
                const step = minBlockSize + Math.random() * (maxBlockSize - minBlockSize);
                if (current + step < mapSize/2 - minBlockSize) {
                    splits.push(current + step);
                    current += step;
                } else {
                    break;
                }
            }
            splits.sort((a, b) => a - b);
        };

        addSplits(xSplits);
        addSplits(zSplits);

        // ====================================================================
        // Block Generation & Zoning
        // ====================================================================
        
        // Iterate through the grid defined by splits
        // Generate Buildings, Parks, and Special Structures in blocks
        const playableRadius = 70; // Match minimap radius
        const allBlocks = [];
        for (let i = 0; i < xSplits.length - 1; i++) {
            for (let j = 0; j < zSplits.length - 1; j++) {
                const x1 = xSplits[i];
                const x2 = xSplits[i + 1];
                const z1 = zSplits[j];
                const z2 = zSplits[j + 1];

                const centerX = (x1 + x2) / 2;
                const centerZ = (z1 + z2) / 2;
                
                // Check if block center is within playable radius
                const distFromCenter = Math.sqrt(centerX * centerX + centerZ * centerZ);
                if (distFromCenter > playableRadius) {
                    continue; // Skip blocks outside playable area
                }
                
                // Adjust for road width to get the actual buildable area within the block
                const buildableX1 = x1 + roadWidth/2;
                const buildableX2 = x2 - roadWidth/2;
                const buildableZ1 = z1 + roadWidth/2;
                const buildableZ2 = z2 - roadWidth/2;

                const width = buildableX2 - buildableX1;
                const depth = buildableZ2 - buildableZ1;
                
                // Only add block if it has positive width/depth after road adjustment
                if (width > 0 && depth > 0) {
                    allBlocks.push({ centerX, centerZ, width, depth });
                }
            }
        }

        // Sort blocks by distance to target extraction location (15, 15)
        // This guarantees the closest block becomes the extraction zone
        allBlocks.sort((a, b) => {
            const distA = (a.centerX - 15)**2 + (a.centerZ - 15)**2;
            const distB = (b.centerX - 15)**2 + (b.centerZ - 15)**2;
            return distA - distB;
        });

        // Create Extraction Zone at the best spot
        const extractionBlock = allBlocks.shift();
        const storeX = extractionBlock.centerX;
        const storeZ = extractionBlock.centerZ;
        this.createConvenienceStore(storeX, storeZ);

        // Process remaining blocks
        for (const block of allBlocks) {
            const { centerX, centerZ, width, depth } = block;

            // Determine Zone based on distance from center
            const dist = Math.sqrt(centerX*centerX + centerZ*centerZ);
            let zone = 'industrial'; // Default outer
            if (dist < 40) zone = 'commercial';
            else if (dist < 80) zone = 'mixed';

            // Park (in mixed zone)
            if (zone === 'mixed' && Math.random() < 0.15) {
                const sidewalkWidth = 1.4; // 30% smaller for proportion
                this.createPark(centerX, centerZ, width - sidewalkWidth*2, depth - sidewalkWidth*2);
                continue;
            }

            // Construction Site (rare)
            if (Math.random() < 0.05) {
                const sidewalkWidth = 1.4; // 30% smaller for proportion
                this.createConstructionSite(centerX, centerZ, width - sidewalkWidth*2, depth - sidewalkWidth*2);
                continue;
            }

            // Regular Buildings
            // Adjust for sidewalk width (2 units on each side)
            const sidewalkWidth = 1.4; // 30% smaller for proportion
            const buildWidth = width - sidewalkWidth*2;
            const buildDepth = depth - sidewalkWidth*2;

            // Block Subdivision Logic for Density
            // If block is large enough, chance to split into multiple buildings
            const minSplitSize = 6; // Reduced to 6 to allow smaller blocks to split
            let subdivided = false;

            if ((zone === 'commercial' || zone === 'mixed') && buildWidth > minSplitSize * 2 && buildDepth > minSplitSize * 2) {
                // ALWAYS subdivide large blocks (Denser city)
                subdivided = true;
                // 2x2 Split
                const gap = 2.5; // Gap between buildings in alleys
                const subW = (buildWidth - gap) / 2;
                const subD = (buildDepth - gap) / 2;
                
                const offsets = [
                    { x: -subW/2 - gap/2, z: -subD/2 - gap/2 },
                    { x: subW/2 + gap/2, z: -subD/2 - gap/2 },
                    { x: -subW/2 - gap/2, z: subD/2 + gap/2 },
                    { x: subW/2 + gap/2, z: subD/2 + gap/2 }
                ];

                offsets.forEach(off => {
                    this.createBuilding(centerX + off.x, centerZ + off.z, subW, subD, zone);
                });
            } else if ((zone === 'commercial' || zone === 'mixed') && buildWidth > minSplitSize * 2) {
                 // ALWAYS split along X
                subdivided = true;
                // Split along X (2 buildings side-by-side)
                const gap = 2.5; // Gap between buildings in alleys
                const subW = (buildWidth - gap) / 2;
                
                this.createBuilding(centerX - subW/2 - gap/2, centerZ, subW, buildDepth, zone);
                this.createBuilding(centerX + subW/2 + gap/2, centerZ, subW, buildDepth, zone);
            } else if ((zone === 'commercial' || zone === 'mixed') && buildDepth > minSplitSize * 2) {
                // ALWAYS split along Z
                subdivided = true;
                // Split along Z (2 buildings front-to-back)
                const gap = 2.5; // Gap between buildings in alleys
                const subD = (buildDepth - gap) / 2;
                
                this.createBuilding(centerX, centerZ - subD/2 - gap/2, buildWidth, subD, zone);
                this.createBuilding(centerX, centerZ + subD/2 + gap/2, buildWidth, subD, zone);
            }

            if (!subdivided) {
                this.createBuilding(centerX, centerZ, buildWidth, buildDepth, zone);
            }
        }

        // ====================================================================
        // Infrastructure & Details
        // ====================================================================
        
        this.createRoadMarkings(xSplits, zSplits, mapSize, roadWidth);
        this.createSidewalks(xSplits, zSplits, mapSize, roadWidth);
        this.createRoadsideProps(xSplits, zSplits, mapSize, roadWidth);
        this.createSewerGrates(xSplits, zSplits, mapSize, roadWidth);
        this.createSidewalkProps(xSplits, zSplits, mapSize, roadWidth);
        this.createCarWrecks(xSplits, zSplits, mapSize, roadWidth);
        this.createRoadDebris(xSplits, zSplits, mapSize, roadWidth);
        this.createMapBoundaries(mapSize);

        // Update Instance Matrices
        for (const key in this.instanced) {
            this.instanced[key].instanceMatrix.needsUpdate = true;
        }

        // Set Player Spawn near the Convenience Store (extraction zone)
        // Spawn 15 units away in a random direction
        const randomAngle = Math.random() * Math.PI * 2;
        const spawnDistance = 15;
        const spawnX = storeX + Math.cos(randomAngle) * spawnDistance;
        const spawnZ = storeZ + Math.sin(randomAngle) * spawnDistance;
        this.playerSpawn = new THREE.Vector3(spawnX, 0, spawnZ);

        // Generate valid item spawn points (on roads/sidewalks)
        this.itemSpawns = [];
        // Use playableRadius from earlier in this method
        for (let i = 0; i < 50; i++) {
            // Pick random road (vertical or horizontal)
            let x, z, offset;
            if (Math.random() < 0.5) {
                // Vertical road
                x = xSplits[Math.floor(Math.random() * (xSplits.length - 2)) + 1];
                z = (Math.random() - 0.5) * mapSize;
                // Random offset within road width (including sidewalks)
                offset = (Math.random() - 0.5) * (roadWidth + 2); 
                x += offset;
            } else {
                // Horizontal road
                z = zSplits[Math.floor(Math.random() * (zSplits.length - 2)) + 1];
                x = (Math.random() - 0.5) * mapSize;
                offset = (Math.random() - 0.5) * (roadWidth + 2);
                z += offset;
            }
            
            // Only add spawn if within playable radius
            const dist = Math.sqrt(x * x + z * z);
            if (dist < playableRadius) {
                this.itemSpawns.push(new THREE.Vector3(x, 0, z));
            }
        }
    }

    createRoadMarkings(xSplits, zSplits, mapSize, roadWidth) {
        // Create yellow dashed lines for roads
        const lineGeo = new THREE.PlaneGeometry(1, 0.2);
        const lineMat = this.assets.yellowLineMat;
        const markings = new THREE.InstancedMesh(lineGeo, lineMat, 2000);
        markings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        
        let idx = 0;
        const dummy = new THREE.Object3D();

        // Vertical Roads (X splits)
        // Skip first and last (map edges)
        for (let i = 1; i < xSplits.length - 1; i++) {
            const x = xSplits[i];
            // Draw line along Z
            for (let z = -mapSize/2; z < mapSize/2; z += 4) {
                // Don't draw in intersections? 
                // Simple check: is z close to any zSplit?
                let inIntersection = false;
                for (let zSplit of zSplits) {
                    if (Math.abs(z - zSplit) < roadWidth/2 + 1) {
                        inIntersection = true;
                        break;
                    }
                }
                
                if (!inIntersection) {
                    dummy.position.set(x, 0.02, z);
                    dummy.rotation.set(-Math.PI/2, 0, Math.PI/2); // Rotate to run along Z
                    dummy.scale.set(2, 1, 1); // Dash length
                    dummy.updateMatrix();
                    markings.setMatrixAt(idx++, dummy.matrix);
                }
            }
        }

        // Horizontal Roads (Z splits)
        for (let j = 1; j < zSplits.length - 1; j++) {
            const z = zSplits[j];
            for (let x = -mapSize/2; x < mapSize/2; x += 4) {
                let inIntersection = false;
                for (let xSplit of xSplits) {
                    if (Math.abs(x - xSplit) < roadWidth/2 + 1) {
                        inIntersection = true;
                        break;
                    }
                }

                if (!inIntersection) {
                    dummy.position.set(x, 0.02, z);
                    dummy.rotation.set(-Math.PI/2, 0, 0); // Run along X
                    dummy.scale.set(2, 1, 1);
                    dummy.updateMatrix();
                    markings.setMatrixAt(idx++, dummy.matrix);
                }
            }
        }

        markings.count = idx;
        this.scene.add(markings);
        this.props.push(markings);
    }

    createSidewalks(xSplits, zSplits, mapSize, roadWidth) {
        const sidewalkWidth = 1.4; // 30% smaller for proportion
        const sidewalkHeight = 0.15;
        const sidewalkGeo = this.assets.roadGeo;
        const sidewalkMat = this.assets.sidewalkMat;
        const curbMat = this.assets.curbMat;
        
        const group = new THREE.Group();
        
        // Vertical Roads
        for (let i = 1; i < xSplits.length - 1; i++) {
            const rx = xSplits[i];
            
            // Iterate horizontal intervals to avoid intersections
            for (let j = 0; j < zSplits.length - 1; j++) {
                const zStart = zSplits[j] + roadWidth/2;
                const zEnd = zSplits[j+1] - roadWidth/2;
                const len = zEnd - zStart;
                const zCenter = (zStart + zEnd) / 2;
                
                if (len > 0) {
                    // Left Sidewalk
                    const lx = rx - roadWidth/2 - sidewalkWidth/2;
                    const lSw = new THREE.Mesh(sidewalkGeo, sidewalkMat);
                    lSw.position.set(lx, 0.05, zCenter);
                    lSw.rotation.x = -Math.PI / 2;
                    lSw.scale.set(sidewalkWidth, len, 1);
                    lSw.receiveShadow = true;
                    group.add(lSw);
                    
                    // Left Curb
                    const lCurb = new THREE.Mesh(this.assets.buildingGeo, curbMat);
                    lCurb.position.set(lx + sidewalkWidth/2 + 0.1, sidewalkHeight/2, zCenter);
                    lCurb.scale.set(0.2, sidewalkHeight, len);
                    lCurb.castShadow = true;
                    lCurb.receiveShadow = true;
                    group.add(lCurb);

                    // Right Sidewalk
                    const rX = rx + roadWidth/2 + sidewalkWidth/2;
                    const rSw = new THREE.Mesh(sidewalkGeo, sidewalkMat);
                    rSw.position.set(rX, 0.05, zCenter);
                    rSw.rotation.x = -Math.PI / 2;
                    rSw.scale.set(sidewalkWidth, len, 1);
                    rSw.receiveShadow = true;
                    group.add(rSw);
                    
                    // Right Curb
                    const rCurb = new THREE.Mesh(this.assets.buildingGeo, curbMat);
                    rCurb.position.set(rX - sidewalkWidth/2 - 0.1, sidewalkHeight/2, zCenter);
                    rCurb.scale.set(0.2, sidewalkHeight, len);
                    rCurb.castShadow = true;
                    rCurb.receiveShadow = true;
                    group.add(rCurb);
                }
            }
        }

        // Horizontal Roads
        for (let j = 1; j < zSplits.length - 1; j++) {
            const rz = zSplits[j];
            
            for (let i = 0; i < xSplits.length - 1; i++) {
                const xStart = xSplits[i] + roadWidth/2;
                const xEnd = xSplits[i+1] - roadWidth/2;
                const len = xEnd - xStart;
                const xCenter = (xStart + xEnd) / 2;
                
                if (len > 0) {
                    // Top Sidewalk
                    const tx = xCenter;
                    const tz = rz - roadWidth/2 - sidewalkWidth/2;
                    const tSw = new THREE.Mesh(sidewalkGeo, sidewalkMat);
                    tSw.position.set(tx, 0.05, tz);
                    tSw.rotation.x = -Math.PI / 2;
                    tSw.scale.set(len, sidewalkWidth, 1);
                    tSw.receiveShadow = true;
                    group.add(tSw);
                    
                    // Top Curb
                    const tCurb = new THREE.Mesh(this.assets.buildingGeo, curbMat);
                    tCurb.position.set(tx, sidewalkHeight/2, tz + sidewalkWidth/2 + 0.1);
                    tCurb.scale.set(len, sidewalkHeight, 0.2);
                    tCurb.castShadow = true;
                    tCurb.receiveShadow = true;
                    group.add(tCurb);

                    // Bottom Sidewalk
                    const bz = rz + roadWidth/2 + sidewalkWidth/2;
                    const bSw = new THREE.Mesh(sidewalkGeo, sidewalkMat);
                    bSw.position.set(tx, 0.05, bz);
                    bSw.rotation.x = -Math.PI / 2;
                    bSw.scale.set(len, sidewalkWidth, 1);
                    bSw.receiveShadow = true;
                    group.add(bSw);
                    
                    // Bottom Curb
                    const bCurb = new THREE.Mesh(this.assets.buildingGeo, curbMat);
                    bCurb.position.set(tx, sidewalkHeight/2, bz - sidewalkWidth/2 - 0.1);
                    bCurb.scale.set(len, sidewalkHeight, 0.2);
                    bCurb.castShadow = true;
                    bCurb.receiveShadow = true;
                    group.add(bCurb);
                }
            }
        }
        
        // Corner Patches
        for (let i = 1; i < xSplits.length - 1; i++) {
            for (let j = 1; j < zSplits.length - 1; j++) {
                const cx = xSplits[i];
                const cz = zSplits[j];
                const offset = roadWidth/2 + sidewalkWidth/2;
                
                const corners = [
                    {x: cx - offset, z: cz - offset},
                    {x: cx + offset, z: cz - offset},
                    {x: cx - offset, z: cz + offset},
                    {x: cx + offset, z: cz + offset}
                ];
                
                corners.forEach(c => {
                    const patch = new THREE.Mesh(sidewalkGeo, sidewalkMat);
                    patch.position.set(c.x, 0.05, c.z);
                    patch.rotation.x = -Math.PI / 2;
                    patch.scale.set(sidewalkWidth, 1, sidewalkWidth);
                    patch.receiveShadow = true;
                    group.add(patch);
                });
            }
        }

        this.scene.add(group);
        this.props.push(group);
    }

    createRoadsideProps(xSplits, zSplits, mapSize, roadWidth) {
        // Place street lights, traffic lights, etc.
        // Simplified placement logic for irregular grid
        
        const dummy = new THREE.Object3D();
        let poleIdx = this.instanced.poles.count;
        let lampIdx = this.instanced.lamps.count;
        let tlPoleIdx = this.instanced.tlPoles.count;
        let tlBoxIdx = this.instanced.tlBoxes.count;
        let tlRedIdx = this.instanced.tlReds.count;
        let tlYellowIdx = this.instanced.tlYellows.count;
        let tlGreenIdx = this.instanced.tlGreens.count;

        // Intersections (Traffic Lights)
        for (let i = 1; i < xSplits.length - 1; i++) {
            for (let j = 1; j < zSplits.length - 1; j++) {
                const x = xSplits[i];
                const z = zSplits[j];
                
                // Place 4 traffic lights at corners of intersection
                const offset = roadWidth/2 + 0.5;
                const corners = [
                    {x: x - offset, z: z - offset, rot: 0},
                    {x: x + offset, z: z + offset, rot: Math.PI},
                    {x: x - offset, z: z + offset, rot: -Math.PI/2},
                    {x: x + offset, z: z - offset, rot: Math.PI/2}
                ];

                corners.forEach(c => {
                    if (Math.random() > 0.3) { // 70% chance per corner
                        this.placeTrafficLight(c.x, c.z, c.rot, dummy, tlPoleIdx++, tlBoxIdx++, tlRedIdx++, tlYellowIdx++, tlGreenIdx++);
                    }
                });
            }
        }

        // Street Lights along roads
        // Vertical roads
        for (let i = 1; i < xSplits.length - 1; i++) {
            const x = xSplits[i];
            for (let z = -mapSize/2; z < mapSize/2; z += 15) {
                // Check if in intersection
                let inIntersection = false;
                for (let zSplit of zSplits) {
                    if (Math.abs(z - zSplit) < roadWidth) inIntersection = true;
                }
                if (!inIntersection) {
                    // Place on both sides
                    this.placeStreetLight(x - roadWidth/2 - 0.5, z, dummy, poleIdx++, lampIdx++);
                    this.placeStreetLight(x + roadWidth/2 + 0.5, z, dummy, poleIdx++, lampIdx++);
                }
            }
        }

        // Horizontal roads
        for (let j = 1; j < zSplits.length - 1; j++) {
            const z = zSplits[j];
            for (let x = -mapSize/2; x < mapSize/2; x += 15) {
                let inIntersection = false;
                for (let xSplit of xSplits) {
                    if (Math.abs(x - xSplit) < roadWidth) inIntersection = true;
                }
                if (!inIntersection) {
                    this.placeStreetLight(x, z - roadWidth/2 - 0.5, dummy, poleIdx++, lampIdx++);
                    this.placeStreetLight(x, z + roadWidth/2 + 0.5, dummy, poleIdx++, lampIdx++);
                }
            }
        }

        // Update counts
        this.instanced.poles.count = poleIdx;
        this.instanced.lamps.count = lampIdx;
        this.instanced.tlPoles.count = tlPoleIdx;
        this.instanced.tlBoxes.count = tlBoxIdx;
        this.instanced.tlReds.count = tlRedIdx;
        this.instanced.tlYellows.count = tlYellowIdx;
        this.instanced.tlGreens.count = tlGreenIdx;
    }

    placeStreetLight(x, z, dummy, poleIdx, lampIdx) {
        // Pole
        dummy.position.set(x, 2, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        this.instanced.poles.setMatrixAt(poleIdx, dummy.matrix);
        
        // Lamp
        dummy.position.set(x, 4, z);
        dummy.updateMatrix();
        this.instanced.lamps.setMatrixAt(lampIdx, dummy.matrix);
    }

    placeTrafficLight(x, z, rot, dummy, poleIdx, boxIdx, redIdx, yellowIdx, greenIdx) {
        const h = 3.5;
        // Pole
        dummy.position.set(x, h/2, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        this.instanced.tlPoles.setMatrixAt(poleIdx, dummy.matrix);
        
        // Box
        dummy.position.set(x, h, z);
        dummy.rotation.set(0, rot, 0);
        dummy.updateMatrix();
        this.instanced.tlBoxes.setMatrixAt(boxIdx, dummy.matrix);
        
        // Lights (offset based on rotation)
        const fwd = new THREE.Vector3(0, 0, 0.11).applyAxisAngle(new THREE.Vector3(0,1,0), rot);
        
        dummy.position.set(x + fwd.x, h + 0.25, z + fwd.z);
        dummy.scale.set(1,1,1); // Reset scale
        dummy.updateMatrix();
        this.instanced.tlReds.setMatrixAt(redIdx, dummy.matrix);
        
        dummy.position.set(x + fwd.x, h, z + fwd.z);
        dummy.updateMatrix();
        this.instanced.tlYellows.setMatrixAt(yellowIdx, dummy.matrix);
        
        dummy.position.set(x + fwd.x, h - 0.25, z + fwd.z);
        dummy.updateMatrix();
        this.instanced.tlGreens.setMatrixAt(greenIdx, dummy.matrix);
    }

    createCityBlock(x, z, size) {
        // Deprecated by irregular grid, but keeping as fallback or for fixed blocks
        this.createBuilding(x, z, size, size, 'mixed');
    }

    createBuilding(x, z, width, depth, zone = 'mixed') {
        // Select building type based on zone and dimensions
        const type = Math.random();
        const area = width * depth;
        const isLarge = width > 25 && depth > 25;
        const isRectangular = Math.abs(width - depth) > 10;

        // Helper to create a random "Office Type" building
        const createRandomOffice = (x, z, w, d) => {
            const officeTypes = ['standard', 'stepped'];
            if (w > 25 && d > 25) officeTypes.push('twin');
            if (w > 15 && d > 15) officeTypes.push('lshaped');
            
            const pick = officeTypes[Math.floor(Math.random() * officeTypes.length)];
            
            if (pick === 'twin') this.createTwinTowers(x, z, w, d);
            else if (pick === 'lshaped') this.createLShapedBuilding(x, z, w, d);
            else if (pick === 'stepped') this.createSteppedBuilding(x, z, w, d);
            else this.createOfficeBuilding(x, z, w, d);
        };

        if (zone === 'commercial') {
            // 85% "Office Building" Mix
            if (type < 0.85) {
                createRandomOffice(x, z, width, depth);
            } else {
                // 15% Other (Parking, Dome)
                if (Math.random() < 0.5) this.createParkingGarage(x, z, width, depth);
                else this.createDomeBuilding(x, z, width, depth);
            }
        } 
        else if (zone === 'industrial') {
            if (type < 0.3) this.createFactory(x, z, width, depth);
            else if (type < 0.6) this.createWarehouse(x, z, width, depth);
            else if (type < 0.8) this.createGasStation(x, z, width, depth);
            else this.createWaterTower(x, z, width, depth);
        }
        else { // Mixed
            // 85% "Office Building" Mix
            if (type < 0.85) {
                createRandomOffice(x, z, width, depth);
            } else {
                // 15% Other (Parking, Dome, Ruined)
                const rand = Math.random();
                if (rand < 0.33) this.createParkingGarage(x, z, width, depth);
                else if (rand < 0.66) this.createDomeBuilding(x, z, width, depth);
                else this.createRuinedBuilding(x, z, width, depth);
            }
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

    createConstructionSite(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Dirt Ground
        const dirtGeo = new THREE.PlaneGeometry(width, depth);
        const dirtMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 1.0 });
        const dirt = new THREE.Mesh(dirtGeo, dirtMat);
        dirt.rotation.x = -Math.PI / 2;
        dirt.position.y = 0.06; // Above road/sidewalk
        dirt.receiveShadow = true;
        group.add(dirt);

        // Steel Framework (Grid of girders)
        const girderHeight = 8;
        const spacing = 6;
        
        for (let gx = -width/2 + 2; gx < width/2; gx += spacing) {
            for (let gz = -depth/2 + 2; gz < depth/2; gz += spacing) {
                // Vertical Column
                const col = new THREE.Mesh(this.assets.girderGeo, this.assets.girderMat);
                col.scale.set(2, girderHeight, 2);
                col.position.set(gx, girderHeight/2, gz);
                col.castShadow = true;
                group.add(col);
                
                // Horizontal Beams (Top)
                if (gx + spacing < width/2) {
                    const beamX = new THREE.Mesh(this.assets.girderGeo, this.assets.girderMat);
                    beamX.scale.set(spacing * 5, 1, 1); // Stretch X
                    beamX.rotation.z = Math.PI / 2;
                    beamX.position.set(gx + spacing/2, girderHeight, gz);
                    group.add(beamX);
                }
                if (gz + spacing < depth/2) {
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
        wall.scale.set(width * 0.6, 4, 0.5);
        wall.position.set(0, 2, -depth/3);
        wall.castShadow = true;
        group.add(wall);

        // Crane Base (Yellow)
        const craneBase = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), this.assets.barrierMat);
        craneBase.position.set(-width/3, 2, depth/3);
        craneBase.castShadow = true;
        group.add(craneBase);
        
        // Crane Arm
        const craneArm = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), this.assets.barrierMat);
        craneArm.position.set(-width/3, 4, depth/3 + 3);
        craneArm.rotation.x = -Math.PI / 6;
        craneArm.castShadow = true;
        group.add(craneArm);

        // Barriers around perimeter
        const barrierCountX = Math.floor(width / 2.5);
        const barrierCountZ = Math.floor(depth / 2.5);
        
        // Front/Back
        for (let i = 0; i < barrierCountX; i++) {
            const bx = (i - barrierCountX/2) * 2.5;
            const b1 = new THREE.Mesh(this.assets.barrierGeo, this.assets.barrierMat);
            b1.position.set(bx, 0.5, depth/2 - 1);
            group.add(b1);
            
            const b2 = new THREE.Mesh(this.assets.barrierGeo, this.assets.barrierMat);
            b2.position.set(bx, 0.5, -depth/2 + 1);
            group.add(b2);
        }
        // Left/Right
        for (let i = 0; i < barrierCountZ; i++) {
            const bz = (i - barrierCountZ/2) * 2.5;
            const b3 = new THREE.Mesh(this.assets.barrierGeo, this.assets.barrierMat);
            b3.position.set(width/2 - 1, 0.5, bz);
            b3.rotation.y = Math.PI/2;
            group.add(b3);
            
            const b4 = new THREE.Mesh(this.assets.barrierGeo, this.assets.barrierMat);
            b4.position.set(-width/2 + 1, 0.5, bz);
            b4.rotation.y = Math.PI/2;
            group.add(b4);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, 10, depth));
    }

    createSewerGrates(xSplits, zSplits, mapSize, roadWidth) {
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

        // Vertical roads
        for (let i = 1; i < xSplits.length - 1; i++) {
            const x = xSplits[i];
            for (let z = -mapSize/2; z < mapSize/2; z += 20) {
                if (Math.random() < 0.4) {
                    const sideOffset = (Math.random() - 0.5) * (roadWidth - 1); 
                    addGrate(x + sideOffset, z + Math.random() * 5);
                }
            }
        }
        
        // Horizontal roads
        for (let j = 1; j < zSplits.length - 1; j++) {
            const z = zSplits[j];
            for (let x = -mapSize/2; x < mapSize/2; x += 20) {
                if (Math.random() < 0.4) {
                    const sideOffset = (Math.random() - 0.5) * (roadWidth - 1);
                    addGrate(x + Math.random() * 5, z + sideOffset);
                }
            }
        }
    }

    createSidewalkProps(xSplits, zSplits, mapSize, roadWidth) {
        const dummy = new THREE.Object3D();
        
        const addProp = (meshName, x, z, rotY = 0) => {
            if (this.instanced[meshName].count >= this.instanced[meshName].instanceMatrix.count) return;
            
            dummy.position.set(x, 0, z);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(1, 1, 1);
            
            if (meshName === 'benches') dummy.position.y = 0.2;
            if (meshName === 'trashCans') dummy.position.y = 0.4;
            if (meshName === 'hydrants') dummy.position.y = 0.3;

            dummy.updateMatrix();
            const idx = this.instanced[meshName].count++;
            this.instanced[meshName].setMatrixAt(idx, dummy.matrix);
        };

        // Vertical roads
        for (let i = 1; i < xSplits.length - 1; i++) {
            const x = xSplits[i];
            for (let z = -mapSize/2; z < mapSize/2; z += 15) {
                // Left Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', x - roadWidth/2 - 1.5, z + 2);
                if (Math.random() < 0.2) addProp('hydrants', x - roadWidth/2 - 1.5, z + 5);
                if (Math.random() < 0.2) addProp('benches', x - roadWidth/2 - 2.0, z + 8, Math.PI/2);

                // Right Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', x + roadWidth/2 + 1.5, z - 2);
                if (Math.random() < 0.2) addProp('hydrants', x + roadWidth/2 + 1.5, z - 5);
                if (Math.random() < 0.2) addProp('benches', x + roadWidth/2 + 2.0, z - 8, -Math.PI/2);
            }
        }

        // Horizontal roads
        for (let j = 1; j < zSplits.length - 1; j++) {
            const z = zSplits[j];
            for (let x = -mapSize/2; x < mapSize/2; x += 15) {
                // Top Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', x + 2, z - roadWidth/2 - 1.5);
                if (Math.random() < 0.2) addProp('hydrants', x + 5, z - roadWidth/2 - 1.5);
                if (Math.random() < 0.2) addProp('benches', x + 8, z - roadWidth/2 - 2.0, 0);

                // Bottom Sidewalk
                if (Math.random() < 0.3) addProp('trashCans', x - 2, z + roadWidth/2 + 1.5);
                if (Math.random() < 0.2) addProp('hydrants', x - 5, z + roadWidth/2 + 1.5);
                if (Math.random() < 0.2) addProp('benches', x - 8, z + roadWidth/2 + 2.0, Math.PI);
            }
        }
    }

    createCarWrecks(xSplits, zSplits, mapSize, roadWidth) {
        const dummy = new THREE.Object3D();
        const wreckCount = 60; // Doubled for more obstacles
        
        for (let i = 0; i < wreckCount; i++) {
            // Random position on road
            const isVertical = Math.random() < 0.5;
            let x, z, rot;
            
            if (isVertical) {
                const roadIdx = Math.floor(Math.random() * (xSplits.length - 2)) + 1;
                x = xSplits[roadIdx];
                z = (Math.random() - 0.5) * mapSize;
                rot = (Math.random() - 0.5) * 0.5; // Slight angle
            } else {
                const roadIdx = Math.floor(Math.random() * (zSplits.length - 2)) + 1;
                z = zSplits[roadIdx];
                x = (Math.random() - 0.5) * mapSize;
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
                this.addCollisionBox(collider, new THREE.Vector3(1.2, 1, 2.0));
            }
        }
    }

    createPark(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Grass Base (Dead)
        const grassGeo = new THREE.PlaneGeometry(width, depth);
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x4B3621, roughness: 1.0 }); // Dead brown
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = 0.08; 
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
            new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }) // Dry concrete
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
            const rx = width * 0.35;
            const rz = depth * 0.35;
            const tx = Math.cos(angle) * rx;
            const tz = Math.sin(angle) * rz;
            
            const trunk = new THREE.Mesh(this.assets.treeTrunkGeo, this.assets.treeTrunkMat);
            trunk.position.set(tx, 0.5, tz);
            trunk.castShadow = true;
            group.add(trunk);
            
            const leaves = new THREE.Mesh(this.assets.treeLeavesGeo, new THREE.MeshStandardMaterial({ color: 0x3B2F2F })); // Dead leaves
            leaves.position.set(tx, 2.0, tz);
            leaves.castShadow = true;
            group.add(leaves);
        }

        // Benches
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

        // Add Rubble to Park
        for(let i=0; i<5; i++) {
            this.createRubble(x + (Math.random()-0.5)*width*0.8, z + (Math.random()-0.5)*depth*0.8);
        }

        this.scene.add(group);
        this.props.push(group);
        
        // Collision for Fountain
        const fCollider = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2, 4),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        fCollider.position.set(x, 1, z); 
        this.scene.add(fCollider);
        this.props.push(fCollider);
        this.addCollisionBox(fCollider, new THREE.Vector3(4, 2, 4));
    }





    createRoadDebris(xSplits, zSplits, mapSize, roadWidth) {
        // Place rubble on roads as obstacles
        const debrisCount = 80 + Math.floor(Math.random() * 40); // Increased obstacle density
        
        for (let i = 0; i < debrisCount; i++) {
            // Random position on the road network
            const isVerticalRoad = Math.random() < 0.5;
            let rx, rz;
            
            if (isVerticalRoad) {
                const roadIdx = Math.floor(Math.random() * (xSplits.length - 2)) + 1;
                rx = xSplits[roadIdx];
                rz = (Math.random() - 0.5) * mapSize;
            } else {
                const roadIdx = Math.floor(Math.random() * (zSplits.length - 2)) + 1;
                rz = zSplits[roadIdx];
                rx = (Math.random() - 0.5) * mapSize;
            }
            
            if (rx !== undefined) {
                this.createRubble(rx, rz);
            }
        }
    }

    createMapBoundaries(mapSize) {
        const playableRadius = 70; // Match minimap
        const thickness = 8;
        const height = 8;
        
        // Create circular ring of trash piles
        // Generate piles along the circumference
        const segments = 60; // Number of segments around the circle
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const nextAngle = ((i + 1) / segments) * Math.PI * 2;
            
            // Current and next positions on the circle
            const x1 = Math.cos(angle) * playableRadius;
            const z1 = Math.sin(angle) * playableRadius;
            const x2 = Math.cos(nextAngle) * playableRadius;
            const z2 = Math.sin(nextAngle) * playableRadius;
            
            // Midpoint for this segment
            const mx = (x1 + x2) / 2;
            const mz = (z1 + z2) / 2;
            
            // Create collision box for this segment
            const segmentLength = Math.sqrt((x2-x1)*(x2-x1) + (z2-z1)*(z2-z1));
            const wall = new THREE.Mesh(
                new THREE.BoxGeometry(thickness, height * 2, segmentLength + thickness),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            wall.position.set(mx, height, mz);
            wall.rotation.y = -angle - Math.PI / 2; // Perpendicular to radius
            this.scene.add(wall);
            this.props.push(wall);
            this.addCollisionBox(wall, new THREE.Vector3(thickness, height * 2, segmentLength + thickness));
            
            // Add visual trash piles (3x density = 9 piles per segment)
            const pileCount = 9;
            for (let p = 0; p < pileCount; p++) {
                const t = p / (pileCount - 1);
                const px = x1 + (x2 - x1) * t;
                const pz = z1 + (z2 - z1) * t;
                
                // Random offset inward/outward for more chaotic landfill look
                const offset = (Math.random() - 0.3) * thickness * 1.5; // Bias inward slightly
                const rx = px + Math.cos(angle) * offset;
                const rz = pz + Math.sin(angle) * offset;
                
                // Add large trash pile with variation
                if (this.instanced.rubble.count < this.instanced.rubble.instanceMatrix.count) {
                    const dummy = new THREE.Object3D();
                    dummy.position.set(rx, Math.random() * 0.5, rz); // Vary height slightly
                    dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
                    // Much larger scale variation for landfill appearance
                    dummy.scale.setScalar(1.5 + Math.random() * 3.5);
                    dummy.updateMatrix();
                    this.instanced.rubble.setMatrixAt(this.instanced.rubble.count++, dummy.matrix);
                }
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




    createOfficeBuilding(x, z, width, depth) {
        const height = 6 + Math.random() * 12;
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Main Body (Concrete)
        const bodyHeight = height - 1; // Leave room for lobby
        const building = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        building.position.y = 1 + bodyHeight / 2; // Above lobby
        building.scale.set(width, bodyHeight, depth);
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);

        // Add Windows
        this.addWindows(group, width, bodyHeight, depth, 1.0);

        // Lobby (Ground Floor)
        const lobbyHeight = 1;
        const lobbyColsX = Math.max(2, Math.floor(width / 4));
        const lobbyColsZ = Math.max(2, Math.floor(depth / 4));
        const colGeo = new THREE.CylinderGeometry(0.2, 0.2, lobbyHeight);
        const colMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });

        // Columns along width (Front/Back)
        for(let i=0; i<lobbyColsX; i++) {
            const cx = (i / (lobbyColsX-1) - 0.5) * (width - 1);
            // Front
            const c1 = new THREE.Mesh(colGeo, colMat);
            c1.position.set(cx, lobbyHeight/2, depth/2 - 0.5);
            group.add(c1);
            // Back
            const c2 = new THREE.Mesh(colGeo, colMat);
            c2.position.set(cx, lobbyHeight/2, -depth/2 + 0.5);
            group.add(c2);
        }
        
        // Columns along depth (Left/Right) - skip corners to avoid doubling
        for(let i=1; i<lobbyColsZ-1; i++) {
            const cz = (i / (lobbyColsZ-1) - 0.5) * (depth - 1);
            // Left
            const c3 = new THREE.Mesh(colGeo, colMat);
            c3.position.set(-width/2 + 0.5, lobbyHeight/2, cz);
            group.add(c3);
            // Right
            const c4 = new THREE.Mesh(colGeo, colMat);
            c4.position.set(width/2 - 0.5, lobbyHeight/2, cz);
            group.add(c4);
        }
        
        // Lobby Floor/Ceiling
        // Reduce size slightly to prevent Z-fighting with main building walls
        const slabGeo = new THREE.BoxGeometry(width * 0.98, 0.2, depth * 0.98);
        const slabMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const ceiling = new THREE.Mesh(slabGeo, slabMat);
        ceiling.position.y = lobbyHeight;
        group.add(ceiling);

        // Roof Details
        const roofGeo = new THREE.BoxGeometry(width * 0.8, 0.5, depth * 0.8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = height;
        group.add(roof);

        // AC Units
        const acGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
        const acMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        for(let i=0; i<2; i++) {
            const ac = new THREE.Mesh(acGeo, acMat);
            ac.position.set((Math.random()-0.5)*width*0.5, height + 0.55, (Math.random()-0.5)*depth*0.5);
            group.add(ac);
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, depth));
        
        // Random billboard on top (20% chance)
        if (Math.random() < 0.2) {
            this.addBillboard(group, width, height);
        }
    }

    createSteppedBuilding(x, z, width, depth) {
        const height = 8 + Math.random() * 12;
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Base
        const baseHeight = height * 0.4;
        const base = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        base.position.y = baseHeight / 2;
        base.scale.set(width, baseHeight, depth);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Top
        const topHeight = height * 0.6;
        const topWidth = width * 0.6;
        const topDepth = depth * 0.6;
        const top = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        top.position.y = baseHeight + topHeight / 2;
        top.scale.set(topWidth, topHeight, topDepth);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);

        this.addWindows(group, width, baseHeight, depth, 0);
        this.addWindows(group, topWidth, topHeight, topDepth, baseHeight);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, depth)); // Simplified collision
    }

    createTwinTowers(x, z, width, depth) {
        const height = 10 + Math.random() * 10;
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Podium
        const podiumHeight = 2;
        const podium = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        podium.position.y = podiumHeight / 2;
        podium.scale.set(width, podiumHeight, depth);
        podium.castShadow = true;
        podium.receiveShadow = true;
        group.add(podium);

        // Towers
        const towerWidth = width * 0.35;
        const towerDepth = depth * 0.35;
        const towerHeight = height - podiumHeight;
        
        // Tower 1 Group
        const t1Group = new THREE.Group();
        t1Group.position.set(-width/4, podiumHeight, -depth/4);
        group.add(t1Group);

        const t1 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        t1.position.y = towerHeight/2;
        t1.scale.set(towerWidth, towerHeight, towerDepth);
        t1.castShadow = true;
        t1.receiveShadow = true;
        t1Group.add(t1);

        // Windows for Tower 1
        this.addWindows(t1Group, towerWidth, towerHeight, towerDepth, 0);

        // Tower 2 Group
        const t2Group = new THREE.Group();
        t2Group.position.set(width/4, podiumHeight, depth/4);
        group.add(t2Group);

        const t2 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        t2.position.y = towerHeight/2;
        t2.scale.set(towerWidth, towerHeight, towerDepth);
        t2.castShadow = true;
        t2.receiveShadow = true;
        t2Group.add(t2);

        // Windows for Tower 2
        this.addWindows(t2Group, towerWidth, towerHeight, towerDepth, 0);

        // Skybridge
        const bridgeHeight = 1.5;
        const bridgeY = towerHeight * 0.66;
        // Calculate distance and angle between towers
        const dx = (width/4) - (-width/4); // width/2
        const dz = (depth/4) - (-depth/4); // depth/2
        const dist = Math.sqrt(dx*dx + dz*dz); 
        const angle = Math.atan2(dz, dx);

        const bridge = new THREE.Mesh(this.assets.buildingGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 }));
        bridge.position.set(0, podiumHeight + bridgeY, 0);
        bridge.rotation.y = -angle; 
        bridge.scale.set(dist, bridgeHeight, Math.min(towerWidth, towerDepth) * 0.6);
        bridge.castShadow = true;
        group.add(bridge);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, depth));
    }



    createGasStation(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Office Building (small)
        const officeHeight = 3.5;
        const officeWidth = width * 0.35;
        const officeDepth = depth * 0.35;
        const office = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        office.position.set(-width/3.5, officeHeight/2, -depth/3.5);
        office.scale.set(officeWidth, officeHeight, officeDepth);
        office.castShadow = true;
        office.receiveShadow = true;
        group.add(office);

        // Office Door
        const doorGeo = new THREE.PlaneGeometry(1.2, 2.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(-width/3.5 + officeWidth/2 + 0.05, 1.1, -depth/3.5);
        door.rotation.y = Math.PI/2;
        group.add(door);

        // Office Window
        const winGeo = new THREE.PlaneGeometry(2, 1.5);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x88CCFF, emissive: 0x112244, roughness: 0.2 });
        const windowMesh = new THREE.Mesh(winGeo, winMat);
        windowMesh.position.set(-width/3.5, 2, -depth/3.5 + officeDepth/2 + 0.05);
        group.add(windowMesh);

        // Canopy
        const canopyHeight = 0.5;
        const canopyY = 4.5;
        const canopyWidth = width * 0.8;
        const canopyDepth = depth * 0.5;
        
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
        pole.position.set(width/2 - 1, 4, -depth/2 + 1);
        pole.castShadow = true;
        group.add(pole);

        const signGeo = new THREE.BoxGeometry(2.5, 1.5, 0.3);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(width/2 - 1, 7, -depth/2 + 1);
        sign.castShadow = true;
        group.add(sign);

        // Sign Border
        const signRimGeo = new THREE.BoxGeometry(2.6, 1.6, 0.2);
        const signRim = new THREE.Mesh(signRimGeo, rimMat);
        signRim.position.set(width/2 - 1, 7, -depth/2 + 1);
        group.add(signRim);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, canopyY + canopyHeight, depth));
    }

    createDomeBuilding(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Base Building
        const baseHeight = 4;
        const base = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        base.position.y = baseHeight / 2;
        base.scale.set(width, baseHeight, depth);
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
            p.position.set(px, baseHeight/2, depth/2 + 0.2);
            p.castShadow = true;
            group.add(p);
        }

        // Cornice (Ring below dome)
        const corniceGeo = new THREE.BoxGeometry(width + 0.5, 0.4, depth + 0.5);
        const cornice = new THREE.Mesh(corniceGeo, pillarMat);
        cornice.position.y = baseHeight;
        cornice.castShadow = true;
        group.add(cornice);

        // Dome (using sphere)
        const domeRadius = Math.min(width, depth) * 0.6;
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
        this.addWindows(group, width, baseHeight, depth, 0);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, baseHeight + domeRadius, depth));
    }

    createLShapedBuilding(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
    
        const height = 8 + Math.random() * 8;
        const wingWidth = width * 0.4;
        const wingDepth = depth * 0.4;
    
        // Wing 1 (horizontal along X)
        const wing1 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        wing1.position.set(0, height/2, -depth/2 + wingDepth/2);
        wing1.scale.set(width, height, wingDepth);
        wing1.castShadow = true;
        wing1.receiveShadow = true;
        group.add(wing1);

        // Wing 2 (vertical along Z)
        const wing2 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        wing2.position.set(-width/2 + wingWidth/2, height/2, 0);
        wing2.scale.set(wingWidth, height, depth);
        wing2.castShadow = true;
        wing2.receiveShadow = true;
        group.add(wing2);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, depth));
    }

    createWaterTower(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const towerHeight = 9;
        const tankRadius = Math.min(width, depth) * 0.5;

        // Support Legs (4 corners)
        const legGeo = new THREE.CylinderGeometry(0.2, 0.3, towerHeight);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        const legPositions = [
            [-width/3, towerHeight/2, -depth/3],
            [width/3, towerHeight/2, -depth/3],
            [-width/3, towerHeight/2, depth/3],
            [width/3, towerHeight/2, depth/3]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos);
            leg.castShadow = true;
            group.add(leg);
        });

        // Cross Bracing (X shapes)
        const braceMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        // Adjust brace length based on diagonal
        const braceGeo = new THREE.CylinderGeometry(0.1, 0.1, Math.sqrt(width*width + depth*depth) * 0.5); // Approximate
        
        // Simplified bracing for variable size
        // Just horizontal bars for now to be safe with variable dims
        const hBarGeoX = new THREE.CylinderGeometry(0.15, 0.15, width * 0.7);
        const hBarGeoZ = new THREE.CylinderGeometry(0.15, 0.15, depth * 0.7);

        for(let h = 3; h < towerHeight; h += 3) {
            // X-axis bars (connecting Z-legs)
            const b1 = new THREE.Mesh(hBarGeoX, braceMat);
            b1.position.set(0, h, -depth/3);
            b1.rotation.z = Math.PI/2;
            group.add(b1);

            const b2 = new THREE.Mesh(hBarGeoX, braceMat);
            b2.position.set(0, h, depth/3);
            b2.rotation.z = Math.PI/2;
            group.add(b2);

            // Z-axis bars (connecting X-legs)
            const b3 = new THREE.Mesh(hBarGeoZ, braceMat);
            b3.position.set(-width/3, h, 0);
            b3.rotation.x = Math.PI/2;
            group.add(b3);

            const b4 = new THREE.Mesh(hBarGeoZ, braceMat);
            b4.position.set(width/3, h, 0);
            b4.rotation.x = Math.PI/2;
            group.add(b4);
        }

        // Central Riser Pipe
        const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, towerHeight);
        const pipe = new THREE.Mesh(pipeGeo, legMat);
        pipe.position.y = towerHeight/2;
        group.add(pipe);

        // Ladder
        const ladderGeo = new THREE.BoxGeometry(0.6, towerHeight + 2, 0.1);
        const ladder = new THREE.Mesh(ladderGeo, braceMat);
        ladder.position.set(0, towerHeight/2, depth/3 + 0.2);
        group.add(ladder);

        // Tank (Sphere)
        const tankGeo = new THREE.SphereGeometry(tankRadius, 16, 16);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x88AACC, metalness: 0.4, roughness: 0.6 });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.y = towerHeight + tankRadius * 0.6;
        tank.scale.y = 0.8; // Squashed sphere
        tank.castShadow = true;
        tank.receiveShadow = true;
        group.add(tank);

        // Catwalk
        const catwalkGeo = new THREE.TorusGeometry(tankRadius * 1.1, 0.1, 8, 16);
        const catwalk = new THREE.Mesh(catwalkGeo, braceMat);
        catwalk.position.y = towerHeight;
        catwalk.rotation.x = Math.PI/2;
        group.add(catwalk);

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, towerHeight + tankRadius * 2, depth));
    }

    createWarehouse(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const height = 5;
        const warehouseMat = new THREE.MeshStandardMaterial({ 
            color: 0xCC6633, // Rust/orange
            roughness: 0.8,
            metalness: 0.3
        });

        // Main warehouse body
        const body = new THREE.Mesh(this.assets.buildingGeo, warehouseMat);
        body.position.y = height / 2;
        body.scale.set(width, height, depth);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Corrugated details (Horizontal ridges)
        const ridgeCount = 6;
        const ridgeGeo = new THREE.BoxGeometry(width + 0.1, 0.1, depth + 0.1);
        const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xAA5522 });
        
        for(let i=1; i<ridgeCount; i++) {
            const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
            ridge.position.y = (i / ridgeCount) * height;
            group.add(ridge);
        }

        // Office Attachment
        const officeWidth = width * 0.4;
        const officeHeight = 3;
        const officeDepth = depth * 0.3;
        const office = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        office.position.set(width/2 - officeWidth/2, officeHeight/2, depth/2 + officeDepth/2);
        office.scale.set(officeWidth, officeHeight, officeDepth);
        office.castShadow = true;
        group.add(office);

        // Office Windows
        const winGeo = new THREE.PlaneGeometry(1.5, 1);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x88CCFF, emissive: 0x112244 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(width/2 - officeWidth/2, 1.5, depth/2 + officeDepth + 0.05);
        group.add(win);

        // Loading Dock
        const dockHeight = 1.2;
        const dockDepth = 2;
        const dockWidth = width * 0.6;
        const dock = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        dock.position.set(-width/4, dockHeight/2, depth/2 + dockDepth/2);
        dock.scale.set(dockWidth, dockHeight, dockDepth);
        dock.receiveShadow = true;
        group.add(dock);

        // Loading Doors (Roll-up)
        const doorGeo = new THREE.PlaneGeometry(1.5, 2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.5 });
        
        for (let i = 0; i < 2; i++) {
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(-width/4 - 1 + i * 2.5, 1.5, depth/2 + 0.06); // On the main wall
            group.add(door);
        }

        // Ramp
        const rampGeo = new THREE.BoxGeometry(1.5, 0.1, 2);
        const ramp = new THREE.Mesh(rampGeo, this.assets.concreteMat);
        ramp.position.set(-width/4, dockHeight/2, depth/2 + dockDepth + 1);
        ramp.rotation.x = 0.2; // Slope down
        group.add(ramp);

        // Rooftop vents
        const ventGeo = new THREE.BoxGeometry(1, 0.8, 1);
        const ventMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        
        const ventPositions = [
            [-width/4, height + 0.4, -depth/4],
            [width/4, height + 0.4, depth/4],
            [0, height + 0.4, 0]
        ];

        ventPositions.forEach(pos => {
            const vent = new THREE.Mesh(ventGeo, ventMat);
            vent.position.set(...pos);
            vent.castShadow = true;
            group.add(vent);
        });

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, height, depth));
    }

    createRuinedBuilding(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const baseHeight = 6 + Math.random() * 6;
        const collapseAmount = 0.3 + Math.random() * 0.4;

        // Main ruined structure
        const building = new THREE.Mesh(this.assets.buildingGeo, this.assets.ruinMat);
        building.position.y = baseHeight * collapseAmount / 2;
        building.scale.set(width, baseHeight * collapseAmount, depth);
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
                (Math.random() - 0.5) * depth * 0.8
            );
            section.scale.set(
                width * 0.2 + Math.random() * width * 0.2,
                sectionHeight,
                depth * 0.2 + Math.random() * depth * 0.2
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

    createParkingGarage(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const levels = 3 + Math.floor(Math.random() * 2); // 3-4 levels
        const levelHeight = 2.5;
        const totalHeight = levels * levelHeight;
        const garageDepth = depth;

        // Support columns at corners
        const columnGeo = new THREE.BoxGeometry(0.5, totalHeight, 0.5);
        const columnMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        
        const columnPositions = [
            [-width/2.2, totalHeight/2, -garageDepth/2.2],
            [width/2.2, totalHeight/2, -garageDepth/2.2],
            [-width/2.2, totalHeight/2, garageDepth/2.2],
            [width/2.2, totalHeight/2, garageDepth/2.2]
        ];

        columnPositions.forEach(pos => {
            const column = new THREE.Mesh(columnGeo, columnMat);
            column.position.set(...pos);
            column.castShadow = true;
            group.add(column);
        });

        // Floor slabs for each level
        const floorGeo = new THREE.BoxGeometry(width, 0.2, garageDepth);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
        
        // Barriers
        const barrierGeo = new THREE.BoxGeometry(width * 0.9, 0.5, 0.1);
        const barrierMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const sideBarrierGeo = new THREE.BoxGeometry(0.1, 0.5, garageDepth * 0.9);

        // Cars
        const carGeo = new THREE.BoxGeometry(1.2, 0.8, 2.5);
        const carColors = [0xFF0000, 0x0000FF, 0xFFFFFF, 0x333333, 0xAAAAAA];

        for (let i = 0; i <= levels; i++) {
            const y = i * levelHeight;
            
            // Floor
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.position.y = y;
            floor.castShadow = true;
            floor.receiveShadow = true;
            group.add(floor);

            // Barriers (Front/Back/Sides)
            if (i > 0) {
                // Front/Back
                const b1 = new THREE.Mesh(barrierGeo, barrierMat);
                b1.position.set(0, y + 0.25, -garageDepth/2 + 0.05);
                group.add(b1);
                
                // Only add front barrier if not ground floor (entrance)
                const b2 = new THREE.Mesh(barrierGeo, barrierMat);
                b2.position.set(0, y + 0.25, garageDepth/2 - 0.05);
                group.add(b2);
                
                // Side Barriers
                const b3 = new THREE.Mesh(sideBarrierGeo, barrierMat);
                b3.position.set(-width/2 + 0.05, y + 0.25, 0);
                group.add(b3);
                const b4 = new THREE.Mesh(sideBarrierGeo, barrierMat);
                b4.position.set(width/2 - 0.05, y + 0.25, 0);
                group.add(b4);

                // Parked Cars (Random)
                if (Math.random() < 0.7) {
                    const carCount = 2 + Math.floor(Math.random() * 3);
                    for(let c=0; c<carCount; c++) {
                        const carMat = new THREE.MeshStandardMaterial({ color: carColors[Math.floor(Math.random()*carColors.length)] });
                        const car = new THREE.Mesh(carGeo, carMat);
                        // Random position on floor
                        car.position.set(
                            (Math.random()-0.5) * (width - 3),
                            y + 0.4,
                            (Math.random()-0.5) * (garageDepth - 3)
                        );
                        car.rotation.y = Math.random() * Math.PI * 2;
                        car.castShadow = true;
                        group.add(car);
                    }
                }
            }

            // Ramp to next level
            if (i < levels) {
                const rampWidth = width * 0.3;
                const rampDepth = garageDepth * 0.5;
                const rampGeo = new THREE.BoxGeometry(rampWidth, 0.1, rampDepth);
                const rampMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
                
                const ramp = new THREE.Mesh(rampGeo, rampMat);
                const startY = i * levelHeight + 0.1;
                const endY = (i + 1) * levelHeight + 0.1;
                
                // Place ramp on side
                const side = (i % 2 === 0) ? 1 : -1;
                ramp.position.set(side * (width/2 - rampWidth/2 - 0.5), (startY + endY) / 2, 0);
                
                // Slope
                const angle = Math.atan2(levelHeight, rampDepth);
                ramp.rotation.x = -angle; 
                
                group.add(ramp);
            }
        }

        this.scene.add(group);
        this.props.push(group);
        this.addCollisionBox(group, new THREE.Vector3(width, totalHeight, garageDepth));
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

    createFactory(x, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const buildingHeight = 6;
        
        // Main factory building
        const factory = new THREE.Mesh(this.assets.buildingGeo, this.assets.ruinMat);
        factory.position.y = buildingHeight / 2;
        factory.scale.set(width, buildingHeight, depth);
        factory.castShadow = true;
        factory.receiveShadow = true;
        group.add(factory);

        // Windows (Industrial style - fewer, larger)
        // Helper to create window mesh
        const createWindow = (x, y, z, sx, sy, sz) => {
            if (Math.random() > 0.3) { // 70% chance of window being lit/exist
                const win = new THREE.Mesh(this.assets.buildingGeo, this.assets.windowMat);
                win.position.set(x, y, z);
                win.scale.set(sx, sy, sz);
                group.add(win);
            }
        };

        const windowSize = 0.4;
        const spacing = 0.8;
        
        const rows = Math.floor((buildingHeight - 1) / spacing);
        const colsX = Math.floor((width - 0.5) / spacing);
        const colsZ = Math.floor((depth - 0.5) / spacing);

        for (let r = 0; r < rows; r++) {
            const y = 1 + r * spacing; // Start higher up
            
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

        // Loading Dock
        const dockWidth = width * 0.4;
        const dockHeight = 1.5;
        const dockDepth = 2;
        const dock = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        dock.position.set(0, dockHeight/2, depth/2 + dockDepth/2);
        dock.scale.set(dockWidth, dockHeight, dockDepth);
        dock.castShadow = true;
        dock.receiveShadow = true;
        group.add(dock);

        // Dock Door
        const doorGeo = new THREE.PlaneGeometry(dockWidth * 0.8, dockHeight * 0.8);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 }); // Metal door
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, dockHeight/2, depth/2 + dockDepth + 0.05);
        group.add(door);

        // Smokestack (tall chimney)
        const stackHeight = 12 + Math.random() * 4;
        const stackGeo = new THREE.CylinderGeometry(0.5, 0.6, stackHeight);
        const stackMat = new THREE.MeshStandardMaterial({ color: 0x442222 }); // Dark red brick
        const stack = new THREE.Mesh(stackGeo, stackMat);
        stack.position.set(width * 0.3, stackHeight / 2, depth * 0.3);
        stack.castShadow = true;
        group.add(stack);

        // Stack top rim
        const rimGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.3);
        const rim = new THREE.Mesh(rimGeo, stackMat);
        rim.position.set(width * 0.3, stackHeight + 0.15, depth * 0.3);
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
                (Math.random() - 0.5) * depth * 0.7
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
        this.addCollisionBox(group, new THREE.Vector3(width, Math.max(buildingHeight, stackHeight), depth));
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
