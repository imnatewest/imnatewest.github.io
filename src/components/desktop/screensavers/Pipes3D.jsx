import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Pipes3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Classic Windows 3D Pipes colors
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff];
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 80;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting (Classic specular look)
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 20, 30);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(-10, -20, -30);
    scene.add(pointLight);

    // Grid bounds
    const gridLimit = 20;
    const gridSpacing = 4;
    
    // Joint and cylinder generators
    const createJoint = (pos, material) => {
      const geometry = new THREE.SphereGeometry(1.5, 16, 16);
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(pos);
      scene.add(sphere);
      return sphere;
    };

    const createSegment = (startPos, endPos, material) => {
      const distance = startPos.distanceTo(endPos);
      if (distance <= 0.01) return null; // safety against NaN
      
      const geometry = new THREE.CylinderGeometry(1.2, 1.2, distance, 12);
      const cylinder = new THREE.Mesh(geometry, material);
      
      cylinder.position.copy(startPos).lerp(endPos, 0.5);
      cylinder.lookAt(endPos);
      cylinder.rotateX(Math.PI / 2);
      
      scene.add(cylinder);
      return cylinder;
    };

    // State for multiple pipes
    const MAX_PIPES = 5;
    const MAX_SEGMENTS_PER_PIPE = 60;
    let pipes = [];

    // Animation variables
    let animationFrameId;
    let frameCount = 0;
    const DRAW_SPEED = 3; 
    let isClearing = false;

    const startNewPipe = () => {
      if (pipes.length >= MAX_PIPES) return null;

      const color = colors[Math.floor(Math.random() * colors.length)];
      const material = new THREE.MeshPhongMaterial({
        color: color,
        specular: 0x555555,
        shininess: 80,
      });

      const maxSteps = Math.floor(gridLimit / gridSpacing);
      const randomCoord = () => (Math.floor(Math.random() * (maxSteps * 2)) - maxSteps) * gridSpacing;
      
      const startPos = new THREE.Vector3(randomCoord(), randomCoord(), randomCoord());
      createJoint(startPos, material);

      const dirs = [
        new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
        new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
        new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
      ];
      
      const pipe = {
        material,
        currentPos: startPos.clone(),
        segments: 0,
        direction: dirs[Math.floor(Math.random() * 6)].clone()
      };
      
      pipes.push(pipe);
      return pipe;
    };

    const advancePipe = (pipe) => {
        if (pipe.segments >= MAX_SEGMENTS_PER_PIPE) return false;

        const dirs = [
            new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
            new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
        ];

        // Do not go backwards
        const validDirs = dirs.filter(d => d.dot(pipe.direction) > -0.5);

        // Do not go out of bounds
        const safeDirs = validDirs.filter(d => {
            const next = pipe.currentPos.clone().add(d.clone().multiplyScalar(gridSpacing));
            return Math.abs(next.x) <= gridLimit && Math.abs(next.y) <= gridLimit && Math.abs(next.z) <= gridLimit;
        });

        if (safeDirs.length === 0) return false; // Dead end, kill pipe

        const currentSafe = safeDirs.find(d => Math.abs(d.dot(pipe.direction)) > 0.9);
        
        // 30% chance to turn, or 100% if current direction hits a wall
        if (!currentSafe || Math.random() < 0.3) {
            pipe.direction = safeDirs[Math.floor(Math.random() * safeDirs.length)].clone();
        }

        const nextPos = pipe.currentPos.clone().add(pipe.direction.clone().multiplyScalar(gridSpacing));

        createSegment(pipe.currentPos, nextPos, pipe.material);
        createJoint(nextPos, pipe.material);
        
        pipe.currentPos.copy(nextPos);
        pipe.segments++;
        return true;
    };

    // Initialize first pipe
    startNewPipe();

    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      camera.position.x = Math.sin(frameCount * 0.005) * 80;
      camera.position.z = Math.cos(frameCount * 0.005) * 80;
      camera.lookAt(0, 0, 0);

      // Draw pipes step by step
      if (frameCount % DRAW_SPEED === 0 && !isClearing) {
        if (pipes.length > 0) {
            const activePipe = pipes[pipes.length - 1];
            const isAlive = advancePipe(activePipe);
            
            if (!isAlive) {
                if (pipes.length < MAX_PIPES) {
                    startNewPipe();
                } else {
                     isClearing = true;
                     setTimeout(() => {
                        const meshes = scene.children.filter(c => c.type === 'Mesh');
                        meshes.forEach(m => {
                            scene.remove(m);
                            if (m.geometry) m.geometry.dispose();
                            if (m.material) m.material.dispose();
                        });
                        pipes = [];
                        startNewPipe();
                        isClearing = false;
                     }, 2000);
                }
            }
        }
      }

      renderer.render(scene, camera);
      frameCount++;
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Cleanup threejs memory
      scene.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
};

export default Pipes3D;
