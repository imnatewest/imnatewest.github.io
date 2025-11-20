/**
 * Renderer Class
 * ============================================================================
 * Manages the Three.js rendering setup including camera, scene, lighting,
 * and viewport. Configures an isometric orthographic view for the game world
 * with proper shadows and responsive sizing.
 * ============================================================================
 */

import * as THREE from 'three';

export class Renderer {
    constructor() {
        // ====================================================================
        // Scene Setup
        // ====================================================================
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 90);  // Distance fog for depth

        // ====================================================================
        // Camera Setup (Orthographic Isometric View)
        // ====================================================================
        // Orthographic camera keeps objects the same size regardless of distance
        // Perfect for isometric gameplay perspective
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20; // View distance from center (controls zoom level)
        
        // Create orthographic camera with symmetric view volume
        this.camera = new THREE.OrthographicCamera(
            -d * aspect,  // left
            d * aspect,   // right
            d,            // top
            -d,           // bottom
            1,            // near clipping plane
            1000          // far clipping plane
        );
        
        // Position camera for 45° isometric view
        // Equal X, Y, Z distances create the classic isometric angle
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(this.scene.position); // Point camera at world center
        
        // ====================================================================
        // WebGL Renderer Setup
        // ====================================================================
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Enable shadow rendering for depth and realism
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow edges
        
        // Inject renderer into the DOM
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // ====================================================================
        // Lighting Setup
        // ====================================================================
        
        // Ambient light provides base illumination for all objects
        // Prevents completely black shadows
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        // Directional light simulates sun/primary light source
        // Casts shadows and provides main scene illumination
        this.dirLight = new THREE.DirectionalLight(0xfff0dd, 1.2); // Warm sunlight
        this.dirLight.position.set(20, 40, 10); // High angle like midday sun
        this.dirLight.castShadow = true;
        
        // Shadow map resolution (higher = sharper shadows, more expensive)
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        
        // Define shadow camera frustum (area that can cast shadows)
        this.dirLight.shadow.camera.top = 30;
        this.dirLight.shadow.camera.bottom = -30;
        this.dirLight.shadow.camera.left = -30;
        this.dirLight.shadow.camera.right = 30;
        
        this.scene.add(this.dirLight);

        // ====================================================================
        // Window Event Handling
        // ====================================================================
        // Recalculate camera and renderer on window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    /**
     * Handle window resize events
     * Recalculates camera aspect ratio and updates renderer size
     */
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        
        // Update orthographic camera bounds based on new aspect ratio
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        
        // Apply changes to camera's projection matrix
        this.camera.updateProjectionMatrix();
        
        // Resize renderer canvas to match new window size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Render one frame
     * Called every frame from the game loop
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

