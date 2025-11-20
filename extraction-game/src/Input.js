import * as THREE from 'three';

export class Input {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        this.onEscapePressed = null; // Callback for escape key
        
        // Touch state
        this.touchActive = false;
        
        // Will be set by Game.js
        this.camera = null;
        this.renderer = null;
        this.playerPosition = null;
        
        // Touch coordinates
        this.touchNDC = new THREE.Vector2();

        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
        
        // Touch events
        // Touch events
        document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
    }
    
    setDependencies(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
    }
    
    setPlayerPosition(position) {
        this.playerPosition = position;
    }
    
    onTouchStart(event) {
        // Only handle touch if it's on the canvas (game view)
        // This allows UI buttons to work normally
        if (event.target === this.renderer?.domElement) {
            event.preventDefault();
            if (event.touches.length > 0) {
                this.touchActive = true;
                this.updateTouchPosition(event.touches[0]);
            }
        }
    }
    
    onTouchMove(event) {
        // Only handle touch if it's on the canvas
        if (event.target === this.renderer?.domElement) {
            event.preventDefault();
            if (event.touches.length > 0 && this.touchActive) {
                this.updateTouchPosition(event.touches[0]);
            }
        }
    }
    
    onTouchEnd(event) {
        // Only handle touch if it's on the canvas
        if (event.target === this.renderer?.domElement) {
            event.preventDefault();
            this.touchActive = false;
        }
    }
    
    updateTouchPosition(touch) {
        if (!this.camera || !this.renderer) return;
        
        // Get renderer size
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        
        // Convert touch to normalized device coordinates (-1 to +1)
        this.touchNDC.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.touchNDC.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.attack = true;
                break;
            case 'Escape':
                if (this.onEscapePressed) {
                    this.onEscapePressed();
                }
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.attack = false;
                break;
        }
    }

    getMovementVector() {
        // Touch takes priority over keyboard
        if (this.touchActive && this.playerPosition && this.camera) {
            // Project player position to Normalized Device Coordinates (NDC)
            // This gives us the player's position on the screen (-1 to +1)
            const playerNDC = this.playerPosition.clone().project(this.camera);
            
            // Calculate vector from player to touch point in screen space
            const dx = this.touchNDC.x - playerNDC.x;
            const dy = this.touchNDC.y - playerNDC.y;
            
            // Calculate distance in screen space for deadzone
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Deadzone of 0.05 in NDC space (approx 2.5% of screen)
            if (distance > 0.05) {
                // Normalize the direction
                const len = Math.sqrt(dx*dx + dy*dy);
                const ndx = dx / len;
                const ndy = dy / len;
                
                // Map Screen Space to Input Space
                // Screen Right (+X) -> Input Right (+X)
                // Screen Up (+Y) -> Input Forward (-Z)
                // Note: In NDC, +Y is Up. In 2D Input, usually -Z is Forward.
                // But wait, touchNDC.y is inverted in updateTouchPosition?
                // Let's check updateTouchPosition: 
                // this.touchNDC.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
                // So +1 is Top, -1 is Bottom.
                // So if touch is above player, touchNDC.y > playerNDC.y.
                // We want that to be Forward (-Z).
                // So Z = -dy.
                
                return { x: ndx, z: -ndy };
            } else {
                return { x: 0, z: 0 };
            }
        }
        
        // Fallback to keyboard
        const x = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
        const z = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);
        return { x, z };
    }
}
