import * as THREE from 'three';
import { BaseMap } from './BaseMap.js';

// ============================================================================
// Component Classes
// ============================================================================

class Component {
    constructor(x, z, width, depth, rotation = 0) {
        this.x = x; // Center X
        this.z = z; // Center Z
        this.width = width;
        this.depth = depth;
        this.rotation = rotation; // 0, 1 (90deg), 2 (180deg), 3 (270deg)
        this.connectors = [];
        this.type = 'generic';
        
        // Bounding Box for overlap check
        // If rotated 90 or 270, swap width/depth for AABB
        if (this.rotation % 2 !== 0) {
            this.aabb = {
                minX: x - depth/2, maxX: x + depth/2,
                minZ: z - width/2, maxZ: z + width/2
            };
        } else {
            this.aabb = {
                minX: x - width/2, maxX: x + width/2,
                minZ: z - depth/2, maxZ: z + depth/2
            };
        }
    }

    getGlobalConnector(localX, localZ, dir) {
        // Rotate local pos
        let rx = localX;
        let rz = localZ;
        
        // 0: x, z
        // 1: -z, x
        // 2: -x, -z
        // 3: z, -x
        if (this.rotation === 1) { rx = -localZ; rz = localX; }
        else if (this.rotation === 2) { rx = -localX; rz = -localZ; }
        else if (this.rotation === 3) { rx = localZ; rz = -localX; }

        return {
            x: this.x + rx,
            z: this.z + rz,
            dir: (dir + this.rotation) % 4 // 0=N, 1=E, 2=S, 3=W
        };
    }

    overlaps(other) {
        // Shrink slightly to allow touching walls
        const margin = 0.1;
        return (this.aabb.minX + margin < other.aabb.maxX - margin && 
                this.aabb.maxX - margin > other.aabb.minX + margin &&
                this.aabb.minZ + margin < other.aabb.maxZ - margin && 
                this.aabb.maxZ - margin > other.aabb.minZ + margin);
    }
}

class Hallway extends Component {
    constructor(x, z, length, rotation) {
        // Hallway is 4 wide, 'length' deep
        super(x, z, 4, length, rotation);
        this.type = 'hallway';
        
        // Connectors at ends
        // Local coords relative to center (0,0)
        // Front (Z-)
        this.connectors.push({ x: 0, z: -length/2, dir: 0, type: 'end' });
        // Back (Z+)
        this.connectors.push({ x: 0, z: length/2, dir: 2, type: 'end' });
        
        // Connectors along sides (every 4 units)
        const segments = Math.floor(length / 4);
        for(let i=0; i<segments; i++) {
            const zPos = -length/2 + 2 + i*4;
            // Left (X-)
            this.connectors.push({ x: -2, z: zPos, dir: 3, type: 'side' });
            // Right (X+)
            this.connectors.push({ x: 2, z: zPos, dir: 1, type: 'side' });
        }
    }
}

class Room extends Component {
    constructor(x, z, width, depth, rotation) {
        super(x, z, width, depth, rotation);
        this.type = 'room';
        
        // Single connector (Door) usually centered on one wall (South wall in local space)
        // We assume the room attaches TO a connector, so its "entry" is at Z = depth/2
        this.connectors.push({ x: 0, z: depth/2, dir: 2, type: 'entry' }); 
    }
}

// ============================================================================
// AsylumMap Class
// ============================================================================

export class AsylumMap extends BaseMap {
    constructor(scene, particleSystem) {
        super(scene, particleSystem);
        this.allowEnemies = true;
        this.allowItems = true;
        this.loadAssets();
    }

    loadAssets() {
        this.assets = {};

        // Helper to create Tile Texture
        const createTileTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Background (Grout)
            ctx.fillStyle = '#888888';
            ctx.fillRect(0, 0, 512, 512);
            
            // Tiles (4x4 grid)
            const cols = 4;
            const rows = 4;
            const pad = 4; // Grout thickness
            const w = (512 - pad * (cols + 1)) / cols;
            const h = (512 - pad * (rows + 1)) / rows;
            
            for(let i=0; i<cols; i++) {
                for(let j=0; j<rows; j++) {
                    // Randomize tile color slightly
                    const shade = 200 + Math.random() * 30;
                    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
                    ctx.fillRect(pad + i*(w+pad), pad + j*(h+pad), w, h);
                }
            }
            
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        };

