/**
 * World Class
 * ============================================================================
 * Manages the game world and currently active map. Handles map loading,
 * switching, and cleanup. Acts as a facade/proxy, exposing the active map's
 * properties and methods to the rest of the game without direct coupling.
 * ============================================================================
 */

import { ForestMap } from './maps/ForestMap.js';
import { CityMap } from './maps/CityMap.js';

export class World {
    /**
     * Initialize the world with a scene and particle system reference
     * @param {THREE.Scene} scene - The Three.js scene to render objects into
     * @param {ParticleSystem} particleSystem - System for managing visual effects
     */
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.currentMap = null;  // Currently active map instance
        
        // Load forest map by default on game start
        this.loadMap('forest');
    }

    /**
     * Load a new map by type
     * Clears the current map and initializes the new one
     * @param {string} mapType - Type of map to load ('forest' or 'city')
     */
    loadMap(mapType) {
        // Clean up any existing map first
        this.clear();
        
        // Instantiate the appropriate map based on type
        if (mapType === 'forest') {
            this.currentMap = new ForestMap(this.scene, this.particleSystem);
        } else if (mapType === 'city') {
            this.currentMap = new CityMap(this.scene, this.particleSystem);
        } else {
            // Fallback to forest if unknown map type requested
            console.warn(`Map type '${mapType}' not found, defaulting to Forest.`);
            this.currentMap = new ForestMap(this.scene, this.particleSystem);
        }
        
        // Generate the map's procedural content (terrain, buildings, etc.)
        this.currentMap.generate();
    }

    /**
     * Clear and dispose of the current map
     * Removes all objects from the scene and frees resources
     */
    clear() {
        if (this.currentMap) {
            this.currentMap.dispose();  // Clean up Three.js objects and geometries
            this.currentMap = null;
        }
    }

    /**
     * Update the current map's dynamic elements
     * Called every frame from the game loop
     * @param {number} deltaTime - Time elapsed since last frame (in seconds)
     */
    update(deltaTime) {
        // Only update if map exists and has an update method
        if (this.currentMap && this.currentMap.update) {
            this.currentMap.update(deltaTime);
        }
    }

    // ========================================================================
    // Property Proxies
    // ========================================================================
    // These getters expose the current map's properties without direct access
    // Returns safe defaults (empty arrays/null) when no map is loaded
    
    /** @returns {Array} Collision walls for player physics */
    get walls() { return this.currentMap ? this.currentMap.walls : []; }
    
    /** @returns {Array} Destructible obstacles (trees, crates, etc.) */
    get obstacles() { return this.currentMap ? this.currentMap.obstacles : []; }
    
    /** @returns {Array} Breakable objects that can be destroyed */
    get breakables() { return this.currentMap ? this.currentMap.breakables : []; }
    
    /** @returns {Object|null} Extraction zone position and bounds */
    get extractionZone() { return this.currentMap ? this.currentMap.extractionZone : null; }
    
    /** @returns {boolean} Whether enemies can spawn on this map */
    get allowEnemies() { return this.currentMap ? this.currentMap.allowEnemies : true; }
    
    /** @returns {boolean} Whether items can spawn on this map */
    get allowItems() { return this.currentMap ? this.currentMap.allowItems : true; }
}
