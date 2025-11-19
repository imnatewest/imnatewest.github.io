import { ForestMap } from './maps/ForestMap.js';
import { CityMap } from './maps/CityMap.js';

export class World {
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.currentMap = null;
        
        // Load default map
        this.loadMap('forest');
    }

    loadMap(mapType) {
        this.clear();
        
        if (mapType === 'forest') {
            this.currentMap = new ForestMap(this.scene, this.particleSystem);
        } else if (mapType === 'city') {
            this.currentMap = new CityMap(this.scene, this.particleSystem);
        } else {
            console.warn(`Map type '${mapType}' not found, defaulting to Forest.`);
            this.currentMap = new ForestMap(this.scene, this.particleSystem);
        }
        
        this.currentMap.generate();
    }

    clear() {
        if (this.currentMap) {
            this.currentMap.dispose();
            this.currentMap = null;
        }
    }

    // Proxy properties to current map
    get obstacles() { return this.currentMap ? this.currentMap.obstacles : []; }
    get breakables() { return this.currentMap ? this.currentMap.breakables : []; }
    get walls() { return this.currentMap ? this.currentMap.walls : []; }
    get extractionZone() { return this.currentMap ? this.currentMap.extractionZone : null; }
    get allowEnemies() { return this.currentMap ? this.currentMap.allowEnemies : true; }
    get allowItems() { return this.currentMap ? this.currentMap.allowItems : true; }
    
    // Proxy methods if needed, but Game.js mostly accesses properties
}