        // Helper to create Blood Texture
        const createBloodTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Transparent background
            ctx.clearRect(0, 0, 256, 256);
            
            // Blood Splatters
            ctx.fillStyle = '#8a0303'; // Dark Red
            
            // Main splotch
            ctx.beginPath();
            ctx.arc(128, 128, 60 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Random droplets
            for(let i=0; i<20; i++) {
                const r = Math.random() * 100 + 20;
                const theta = Math.random() * Math.PI * 2;
                const x = 128 + Math.cos(theta) * r;
                const y = 128 + Math.sin(theta) * r;
                const size = Math.random() * 10 + 2;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const tex = new THREE.CanvasTexture(canvas);
            return tex;
        };

        // Geometries
        this.assets.wallGeo = new THREE.BoxGeometry(4, 4, 0.5); 
        this.assets.floorGeo = new THREE.PlaneGeometry(4, 4);
        this.assets.bloodGeo = new THREE.PlaneGeometry(3, 3); // Decal size
        
        // Detailed Bed Geometry (Frame + Mattress)
        this.assets.bedFrameGeo = new THREE.BoxGeometry(1.2, 0.4, 2.2);
        this.assets.bedMattressGeo = new THREE.BoxGeometry(1.1, 0.25, 2.1);
        
        // Materials
        this.assets.floorMat = new THREE.MeshStandardMaterial({ 
            map: createTileTexture(),
            roughness: 0.5,
        });
        
        this.assets.wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x706050, 
            roughness: 0.9 
        });

        this.assets.bloodMat = new THREE.MeshStandardMaterial({
            map: createBloodTexture(),
            transparent: true,
            opacity: 0.8,
            roughness: 0.1, // Wet look
            depthWrite: false, // Avoid z-fighting issues with transparency
            polygonOffset: true,
            polygonOffsetFactor: -1 // Draw on top of floor
        });

        this.assets.bedFrameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 }); // Rusty metal
        this.assets.bedMattressMat = new THREE.MeshStandardMaterial({ color: 0xccccaa, roughness: 0.9 }); // Dirty white

        // Prop Geometries
        this.assets.ivStandGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8);
        this.assets.cabinetGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        this.assets.paperGeo = new THREE.PlaneGeometry(0.6, 0.8);
        this.assets.wheelchairGeo = new THREE.BoxGeometry(0.7, 0.8, 0.8); // Placeholder box for now
        this.assets.binGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.6, 8);
        this.assets.partitionGeo = new THREE.BoxGeometry(2.0, 2.0, 0.05);

        // Prop Materials
        this.assets.ivMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.8 });
        this.assets.cabinetMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.4 });
        this.assets.paperMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        this.assets.wheelchairMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
        this.assets.binMat = new THREE.MeshStandardMaterial({ color: 0xccaa00, roughness: 0.5 }); // Yellow bin
        this.assets.partitionMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.9, transparent: true, opacity: 0.9 }); // Blue curtain

        // Instanced Meshes
        this.instanced = {};
        // this.instanced.walls = new THREE.InstancedMesh(this.assets.wallGeo, this.assets.wallMat, 5000); // Removed for occlusion
        this.instanced.floors = new THREE.InstancedMesh(this.assets.floorGeo, this.assets.floorMat, 5000);
        this.instanced.blood = new THREE.InstancedMesh(this.assets.bloodGeo, this.assets.bloodMat, 1000);
        
        // Two meshes for beds
        this.instanced.bedFrames = new THREE.InstancedMesh(this.assets.bedFrameGeo, this.assets.bedFrameMat, 500);
        this.instanced.bedMattresses = new THREE.InstancedMesh(this.assets.bedMattressGeo, this.assets.bedMattressMat, 500);
        
        // New Props
        this.instanced.ivStands = new THREE.InstancedMesh(this.assets.ivStandGeo, this.assets.ivMat, 200);
        this.instanced.cabinets = new THREE.InstancedMesh(this.assets.cabinetGeo, this.assets.cabinetMat, 100);
        this.instanced.papers = new THREE.InstancedMesh(this.assets.paperGeo, this.assets.paperMat, 2000); // Increased count
        // this.instanced.wheelchairs = new THREE.InstancedMesh(this.assets.wheelchairGeo, this.assets.wheelchairMat, 50); // Removed for detailed group
        this.instanced.bins = new THREE.InstancedMesh(this.assets.binGeo, this.assets.binMat, 100);
        this.instanced.partitions = new THREE.InstancedMesh(this.assets.partitionGeo, this.assets.partitionMat, 100);

        for (const key in this.instanced) {
            this.instanced[key].frustumCulled = false;
            this.instanced[key].castShadow = true;
            this.instanced[key].receiveShadow = true;
        }
    }

    generate() {
        // Add instances to scene
        for (const key in this.instanced) {
            this.instanced[key].count = 0;
            this.scene.add(this.instanced[key]);
            this.props.push(this.instanced[key]);
        }

        const components = [];
        const openConnectors = [];

        // 1. Root Hallway
        const root = new Hallway(0, 0, 40, 0); // Longer root
        components.push(root);
        
        // Add root connectors to queue (global coords)
        root.connectors.forEach(c => {
            const globalC = root.getGlobalConnector(c.x, c.z, c.dir);
            globalC.type = c.type; // Pass type
            openConnectors.push(globalC);
        });

        // 2. Generation Loop
        const maxComponents = 150; // Limit size
        let attempts = 0;
        const maxAttempts = 2000;

        while (openConnectors.length > 0 && components.length < maxComponents && attempts < maxAttempts) {
            attempts++;
            
            // Pick random connector
            const cIdx = Math.floor(Math.random() * openConnectors.length);
            const connector = openConnectors[cIdx];
            openConnectors.splice(cIdx, 1); // Remove used connector

            // Decide what to attach based on connector type
            let isRoom = false;
            
            if (connector.type === 'end') {
                // End connector: Prefer extending Hallway (90%)
                // Small chance to stop or place room? Let's just extend for now to make long halls.
                isRoom = false;
                // Optional: Randomly stop branch?
                if (Math.random() > 0.9) continue; 
            } else {
                // Side connector: High chance of Room (90%)
                // Small chance of branching Hallway (10%)
                isRoom = Math.random() < 0.9;
            }
            
            let newComp = null;

            if (isRoom) {
                // Create Room
                // Use odd multiples of 4 (12, 20) to ensure a center tile for the door
                // 3 * 4 = 12, 5 * 4 = 20
                const width = (Math.floor(Math.random() * 2) * 2 + 3) * 4; 
                const depth = (Math.floor(Math.random() * 2) * 2 + 3) * 4;
                
                const dir = connector.dir;
                let dx = 0, dz = 0;
                
                // Calculate center based on direction and dimensions
                // Room entry is at its local Z+ (South)
                // We rotate the room so its entry faces the connector.
                
                if (dir === 0) dz = -depth/2; // Connector points North. Room is North.
                else if (dir === 1) dx = depth/2; // Connector points East. Room is East.
                else if (dir === 2) dz = depth/2; // Connector points South. Room is South.
                else if (dir === 3) dx = -depth/2; // Connector points West. Room is West.
                
                const cx = connector.x + dx;
                const cz = connector.z + dz;
                
                newComp = new Room(cx, cz, width, depth, dir);
                
            } else {
                // Create Hallway
                // Longer hallways for branches (20-40)
                const length = (Math.floor(Math.random() * 6) + 5) * 4; // 20, 24, ..., 40
                const dir = connector.dir;
                let dx = 0, dz = 0;
                if (dir === 0) dz = -length/2;
                else if (dir === 1) dx = length/2;
                else if (dir === 2) dz = length/2;
                else if (dir === 3) dx = -length/2;
                
                const cx = connector.x + dx;
                const cz = connector.z + dz;
                
                newComp = new Hallway(cx, cz, length, dir);
            }

            // Check Radius (Play Area)
            // Map radius is ~70. Keep components within ~65 to be safe.
            const distFromCenter = Math.sqrt(newComp.x * newComp.x + newComp.z * newComp.z);
            if (distFromCenter > 65) {
                continue;
            }

            // Check Overlap
            let overlap = false;
            for (const other of components) {
                if (newComp.overlaps(other)) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                components.push(newComp);
                // Add new connectors
                // The "entry" connector is the one opposite to `connector.dir`
                
                newComp.connectors.forEach(c => {
                    const globalC = newComp.getGlobalConnector(c.x, c.z, c.dir);
                    globalC.type = c.type; // Pass type
                    // Don't add the entry connector back to queue
                    // Simple check: distance to source connector
                    const d = Math.abs(globalC.x - connector.x) + Math.abs(globalC.z - connector.z);
                    if (d > 0.1) {
                        openConnectors.push(globalC);
                    }
                });
            }
        }

        // 3. Identify Active Connectors (where components join)
        const allConnectors = [];
        components.forEach(c => {
            c.connectors.forEach(localC => {
                allConnectors.push(c.getGlobalConnector(localC.x, localC.z, localC.dir));
            });
        });
        
        const activeConnectors = [];
        for(let i=0; i<allConnectors.length; i++) {
            for(let j=i+1; j<allConnectors.length; j++) {
                const c1 = allConnectors[i];
                const c2 = allConnectors[j];
                const d = Math.abs(c1.x - c2.x) + Math.abs(c1.z - c2.z);
                if (d < 0.1) {
                    activeConnectors.push(c1); // Store location
                }
            }
        }

        // 4. Render Components
        const dummy = new THREE.Object3D();
        let wallIdx = 0;
        let floorIdx = 0;
        let bloodIdx = 0;
        let bedIdx = 0;
        let ivIdx = 0;
        let cabinetIdx = 0;
        let paperIdx = 0;
        let wheelchairIdx = 0;
        let binIdx = 0;
        let partitionIdx = 0;

        components.forEach(comp => {
            // Floor
            // Tiled floor for the component size
            const w = (comp.rotation % 2 === 0) ? comp.width : comp.depth;
            const d = (comp.rotation % 2 === 0) ? comp.depth : comp.width;
            
            const tilesX = w / 4;
            const tilesZ = d / 4;
            
            // Top-left corner (min X, min Z) of the component
            const startX = comp.x - w/2 + 2;
            const startZ = comp.z - d/2 + 2;

            for(let i=0; i<tilesX; i++) {
                for(let j=0; j<tilesZ; j++) {
                    dummy.position.set(startX + i*4, 0.01, startZ + j*4);
                    dummy.rotation.set(-Math.PI/2, 0, 0);
                    dummy.scale.set(1, 1, 1);
                    dummy.updateMatrix();
                    this.instanced.floors.setMatrixAt(floorIdx++, dummy.matrix);
                    
                    // Blood Decal (15% chance per tile)
                    if (Math.random() < 0.15) {
                        dummy.position.set(startX + i*4, 0.02, startZ + j*4); // Slightly above floor
                        dummy.rotation.set(-Math.PI/2, 0, Math.random() * Math.PI * 2); // Random rotation
                        const s = 0.8 + Math.random() * 0.4; // Random scale
                        dummy.scale.set(s, s, 1);
                        dummy.updateMatrix();
                        this.instanced.blood.setMatrixAt(bloodIdx++, dummy.matrix);
                    }
                }
            }

            // Walls
            const perimeter = [];
            // Local perimeter segments (x, z, orientation)
            // North (-Z)
            for(let i=0; i<tilesX; i++) perimeter.push({x: -w/2 + 2 + i*4, z: -d/2, dir: 0});
            // South (+Z)
            for(let i=0; i<tilesX; i++) perimeter.push({x: -w/2 + 2 + i*4, z: d/2, dir: 2});
            // West (-X)
            for(let j=0; j<tilesZ; j++) perimeter.push({x: -w/2, z: -d/2 + 2 + j*4, dir: 3});
            // East (+X)
            for(let j=0; j<tilesZ; j++) perimeter.push({x: w/2, z: -d/2 + 2 + j*4, dir: 1});

            perimeter.forEach(p => {
                const wx = comp.x + p.x;
                const wz = comp.z + p.z;
                
                // Check if this wall is a "door"
                // A door is a wall segment close to an active connector.
                let isDoor = false;
                for(const ac of activeConnectors) {
                    const dist = Math.abs(wx - ac.x) + Math.abs(wz - ac.z);
                    // If close enough (within half a tile + epsilon), it's the door tile
                    if (dist < 2.1) {
                        isDoor = true;
                        break;
                    }
                }

                if (!isDoor) {
                    // Create individual mesh for occlusion support
                    const wall = new THREE.Mesh(this.assets.wallGeo, this.assets.wallMat);
                    wall.position.set(wx, 2, wz);
                    
                    // Rotation
                    if (p.dir === 0 || p.dir === 2) wall.rotation.set(0, 0, 0); // N/S walls
                    else wall.rotation.set(0, Math.PI/2, 0); // E/W walls
                    
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    
                    this.scene.add(wall);
                    this.props.push(wall); // Add to props for occlusion system
                    
                    // Collision
                    const size = (p.dir === 0 || p.dir === 2) ? new THREE.Vector3(4, 4, 0.5) : new THREE.Vector3(0.5, 4, 4);
                    this.addCollisionBoxInternal(new THREE.Vector3(wx, 2, wz), size);
                }
            });

            // Props (Beds, IV Stands, Cabinets, Wheelchairs)
            if (comp.type === 'room') {
                // Probability check: 60% chance to have beds
                if (Math.random() < 0.6) {
                    // Cluster count: 2 to 5 beds
                    const bedCount = Math.floor(Math.random() * 4) + 2;
                    
                    for(let k=0; k<bedCount; k++) {
                        // Random position within room (padding 2 units)
                        const bx = comp.x + (Math.random() - 0.5) * (w - 4);
                        const bz = comp.z + (Math.random() - 0.5) * (d - 4);
                        
                        // Random rotation (chaos)
                        const brot = Math.random() * Math.PI * 2;
                        
                        // Frame
                        dummy.position.set(bx, 0.2, bz);
                        dummy.rotation.set(0, brot, 0);
                        dummy.scale.set(1, 1, 1);
                        dummy.updateMatrix();
                        this.instanced.bedFrames.setMatrixAt(bedIdx, dummy.matrix);
                        
                        // Mattress (slightly offset/rotated for decay?)
                        // Let's keep it aligned for now but maybe slightly shifted
                        dummy.position.set(bx, 0.5, bz);
                        dummy.rotation.set(0, brot + (Math.random() - 0.5) * 0.1, 0); // Slight twist
                        dummy.updateMatrix();
                        this.instanced.bedMattresses.setMatrixAt(bedIdx, dummy.matrix);
                        
                        bedIdx++;
                        
                        // Collision (approximate)
                        this.addCollisionBoxInternal(new THREE.Vector3(bx, 0.25, bz), new THREE.Vector3(1.2, 0.5, 2.2));

                        // IV Stand (30% chance per bed)
                        if (Math.random() < 0.3) {
                            const ivX = bx + (Math.random() - 0.5) * 1.5;
                            const ivZ = bz + (Math.random() - 0.5) * 1.5;
                            
                            dummy.position.set(ivX, 0.9, ivZ);
                            dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
                            dummy.scale.set(1, 1, 1);
                            dummy.updateMatrix();
                            this.instanced.ivStands.setMatrixAt(ivIdx++, dummy.matrix);
                        }
                    }
                }

                // Filing Cabinets (Against walls)
                if (Math.random() < 0.4) {
                    const count = Math.floor(Math.random() * 2) + 1;
                    for(let k=0; k<count; k++) {
                        // Pick a random wall
                        const side = Math.floor(Math.random() * 4);
                        let cx = comp.x, cz = comp.z, rot = 0;
                        const offset = 0.8; // Distance from wall center
                        
                        if (side === 0) { cz -= d/2 - offset; rot = 0; } // North
                        else if (side === 1) { cx += w/2 - offset; rot = Math.PI/2; } // East
                        else if (side === 2) { cz += d/2 - offset; rot = Math.PI; } // South
                        else { cx -= w/2 - offset; rot = -Math.PI/2; } // West
                        
                        dummy.position.set(cx, 0.9, cz);
                        dummy.rotation.set(0, rot, 0);
                        dummy.scale.set(1, 1, 1);
                        dummy.updateMatrix();
                        this.instanced.cabinets.setMatrixAt(cabinetIdx++, dummy.matrix);
                        
                        // Collision
                        this.addCollisionBoxInternal(new THREE.Vector3(cx, 0.9, cz), new THREE.Vector3(0.8, 1.8, 0.8));
                    }
                }

                // Wheelchairs (Random corners) - Detailed Group
                if (Math.random() < 0.2) {
                    const wx = comp.x + (Math.random() - 0.5) * (w - 3);
                    const wz = comp.z + (Math.random() - 0.5) * (d - 3);
                    
                    const wheelchairGroup = new THREE.Group();
                    wheelchairGroup.position.set(wx, 0, wz);
                    wheelchairGroup.rotation.set(0, Math.random() * Math.PI * 2, 0);
                    
                    // Materials
                    const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.8 });
                    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x221111, roughness: 0.9 });
                    
                    // Seat
                    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), leatherMat);
                    seat.position.y = 0.5;
                    wheelchairGroup.add(seat);
                    
                    // Backrest
                    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), leatherMat);
                    back.position.set(0, 0.8, -0.25);
                    wheelchairGroup.add(back);
                    
                    // Large Wheels (Side)
                    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16);
                    wheelGeo.rotateZ(Math.PI/2);
                    
                    const wheelL = new THREE.Mesh(wheelGeo, metalMat);
                    wheelL.position.set(-0.3, 0.35, 0);
                    wheelchairGroup.add(wheelL);
                    
                    const wheelR = new THREE.Mesh(wheelGeo, metalMat);
                    wheelR.position.set(0.3, 0.35, 0);
                    wheelchairGroup.add(wheelR);
                    
                    // Small Wheels (Front)
                    const smallWheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8);
                    smallWheelGeo.rotateZ(Math.PI/2);
                    
                    const swL = new THREE.Mesh(smallWheelGeo, metalMat);
                    swL.position.set(-0.2, 0.1, 0.3);
                    wheelchairGroup.add(swL);
                    
                    const swR = new THREE.Mesh(smallWheelGeo, metalMat);
                    swR.position.set(0.2, 0.1, 0.3);
                    wheelchairGroup.add(swR);

                    // Armrests
                    const armGeo = new THREE.BoxGeometry(0.05, 0.05, 0.4);
                    const armL = new THREE.Mesh(armGeo, metalMat);
                    armL.position.set(-0.28, 0.7, 0);
                    wheelchairGroup.add(armL);
                    
                    const armR = new THREE.Mesh(armGeo, metalMat);
                    armR.position.set(0.28, 0.7, 0);
                    wheelchairGroup.add(armR);
                    
                    this.scene.add(wheelchairGroup);
                    this.props.push(wheelchairGroup); // Add to props (might need to traverse for occlusion, but group is fine)
                    
                    // Collision
                    this.addCollisionBoxInternal(new THREE.Vector3(wx, 0.5, wz), new THREE.Vector3(0.8, 1.0, 0.8));
                }

                // Scattered Papers (Floor) - Doubled Count
                if (Math.random() < 0.8) { // Increased chance
                    const paperCount = Math.floor(Math.random() * 8) + 6; // Doubled count (was 3-8)
                    for(let k=0; k<paperCount; k++) {
                        const px = comp.x + (Math.random() - 0.5) * (w - 2);
                        const pz = comp.z + (Math.random() - 0.5) * (d - 2);
                        
                        dummy.position.set(px, 0.02, pz);
                        dummy.rotation.set(-Math.PI/2, 0, Math.random() * Math.PI * 2);
                        dummy.scale.set(1, 1, 1);
                        dummy.updateMatrix();
                        this.instanced.papers.setMatrixAt(paperIdx++, dummy.matrix);
                    }
                }

                // Medical Waste Bins (Corners/Walls)
                if (Math.random() < 0.5) {
                    const bx = comp.x + (Math.random() - 0.5) * (w - 3);
                    const bz = comp.z + (Math.random() - 0.5) * (d - 3);
                    
                    dummy.position.set(bx, 0.3, bz);
                    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
                    dummy.scale.set(1, 1, 1);
                    dummy.updateMatrix();
                    this.instanced.bins.setMatrixAt(binIdx++, dummy.matrix);
                    
                    // Collision
                    this.addCollisionBoxInternal(new THREE.Vector3(bx, 0.3, bz), new THREE.Vector3(0.5, 0.6, 0.5));
                }

                // Curtain Partitions (Near beds)
                if (Math.random() < 0.4) {
                    const px = comp.x + (Math.random() - 0.5) * (w - 4);
                    const pz = comp.z + (Math.random() - 0.5) * (d - 4);
                    const rot = Math.random() > 0.5 ? 0 : Math.PI/2;

                    dummy.position.set(px, 1.0, pz);
                    dummy.rotation.set(0, rot, 0);
                    dummy.scale.set(1, 1, 1);
                    dummy.updateMatrix();
                    this.instanced.partitions.setMatrixAt(partitionIdx++, dummy.matrix);
                    
                    // Collision (Thin)
                    const size = rot === 0 ? new THREE.Vector3(2.0, 2.0, 0.1) : new THREE.Vector3(0.1, 2.0, 2.0);
                    this.addCollisionBoxInternal(new THREE.Vector3(px, 1.0, pz), size);
                }
            }
        });

        // this.instanced.walls.count = wallIdx; // No longer used
        this.instanced.floors.count = floorIdx;
        this.instanced.blood.count = bloodIdx;
        this.instanced.bedFrames.count = bedIdx;
        this.instanced.bedMattresses.count = bedIdx;
        this.instanced.ivStands.count = ivIdx;
        this.instanced.cabinets.count = cabinetIdx;
        this.instanced.papers.count = paperIdx;
        // this.instanced.wheelchairs.count = wheelchairIdx;
        this.instanced.bins.count = binIdx;
        this.instanced.partitions.count = partitionIdx;
        
        for (const key in this.instanced) {
            // Skip walls as it's not in use/added
            if (key === 'walls') continue;
            this.instanced[key].instanceMatrix.needsUpdate = true;
        }

        // Player Spawn
        this.playerSpawn = new THREE.Vector3(0, 0, 0);

        // Item Spawns
        this.itemSpawns = [];
        components.filter(c => c.type === 'room').forEach(r => {
            this.itemSpawns.push(new THREE.Vector3(r.x, 0, r.z));
        });

        // Extraction Zone
        const rooms = components.filter(c => c.type === 'room');
        let exitLocation = null;
        
        if (rooms.length > 0) {
            exitLocation = rooms[rooms.length-1];
        } else if (components.length > 0) {
            // Fallback to last component (Hallway)
            exitLocation = components[components.length-1];
        }

        if (exitLocation) {
            const exitGeo = new THREE.BoxGeometry(2, 4, 0.5);
            const exitMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x004400 });
            this.extractionZone = new THREE.Mesh(exitGeo, exitMat);
            this.extractionZone.position.set(exitLocation.x, 2, exitLocation.z);
            this.scene.add(this.extractionZone);
        } else {
            // Fallback if map empty (shouldn't happen)
            const exitGeo = new THREE.BoxGeometry(2, 4, 0.5);
            const exitMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x004400 });
            this.extractionZone = new THREE.Mesh(exitGeo, exitMat);
            this.extractionZone.position.set(0, 2, 10);
            this.scene.add(this.extractionZone);
        }
    }

    addCollisionBoxInternal(position, size) {
        const box = new THREE.Box3().setFromCenterAndSize(position, size);
        const collisionObj = { box: box };
        this.walls.push(collisionObj);
    }
}
