import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cone } from '@react-three/drei';
import * as THREE from 'three';

// Constants
const GAME_SPEED = 20;
const BOUNDS = { x: 8, y: 6 };
const OBSTACLE_COUNT = 30;

// Player Ship Component
const PlayerShip = ({ playerRef }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && playerRef.current) {
       groupRef.current.position.copy(playerRef.current.pos);
       groupRef.current.rotation.copy(playerRef.current.rot);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Body */}
      <mesh receiveShadow castShadow>
        <coneGeometry args={[0.5, 2, 3]} />
        <meshLambertMaterial color="#e2e8f0" flatShading />
      </mesh>
      {/* Left Wing */}
      <mesh position={[-0.8, -0.2, -0.2]} rotation={[0, 0, Math.PI / 8]} receiveShadow castShadow>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshLambertMaterial color="#3b82f6" flatShading />
      </mesh>
      {/* Right Wing */}
      <mesh position={[0.8, -0.2, -0.2]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshLambertMaterial color="#3b82f6" flatShading />
      </mesh>
    </group>
  );
};

// Scene Manager
const GameScene = ({ isGameOver, onGameOver, score, setScore }) => {
  const playerRef = useRef({ pos: new THREE.Vector3(0, 0, 0), rot: new THREE.Euler(0, 0, 0) });
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });
  const [lasers, setLasers] = useState([]);
  
  // Obstacles state
  const obstacles = useRef(
    Array.from({ length: OBSTACLE_COUNT }).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS.x * 3,
        (Math.random() - 0.5) * BOUNDS.y * 3,
        -Math.random() * 150 - 20
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: Math.random() * 1.5 + 0.5,
      active: true
    }))
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'w' || key === 's' || key === 'd' || key === ' ') {
        if (key === ' ') e.preventDefault();
        setKeys((k) => ({ ...k, [key === ' ' ? 'space' : key]: true }));
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'w' || key === 's' || key === 'd' || key === ' ') {
        setKeys((k) => ({ ...k, [key === ' ' ? 'space' : key]: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Fire mechanism
  useEffect(() => {
    if (keys.space && !isGameOver) {
      setLasers((prev) => [
        ...prev,
        { pos: playerRef.current.pos.clone().add(new THREE.Vector3(0, 0, -1)), id: Date.now() + Math.random() }
      ]);
      // Small debounce hack
      setKeys(k => ({...k, space: false}));
    }
  }, [keys.space, isGameOver]);

  useFrame((state, delta) => {
    if (isGameOver) return;

    // Movement logic
    const moveSpeed = 10 * delta;
    if (keys.w && playerRef.current.pos.y < BOUNDS.y) playerRef.current.pos.y += moveSpeed;
    if (keys.s && playerRef.current.pos.y > -BOUNDS.y) playerRef.current.pos.y -= moveSpeed;
    if (keys.d && playerRef.current.pos.x < BOUNDS.x) playerRef.current.pos.x += moveSpeed;
    if (keys.a && playerRef.current.pos.x > -BOUNDS.x) playerRef.current.pos.x -= moveSpeed;

    // Tilting based on X movement
    const targetZRot = (keys.a ? 0.5 : 0) + (keys.d ? -0.5 : 0);
    playerRef.current.rot.z = THREE.MathUtils.lerp(playerRef.current.rot.z, targetZRot, 0.1);
    
    // Pitch based on Y movement
    const targetXRot = (keys.w ? -0.2 : 0) + (keys.s ? 0.2 : 0);
    playerRef.current.rot.x = THREE.MathUtils.lerp(playerRef.current.rot.x, targetXRot, 0.1);

    // Update active lasers
    setLasers((prev) => 
      prev
        .map(laser => ({ ...laser, pos: laser.pos.add(new THREE.Vector3(0, 0, -50 * delta)) }))
        .filter(laser => laser.pos.z > -200) // Despawn far away
    );

    // Obstacle logic and collisions
    let scoreBump = 0;
    
    obstacles.current.forEach((obs) => {
      if (!obs.active) return;
      
      obs.pos.z += GAME_SPEED * delta;
      obs.rot.x += 1 * delta;
      obs.rot.y += 1 * delta;

      // Reset offscreen
      if (obs.pos.z > 5) {
        obs.pos.set(
          (Math.random() - 0.5) * BOUNDS.x * 3,
          (Math.random() - 0.5) * BOUNDS.y * 3,
          -150
        );
        obs.active = true;
      }

      // Check collision with player
      if (obs.pos.distanceTo(playerRef.current.pos) < obs.scale + 0.5) {
        onGameOver();
      }

      // Check collision with lasers
      lasers.forEach(laser => {
        if (laser.pos.distanceTo(obs.pos) < obs.scale + 0.5) {
          obs.active = false; // Destroy asteroid
          scoreBump += 10;
          laser.pos.z = -1000; // Instantly despawn laser
        }
      });
    });

    if (scoreBump > 0) setScore(s => s + scoreBump);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      
      {/* Render Player via Ref Passing */}
      <PlayerShip playerRef={playerRef} />

      {/* Render Obstacles */}
      {obstacles.current.map((obs, i) => (
        <mesh key={i} visible={obs.active} position={obs.pos.toArray()} rotation={obs.rot.toArray()} scale={obs.scale} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshLambertMaterial color="#94a3b8" flatShading />
        </mesh>
      ))}

      {/* Render Lasers */}
      {lasers.map((laser) => (
        <mesh key={laser.id} position={laser.pos.toArray()}>
          <boxGeometry args={[0.2, 0.2, 4]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}
      
      {/* Background Starfield elements */}
      <Stars />
    </>
  );
};

// Simple pseudo-starfield moving past
const Stars = () => {
    const starsRef = useRef();
    
    useFrame((_, delta) => {
        if (starsRef.current) {
            starsRef.current.rotation.z += 0.05 * delta;
            starsRef.current.position.z += GAME_SPEED * delta * 0.5;
            if (starsRef.current.position.z > 50) {
               starsRef.current.position.z = -100;
            }
        }
    });

    return (
        <points ref={starsRef} position={[0, 0, -100]}>
            <bufferGeometry>
                <bufferAttribute
                   attach="attributes-position"
                   count={1000}
                   array={new Float32Array(3000).map(() => (Math.random() - 0.5) * 400)}
                   itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.5} color="#ffffff" />
        </points>
    );
};

const StarChaserWindow = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameId, setGameId] = useState(0);

  const handleRestart = () => {
    setIsGameOver(false);
    setScore(0);
    setGameId(id => id + 1);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black relative select-none">
       {/* UI Overlay */}
       <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>
          <div className="text-white text-xl">
             SCORE: {score.toString().padStart(6, '0')}
          </div>
          <div className="text-white text-right">
             <div className="text-yellow-400 font-bold mb-1">CONTROLS</div>
             <div className="text-sm">WASD - Move</div>
             <div className="text-sm">SPACE - Shoot</div>
          </div>
       </div>

       {isGameOver && (
          <div className="absolute inset-0 bg-red-900/50 flex flex-col items-center justify-center z-20">
             <h2 className="text-4xl text-white font-bold mb-4 font-mono shadow-black drop-shadow-lg">GAME OVER</h2>
             <button 
                className="px-6 py-2 bg-white text-black font-bold font-mono hover:bg-yellow-400 border-[3px] border-b-black border-r-black border-l-gray-300 border-t-gray-300 active:border-b-gray-300 active:border-r-gray-300 active:border-t-black active:border-l-black"
                onClick={handleRestart}
             >
                RETRY
             </button>
          </div>
       )}

       <Canvas 
          shadows 
          camera={{ position: [0, 4, 15], fov: 60 }} 
          dpr={0.45} // Force low resolution WebGL output
          className="w-full h-full cursor-crosshair [image-rendering:pixelated]"
       >
          <color attach="background" args={['#050510']} />
          <fog attach="fog" args={['#050510', 50, 150]} />
          <GameScene key={gameId} isGameOver={isGameOver} onGameOver={() => setIsGameOver(true)} score={score} setScore={setScore} />
       </Canvas>

       {/* Retro CRT Post-Processing Overlay */}
       <div className="crt-overlay pointer-events-none absolute inset-0 z-[100]" />
    </div>
  );
};

export default StarChaserWindow;
