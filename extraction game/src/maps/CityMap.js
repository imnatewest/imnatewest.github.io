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
                this.createCityBlock(bx, bz, blockSize);
            }
        }

        // Roads
        this.createRoads(gridSize, blockSize, roadWidth, offset);

        // Road debris/obstacles
        this.createRoadDebris(gridSize, blockSize, roadWidth, offset);

        // Atmospheric elements
        this.createStreetLights(gridSize, blockSize, roadWidth, offset);
        this.createTrafficLights(gridSize, blockSize, roadWidth, offset);

        // Extraction Zone - Convenience Store
        this.createConvenienceStore(15, 15);
    }

    createStreetLights(gridSize, blockSize, roadWidth, offset) {
        const lightHeight = 4;
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, lightHeight);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const lampGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        const lampMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFDDAA, // Dim warm white
            emissive: 0xFFDDAA,
            emissiveIntensity: 0.2 // Reduced from 0.5
        });

        // Vertical roads
        for (let x = 0; x < gridSize - 1; x++) {
            const rx = (x * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            
            // Place lights along the road every 10 units
            for (let z = -offset; z < offset; z += 10) {
                // Left side
                const leftPole = new THREE.Mesh(poleGeo, poleMat);
                leftPole.position.set(rx - roadWidth/2 + 0.5, lightHeight/2, z);
                this.scene.add(leftPole);
                this.props.push(leftPole);
                
                const leftLamp = new THREE.Mesh(lampGeo, lampMat);
                leftLamp.position.set(rx - roadWidth/2 + 0.5, lightHeight, z);
                this.scene.add(leftLamp);
                this.props.push(leftLamp);
                
                // Right side
                const rightPole = new THREE.Mesh(poleGeo, poleMat);
                rightPole.position.set(rx + roadWidth/2 - 0.5, lightHeight/2, z);
                this.scene.add(rightPole);
                this.props.push(rightPole);
                
                const rightLamp = new THREE.Mesh(lampGeo, lampMat);
                rightLamp.position.set(rx + roadWidth/2 - 0.5, lightHeight, z);
                this.scene.add(rightLamp);
                this.props.push(rightLamp);
            }
        }

        // Horizontal roads
        for (let z = 0; z < gridSize - 1; z++) {
            const rz = (z * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
            
            for (let x = -offset; x < offset; x += 10) {
                // Top side
                const topPole = new THREE.Mesh(poleGeo, poleMat);
                topPole.position.set(x, lightHeight/2, rz - roadWidth/2 + 0.5);
                this.scene.add(topPole);
                this.props.push(topPole);
                
                const topLamp = new THREE.Mesh(lampGeo, lampMat);
                topLamp.position.set(x, lightHeight, rz - roadWidth/2 + 0.5);
                this.scene.add(topLamp);
                this.props.push(topLamp);
                
                // Bottom side
                const bottomPole = new THREE.Mesh(poleGeo, poleMat);
                bottomPole.position.set(x, lightHeight/2, rz + roadWidth/2 - 0.5);
                this.scene.add(bottomPole);
                this.props.push(bottomPole);
                
                const bottomLamp = new THREE.Mesh(lampGeo, lampMat);
                bottomLamp.position.set(x, lightHeight, rz + roadWidth/2 - 0.5);
                this.scene.add(bottomLamp);
                this.props.push(bottomLamp);
            }
        }
    }

    createTrafficLights(gridSize, blockSize, roadWidth, offset) {
        const poleHeight = 3.5;
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, poleHeight);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const boxGeo = new THREE.BoxGeometry(0.3, 0.8, 0.2);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const lightGeo = new THREE.CircleGeometry(0.1, 16);
        
        // Traffic light materials
        const redMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const yellowMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        const greenMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });

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
                // Create traffic light on corner
                const pole = new THREE.Mesh(poleGeo, poleMat);
                pole.position.set(vx + roadWidth/2, poleHeight/2, hz + roadWidth/2);
                this.scene.add(pole);
                this.props.push(pole);
                
                const box = new THREE.Mesh(boxGeo, boxMat);
                box.position.set(vx + roadWidth/2, poleHeight, hz + roadWidth/2);
                this.scene.add(box);
                this.props.push(box);
                
                // Red light (top)
                const red = new THREE.Mesh(lightGeo, redMat);
                red.position.set(vx + roadWidth/2, poleHeight + 0.25, hz + roadWidth/2 + 0.11);
                this.scene.add(red);
                this.props.push(red);
                
                // Yellow light (middle)
                const yellow = new THREE.Mesh(lightGeo, yellowMat);
                yellow.position.set(vx + roadWidth/2, poleHeight, hz + roadWidth/2 + 0.11);
                this.scene.add(yellow);
                this.props.push(yellow);
                
                // Green light (bottom)
                const green = new THREE.Mesh(lightGeo, greenMat);
                green.position.set(vx + roadWidth/2, poleHeight - 0.25, hz + roadWidth/2 + 0.11);
                this.scene.add(green);
                this.props.push(green);
            }
        }
    }

    createRoadDebris(gridSize, blockSize, roadWidth, offset) {
        // Place rubble on roads as obstacles
        const debrisCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < debrisCount; i++) {
            // Random position on the road network
            const isVerticalRoad = Math.random() < 0.5;
            
            if (isVerticalRoad && gridSize > 1) {
                const roadIndex = Math.floor(Math.random() * (gridSize - 1));
                const rx = (roadIndex * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
                const rz = (Math.random() - 0.5) * offset * 2;
                this.createRubble(rx, rz);
            } else if (gridSize > 1) {
                const roadIndex = Math.floor(Math.random() * (gridSize - 1));
                const rz = (roadIndex * (blockSize + roadWidth)) - offset + blockSize + roadWidth/2;
                const rx = (Math.random() - 0.5) * offset * 2;
                this.createRubble(rx, rz);
            }
        }
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
        
        const t1 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        t1.position.set(-width/4, podiumHeight + towerHeight/2, -width/4);
        t1.scale.set(towerWidth, towerHeight, towerWidth);
        t1.castShadow = true;
        t1.receiveShadow = true;
        group.add(t1);

        const t2 = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        t2.position.set(width/4, podiumHeight + towerHeight/2, width/4);
        t2.scale.set(towerWidth, towerHeight, towerWidth);
        t2.castShadow = true;
        t2.receiveShadow = true;
        group.add(t2);

        // Note: Windows omitted to prevent overlap with complex geometry

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
        const officeHeight = 3;
        const officeWidth = width * 0.4;
        const office = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        office.position.set(-width/4, officeHeight/2, -width/4);
        office.scale.set(officeWidth, officeHeight, officeWidth);
        office.castShadow = true;
        office.receiveShadow = true;
        group.add(office);

        // Canopy
        const canopyHeight = 0.2;
        const canopyY = 3.5;
        const canopy = new THREE.Mesh(this.assets.buildingGeo, this.assets.asphaltMat);
        canopy.position.set(0, canopyY, 0);
        canopy.scale.set(width * 0.9, canopyHeight, width * 0.9);
        canopy.castShadow = true;
        group.add(canopy);

        // Support Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, canopyY);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
        
        const pillarPositions = [
            [-width/3, canopyY/2, -width/3],
            [width/3, canopyY/2, -width/3],
            [-width/3, canopyY/2, width/3],
            [width/3, canopyY/2, width/3]
        ];

        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(...pos);
            pillar.castShadow = true;
            group.add(pillar);
        });

        // Fuel Pumps
        const pumpGeo = new THREE.BoxGeometry(0.6, 1.5, 0.4);
        const pumpMat = new THREE.MeshStandardMaterial({ color: 0xFF3333 }); // Red pumps
        
        const pumpPositions = [
            [-1.5, 0.75, 1],
            [0, 0.75, 1],
            [1.5, 0.75, 1]
        ];

        pumpPositions.forEach(pos => {
            const pump = new THREE.Mesh(pumpGeo, pumpMat);
            pump.position.set(...pos);
            pump.castShadow = true;
            group.add(pump);
        });

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

        // Entrance (small protrusion)
        const entrance = new THREE.Mesh(this.assets.buildingGeo, this.assets.concreteMat);
        entrance.position.set(0, 1, width/2 + 0.5);
        entrance.scale.set(width * 0.3, 2, 1);
        entrance.castShadow = true;
        group.add(entrance);

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
        const pipeCount = 2 + Math.floor(Math.random() * 2);
        const pipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 4);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.6 });
        
        for (let i = 0; i < pipeCount; i++) {
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.position.set(
                (Math.random() - 0.5) * width * 0.6,
                buildingHeight + 2,
                (Math.random() - 0.5) * width * 0.6
            );
            pipe.rotation.set(
                (Math.random() - 0.5) * 0.3,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.3
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
        const sidewalkWidth = 0.8;
        const curbHeight = 0.2;
        
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
                    ? horizontalRoadPositions[i] - roadWidth/2 - 0.5
                    : offset;
                
                if (segmentEnd > segmentStart) {
                    const segmentLength = segmentEnd - segmentStart;
                    const segmentCenter = (segmentStart + segmentEnd) / 2;
                    
                    // Left sidewalk segment
                    const leftSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    leftSidewalk.position.set(rx - roadWidth/2 + sidewalkWidth/2, 0.05, segmentCenter);
                    leftSidewalk.rotation.x = -Math.PI / 2;
                    leftSidewalk.scale.set(sidewalkWidth, segmentLength, 1);
                    this.scene.add(leftSidewalk);
                    this.props.push(leftSidewalk);
                    
                    // Left curb segment
                    const leftCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    leftCurb.position.set(rx - roadWidth/2 + sidewalkWidth, curbHeight/2, segmentCenter);
                    leftCurb.scale.set(0.1, curbHeight, segmentLength);
                    this.scene.add(leftCurb);
                    this.props.push(leftCurb);
                    
                    // Right sidewalk segment
                    const rightSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    rightSidewalk.position.set(rx + roadWidth/2 - sidewalkWidth/2, 0.05, segmentCenter);
                    rightSidewalk.rotation.x = -Math.PI / 2;
                    rightSidewalk.scale.set(sidewalkWidth, segmentLength, 1);
                    this.scene.add(rightSidewalk);
                    this.props.push(rightSidewalk);
                    
                    // Right curb segment
                    const rightCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    rightCurb.position.set(rx + roadWidth/2 - sidewalkWidth, curbHeight/2, segmentCenter);
                    rightCurb.scale.set(0.1, curbHeight, segmentLength);
                    this.scene.add(rightCurb);
                    this.props.push(rightCurb);
                }
                
                if (i < horizontalRoadPositions.length) {
                    currentZ = horizontalRoadPositions[i] + roadWidth/2 + 0.5;
                }
            }
            
            // Yellow lane markings
            for (let z = -offset; z < offset; z += 4) {
                const dash = new THREE.Mesh(this.assets.roadGeo, this.assets.yellowLineMat);
                dash.position.set(rx, 0.05, z);
                dash.rotation.x = -Math.PI / 2;
                dash.scale.set(0.5, 2, 1);
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
                    ? verticalRoadPositions[i] - roadWidth/2 - 0.5
                    : offset;
                
                if (segmentEnd > segmentStart) {
                    const segmentLength = segmentEnd - segmentStart;
                    const segmentCenter = (segmentStart + segmentEnd) / 2;
                    
                    // Top sidewalk segment
                    const topSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    topSidewalk.position.set(segmentCenter, 0.05, rz - roadWidth/2 + sidewalkWidth/2);
                    topSidewalk.rotation.x = -Math.PI / 2;
                    topSidewalk.scale.set(segmentLength, sidewalkWidth, 1);
                    this.scene.add(topSidewalk);
                    this.props.push(topSidewalk);
                    
                    // Top curb segment
                    const topCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    topCurb.position.set(segmentCenter, curbHeight/2, rz - roadWidth/2 + sidewalkWidth);
                    topCurb.scale.set(segmentLength, curbHeight, 0.1);
                    this.scene.add(topCurb);
                    this.props.push(topCurb);
                    
                    // Bottom sidewalk segment
                    const bottomSidewalk = new THREE.Mesh(this.assets.roadGeo, this.assets.sidewalkMat);
                    bottomSidewalk.position.set(segmentCenter, 0.05, rz + roadWidth/2 - sidewalkWidth/2);
                    bottomSidewalk.rotation.x = -Math.PI / 2;
                    bottomSidewalk.scale.set(segmentLength, sidewalkWidth, 1);
                    this.scene.add(bottomSidewalk);
                    this.props.push(bottomSidewalk);
                    
                    // Bottom curb segment
                    const bottomCurb = new THREE.Mesh(this.assets.buildingGeo, this.assets.curbMat);
                    bottomCurb.position.set(segmentCenter, curbHeight/2, rz + roadWidth/2 - sidewalkWidth);
                    bottomCurb.scale.set(segmentLength, curbHeight, 0.1);
                    this.scene.add(bottomCurb);
                    this.props.push(bottomCurb);
                }
                
                if (i < verticalRoadPositions.length) {
                    currentX = verticalRoadPositions[i] + roadWidth/2 + 0.5;
                }
            }
            
            // Yellow lane markings
            for (let x = -offset; x < offset; x += 4) {
                const dash = new THREE.Mesh(this.assets.roadGeo, this.assets.yellowLineMat);
                dash.position.set(x, 0.05, rz);
                dash.rotation.x = -Math.PI / 2;
                dash.scale.set(2, 0.5, 1);
                this.scene.add(dash);
                this.props.push(dash);
            }
        }
    }

    createRubble(x, z) {
        const count = 3 + Math.floor(Math.random() * 5);
        for(let i=0; i<count; i++) {
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
