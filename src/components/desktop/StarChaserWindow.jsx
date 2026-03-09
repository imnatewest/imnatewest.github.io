import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  sfxLaser, sfxExplosion, sfxPlayerHit, sfxPowerUp, sfxGameOver,
  sfxAsteroidHit, sfxBossWarning, sfxCombo, sfxHazard,
  startAmbience, stopAmbience
} from './starChaserAudio';

// ── Constants ──────────────────────────────────────────────
const BASE_GAME_SPEED = 20;
const MAX_GAME_SPEED = 45;
const SPEED_INCREMENT = 1;
const WARP_INTERVAL = 10;
const BOUNDS = { x: 8, y: 6 };
const OBSTACLE_COUNT = 30;
const FIRE_COOLDOWN = 0.18;
const MAX_HEALTH = 3;
const INVINCIBILITY_DURATION = 1.5;
const EXPLOSION_LIFETIME = 0.5;
const EXPLOSION_PARTICLES = 12;
const POWERUP_SPAWN_INTERVAL = 12;
const RAPID_FIRE_DURATION = 5;
const RAPID_FIRE_COOLDOWN = 0.08;
const SPREAD_SHOT_DURATION = 5;
const TIME_SLOW_DURATION = 4;
const TIME_SLOW_FACTOR = 0.5;
const TRAIL_LENGTH = 12;
const COMBO_WINDOW = 1.5;
const BOSS_INTERVAL = 60;
const BOSS_HP = 10;
const BOSS_POINTS = 200;
const FORMATION_INTERVAL = 20;
const HAZARD_INTERVAL = 45;
const HAZARD_DURATION = 4;
const EVENT_INTERVAL = 30;
const EVENT_DURATION = 8;

// ── Asteroid Types ─────────────────────────────────────────
const ASTEROID_TYPES = {
  small:  { hp: 1, scale: [0.4, 0.8],  color: '#94a3b8', points: 10, splitInto: null },
  medium: { hp: 2, scale: [0.9, 1.3],  color: '#d97706', points: 25, splitInto: null },
  large:  { hp: 3, scale: [1.4, 2.0],  color: '#dc2626', points: 50, splitInto: 'small' },
};

const pickAsteroidType = () => {
  const r = Math.random();
  return r < 0.55 ? 'small' : r < 0.85 ? 'medium' : 'large';
};

const createObstacle = (zMin = -20, zMax = -170) => {
  const type = pickAsteroidType();
  const def = ASTEROID_TYPES[type];
  const scale = def.scale[0] + Math.random() * (def.scale[1] - def.scale[0]);
  return {
    pos: new THREE.Vector3((Math.random() - 0.5) * BOUNDS.x * 3, (Math.random() - 0.5) * BOUNDS.y * 3, zMin + Math.random() * (zMax - zMin)),
    rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
    scale, active: true, type, hp: def.hp, maxHp: def.hp,
  };
};

// ── Formation Generators ───────────────────────────────────
const createWallFormation = () => {
  const gapIdx = Math.floor(Math.random() * 5);
  const obs = [];
  for (let i = 0; i < 7; i++) {
    if (i === gapIdx || i === gapIdx + 1) continue;
    const x = -BOUNDS.x + (i / 6) * BOUNDS.x * 2;
    obs.push({
      pos: new THREE.Vector3(x, (Math.random() - 0.5) * 2, -130),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: 1.0, active: true, type: 'medium', hp: 2, maxHp: 2,
    });
  }
  return obs;
};

const createVFormation = () => {
  const obs = [];
  for (let i = 0; i < 5; i++) {
    const side = i < 3 ? -1 : 1;
    const idx = i < 3 ? i : i - 3;
    obs.push({
      pos: new THREE.Vector3(side * (idx + 1) * 2.5, (idx + 1) * 1.5 - 3, -120 - idx * 8),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: 0.8, active: true, type: 'small', hp: 1, maxHp: 1,
    });
  }
  return obs;
};

const createSpiralFormation = () => {
  const obs = [];
  for (let i = 0; i < 6; i++) {
    obs.push({
      pos: new THREE.Vector3(Math.sin(i * 0.8) * 5, Math.cos(i * 0.8) * 4, -100 - i * 12),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: 0.7, active: true, type: 'small', hp: 1, maxHp: 1,
    });
  }
  return obs;
};

const spawnFormation = () => {
  const r = Math.random();
  if (r < 0.33) return createWallFormation();
  if (r < 0.66) return createVFormation();
  return createSpiralFormation();
};

// ── Explosion System ───────────────────────────────────────
const Explosions = ({ explosions }) => {
  useFrame((_, delta) => {
    explosions.current.forEach((exp) => {
      if (!exp.active) return;
      exp.time += delta;
      if (exp.time > EXPLOSION_LIFETIME) { exp.active = false; return; }
      exp.particles.forEach((p) => p.pos.add(p.vel.clone().multiplyScalar(delta)));
    });
  });

  const particles = [];
  explosions.current.forEach((exp) => {
    if (!exp.active) return;
    const t = exp.time / EXPLOSION_LIFETIME;
    exp.particles.forEach((p, pi) => {
      particles.push({ pos: p.pos, color: p.color, scale: 0.15 * (1 - t * 0.5), opacity: 1 - t, key: `${exp.id}-${pi}` });
    });
  });

  return <>
    {particles.map((p) => (
      <mesh key={p.key} position={p.pos.toArray()} scale={p.scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={p.color} transparent opacity={p.opacity} />
      </mesh>
    ))}
  </>;
};

// ── Engine Trail ───────────────────────────────────────────
const EngineTrail = ({ playerRef }) => {
  const trail = useRef(Array.from({ length: TRAIL_LENGTH }).map(() => ({ pos: new THREE.Vector3(), age: 0 })));

  useFrame(() => {
    if (!playerRef.current) return;
    const t = trail.current;
    for (let i = t.length - 1; i > 0; i--) { t[i].pos.copy(t[i - 1].pos); t[i].age = t[i - 1].age + 0.03; }
    t[0].pos.copy(playerRef.current.pos).add(new THREE.Vector3(0, -0.3, 0.8));
    t[0].age = 0;
  });

  return <>
    {trail.current.map((p, i) => {
      const t = i / TRAIL_LENGTH;
      const opacity = (1 - t) * 0.8;
      if (opacity < 0.05) return null;
      return (
        <mesh key={i} position={p.pos.toArray()} scale={(1 - t) * 0.25}>
          <sphereGeometry args={[1, 4, 4]} />
          <meshBasicMaterial color={t < 0.3 ? '#ffffff' : t < 0.6 ? '#ffaa00' : '#ff4400'} transparent opacity={opacity} />
        </mesh>
      );
    })}
  </>;
};

// ── Player Ship ────────────────────────────────────────────
const PlayerShip = ({ playerRef, isInvincible, hasShield }) => {
  const groupRef = useRef();
  const flashRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerRef.current) return;
    groupRef.current.position.copy(playerRef.current.pos);
    groupRef.current.rotation.copy(playerRef.current.rot);
    if (isInvincible) {
      flashRef.current += delta * 12;
      groupRef.current.visible = Math.sin(flashRef.current) > 0;
    } else { flashRef.current = 0; groupRef.current.visible = true; }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <coneGeometry args={[0.5, 2, 3]} />
        <meshLambertMaterial color="#e2e8f0" flatShading />
      </mesh>
      <mesh position={[-0.8, -0.2, -0.2]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshLambertMaterial color="#3b82f6" flatShading />
      </mesh>
      <mesh position={[0.8, -0.2, -0.2]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshLambertMaterial color="#3b82f6" flatShading />
      </mesh>
      {hasShield && <mesh scale={1.8}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#00ffff" transparent opacity={0.15} wireframe /></mesh>}
    </group>
  );
};

// ── Boss Ship ──────────────────────────────────────────────
const BossShip = ({ boss }) => {
  const groupRef = useRef();
  const pulseRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !boss.current || !boss.current.active) return;
    groupRef.current.position.copy(boss.current.pos);
    groupRef.current.rotation.y += delta * 1.2; // UFO spin
    pulseRef.current += delta * 4;
  });

  if (!boss.current || !boss.current.active) return null;

  const hpRatio = boss.current.hp / BOSS_HP;
  const hullColor = hpRatio > 0.5 ? '#8a8a9a' : '#5a2020';
  const accentColor = hpRatio > 0.5 ? '#7c3aed' : '#ef4444';
  const pulseOpacity = 0.4 + Math.sin(pulseRef.current) * 0.3;

  return (
    <group ref={groupRef}>
      {/* Saucer disc — flat wide cylinder */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.5, 16]} />
        <meshStandardMaterial color={hullColor} flatShading metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Dome cockpit */}
      <mesh position={[0, 0.5, 0]} scale={[1.5, 0.8, 1.5]}>
        <sphereGeometry args={[1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a9ead" metalness={0.3} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Rim lights */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 4) * 3.2, 0, Math.sin(i * Math.PI / 4) * 3.2]} scale={0.2}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color={accentColor} transparent opacity={i % 2 === 0 ? pulseOpacity : 1 - pulseOpacity} />
        </mesh>
      ))}
      {/* Underside glow — tractor beam */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[2, 4, 8, 1, true]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.12} side={2} />
      </mesh>
      {/* Bottom plate */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[2.5, 2.8, 0.2, 12]} />
        <meshStandardMaterial color="#3a3a4a" flatShading metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Threat glow */}
      <pointLight color={accentColor} intensity={2} distance={15} />
    </group>
  );
};

// ── Boss Projectile ────────────────────────────────────────
const BossProjectiles = ({ projectiles }) => (
  <>
    {projectiles.current.filter(p => p.active).map(p => (
      <mesh key={p.id} position={p.pos.toArray()}>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    ))}
  </>
);

// ── Hazard Gate ────────────────────────────────────────────
const HazardGate = ({ hazard }) => {
  if (!hazard.current || !hazard.current.active) return null;
  const h = hazard.current;
  return (
    <group position={[0, 0, h.z]}>
      {/* Left pylon */}
      <mesh position={[-BOUNDS.x - 1, h.gapY - 2.5, 0]}>
        <boxGeometry args={[1, BOUNDS.y * 3, 0.5]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0022" emissiveIntensity={2} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* Right pylon */}
      <mesh position={[BOUNDS.x + 1, h.gapY + 2.5, 0]}>
        <boxGeometry args={[1, BOUNDS.y * 3, 0.5]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0022" emissiveIntensity={2} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, h.gapY + h.gapSize / 2 + BOUNDS.y / 2 + 0.5, 0]}>
        <boxGeometry args={[BOUNDS.x * 3, BOUNDS.y, 0.3]} />
        <meshBasicMaterial color="#ff0044" transparent opacity={0.35} />
      </mesh>
      {/* Bottom beam */}
      <mesh position={[0, h.gapY - h.gapSize / 2 - BOUNDS.y / 2 - 0.5, 0]}>
        <boxGeometry args={[BOUNDS.x * 3, BOUNDS.y, 0.3]} />
        <meshBasicMaterial color="#ff0044" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

// ── Power-Up Mesh ──────────────────────────────────────────
const PowerUpMesh = ({ powerup }) => {
  const meshRef = useRef();
  useFrame((_, delta) => { if (meshRef.current) { meshRef.current.rotation.y += 3 * delta; meshRef.current.rotation.x += 1.5 * delta; } });
  const colors = { rapidfire: '#facc15', shield: '#22d3ee', spreadshot: '#22c55e', timeslow: '#a855f7' };
  const color = colors[powerup.kind] || '#fff';
  return (
    <mesh ref={meshRef} position={powerup.pos.toArray()} visible={powerup.active} scale={0.6}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
    </mesh>
  );
};

// ── Camera Shake ───────────────────────────────────────────
const CameraShake = ({ shakeRef }) => {
  const { camera } = useThree();
  const basePos = useMemo(() => camera.position.clone(), [camera]);
  useFrame((_, delta) => {
    if (shakeRef.current > 0) {
      camera.position.set(basePos.x + (Math.random() - 0.5) * shakeRef.current * 2, basePos.y + (Math.random() - 0.5) * shakeRef.current * 2, basePos.z);
      shakeRef.current = Math.max(0, shakeRef.current - delta * 4);
    } else camera.position.copy(basePos);
  });
  return null;
};



// ── Starfield ──────────────────────────────────────────────
const Stars = ({ gameSpeed }) => {
  const starsRef = useRef();
  const positions = useMemo(() => new Float32Array(3000).map(() => (Math.random() - 0.5) * 400), []);
  useFrame((_, delta) => {
    if (!starsRef.current) return;
    starsRef.current.rotation.z += 0.05 * delta;
    starsRef.current.position.z += gameSpeed * delta * 0.5;
    if (starsRef.current.position.z > 50) starsRef.current.position.z = -100;
  });
  return (
    <points ref={starsRef} position={[0, 0, -100]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" />
    </points>
  );
};

// ── MAIN GAME SCENE ────────────────────────────────────────
const GameScene = ({ isGameOver, onGameOver, score, setScore, health, setHealth, setWarpLevel, setActivePowerUp, statsRef, setHudAlert, setComboDisplay, fogRef }) => {
  const playerRef = useRef({ pos: new THREE.Vector3(0, 0, 0), rot: new THREE.Euler(0, 0, 0) });
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });
  const [lasers, setLasers] = useState([]);
  const lastFiredRef = useRef(0);
  const shakeRef = useRef(0);
  const invincibleRef = useRef(0);
  const gameTimeRef = useRef(0);
  const lastWarpRef = useRef(0);
  const gameSpeedRef = useRef(BASE_GAME_SPEED);
  const explosions = useRef([]);
  const explosionIdRef = useRef(0);

  // Power-ups
  const powerUps = useRef([]);
  const lastPowerUpSpawnRef = useRef(0);
  const rapidFireUntilRef = useRef(0);
  const spreadShotUntilRef = useRef(0);
  const timeSlowUntilRef = useRef(0);
  const shieldActiveRef = useRef(false);
  const [hasShield, setHasShield] = useState(false);

  // Boss
  const boss = useRef(null);
  const bossProjectiles = useRef([]);
  const lastBossSpawnRef = useRef(0);
  const bossWarningRef = useRef(0);
  const lastBossShotRef = useRef(0);

  // Formations
  const lastFormationRef = useRef(0);

  // Hazard
  const hazard = useRef(null);
  const lastHazardRef = useRef(0);

  // Combo
  const comboRef = useRef({ count: 0, lastKillTime: 0, best: 0 });

  // Random events
  const lastEventRef = useRef(0);
  const activeEventRef = useRef(null);

  // Obstacles
  const obstacles = useRef(Array.from({ length: OBSTACLE_COUNT }).map(() => createObstacle()));

  // Input — WASD + Arrow keys + Space
  useEffect(() => {
    const keyMap = { arrowup: 'w', arrowdown: 's', arrowleft: 'a', arrowright: 'd', ' ': 'space' };
    const resolve = (e) => {
      const k = e.key.toLowerCase();
      if (keyMap[k]) return keyMap[k];
      if ('awsd'.includes(k)) return k;
      return null;
    };
    const down = (e) => {
      const mapped = resolve(e);
      if (!mapped) return;
      if (mapped === 'space' || e.key.startsWith('Arrow')) e.preventDefault();
      setKeys(prev => ({ ...prev, [mapped]: true }));
    };
    const up = (e) => {
      const mapped = resolve(e);
      if (mapped) setKeys(prev => ({ ...prev, [mapped]: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const spawnExplosion = (position, big = false) => {
    const count = big ? EXPLOSION_PARTICLES * 2 : EXPLOSION_PARTICLES;
    const particles = Array.from({ length: count }).map(() => {
      const dir = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).normalize();
      return { pos: position.clone(), vel: dir.multiplyScalar(big ? 6 + Math.random() * 12 : 4 + Math.random() * 8), color: ['#ff6600', '#ffaa00', '#ff3300', '#ffcc00', '#ffffff'][Math.floor(Math.random() * 5)] };
    });
    explosions.current.push({ id: explosionIdRef.current++, time: 0, active: true, particles });
  };

  const respawnObstacle = (obs) => {
    const type = pickAsteroidType();
    const def = ASTEROID_TYPES[type];
    obs.pos.set((Math.random() - 0.5) * BOUNDS.x * 3, (Math.random() - 0.5) * BOUNDS.y * 3, -150 - Math.random() * 50);
    obs.type = type; obs.hp = def.hp; obs.maxHp = def.hp;
    obs.scale = def.scale[0] + Math.random() * (def.scale[1] - def.scale[0]);
    obs.active = true;
  };

  const registerKill = (now, points) => {
    const combo = comboRef.current;
    if (now - combo.lastKillTime < COMBO_WINDOW) {
      combo.count++;
      sfxCombo(combo.count);
    } else {
      combo.count = 1;
    }
    combo.lastKillTime = now;
    combo.best = Math.max(combo.best, combo.count);
    const multiplier = Math.min(combo.count, 8);
    const finalPoints = points * multiplier;
    setComboDisplay(combo.count > 1 ? `x${combo.count}` : '');
    statsRef.current.kills++;
    statsRef.current.longestCombo = combo.best;
    return finalPoints;
  };

  useFrame((state, delta) => {
    if (isGameOver) return;
    const now = state.clock.getElapsedTime();
    gameTimeRef.current += delta;
    statsRef.current.timeSurvived = gameTimeRef.current;

    // Time slow effect
    const isTimeSlow = now < timeSlowUntilRef.current;
    const effectiveDelta = isTimeSlow ? delta * TIME_SLOW_FACTOR : delta;
    const isRapidFire = now < rapidFireUntilRef.current;
    const isSpreadShot = now < spreadShotUntilRef.current;

    // Active power-up indicator
    if (isRapidFire) setActivePowerUp('rapidfire');
    else if (isSpreadShot) setActivePowerUp('spreadshot');
    else if (isTimeSlow) setActivePowerUp('timeslow');
    else if (shieldActiveRef.current) setActivePowerUp('shield');
    else setActivePowerUp(null);

    // Warp level
    const warpTick = Math.floor(gameTimeRef.current / WARP_INTERVAL);
    if (warpTick > lastWarpRef.current) {
      lastWarpRef.current = warpTick;
      gameSpeedRef.current = Math.min(MAX_GAME_SPEED, gameSpeedRef.current + SPEED_INCREMENT);
      setWarpLevel(warpTick + 1);
    }
    const gameSpeed = isTimeSlow ? gameSpeedRef.current * TIME_SLOW_FACTOR : gameSpeedRef.current;

    // Fog (for nebula event)
    if (fogRef.current) {
      const targetNear = activeEventRef.current === 'nebula' ? 10 : 50;
      const targetFar = activeEventRef.current === 'nebula' ? 60 : 150;
      fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, targetNear, 0.05);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFar, 0.05);
    }

    // Invincibility
    if (invincibleRef.current > 0) invincibleRef.current -= delta;

    // Combo timeout
    if (now - comboRef.current.lastKillTime > COMBO_WINDOW && comboRef.current.count > 0) {
      comboRef.current.count = 0;
      setComboDisplay('');
    }

    // ── Movement ───────────────────────────
    const moveSpeed = 10 * effectiveDelta;
    if (keys.w && playerRef.current.pos.y < BOUNDS.y) playerRef.current.pos.y += moveSpeed;
    if (keys.s && playerRef.current.pos.y > -BOUNDS.y) playerRef.current.pos.y -= moveSpeed;
    if (keys.d && playerRef.current.pos.x < BOUNDS.x) playerRef.current.pos.x += moveSpeed;
    if (keys.a && playerRef.current.pos.x > -BOUNDS.x) playerRef.current.pos.x -= moveSpeed;
    playerRef.current.rot.z = THREE.MathUtils.lerp(playerRef.current.rot.z, (keys.a ? 0.5 : 0) + (keys.d ? -0.5 : 0), 0.1);
    playerRef.current.rot.x = THREE.MathUtils.lerp(playerRef.current.rot.x, (keys.w ? -0.2 : 0) + (keys.s ? 0.2 : 0), 0.1);

    // ── Firing ─────────────────────────────
    const currentCooldown = isRapidFire ? RAPID_FIRE_COOLDOWN : FIRE_COOLDOWN;
    if (keys.space && !isGameOver && now - lastFiredRef.current > currentCooldown) {
      lastFiredRef.current = now;
      sfxLaser();
      statsRef.current.shotsFired++;
      const origin = playerRef.current.pos.clone();
      if (isSpreadShot) {
        // 3-way spread
        const angles = [-0.15, 0, 0.15];
        setLasers(prev => [...prev, ...angles.map(a => ({
          pos: origin.clone().add(new THREE.Vector3(0, 0, -1)),
          dir: new THREE.Vector3(Math.sin(a), 0, -1).normalize(),
          id: Date.now() + Math.random() + a,
        }))]);
      } else {
        setLasers(prev => [...prev, { pos: origin.add(new THREE.Vector3(0, 0, -1)), dir: new THREE.Vector3(0, 0, -1), id: Date.now() + Math.random() }]);
      }
    }

    // Update lasers
    setLasers(prev => prev
      .map(l => ({ ...l, pos: l.pos.add(l.dir.clone().multiplyScalar(50 * effectiveDelta)) }))
      .filter(l => l.pos.z > -200 && Math.abs(l.pos.x) < 30)
    );

    // ── Random Events ──────────────────────
    if (gameTimeRef.current - lastEventRef.current > EVENT_INTERVAL) {
      lastEventRef.current = gameTimeRef.current;
      const events = ['storm', 'nebula', 'surge', 'poweruprain'];
      const event = events[Math.floor(Math.random() * events.length)];
      activeEventRef.current = event;

      if (event === 'storm') setHudAlert('⚠ ASTEROID STORM');
      else if (event === 'nebula') setHudAlert('🌫 NEBULA FOG');
      else if (event === 'surge') {
        setHudAlert('⚡ WARP SURGE');
        gameSpeedRef.current = Math.min(MAX_GAME_SPEED, gameSpeedRef.current + 10);
      } else if (event === 'poweruprain') {
        setHudAlert('🎁 POWER-UP RAIN');
        const kinds = ['rapidfire', 'shield', 'spreadshot', 'timeslow'];
        for (let i = 0; i < 3; i++) {
          powerUps.current.push({
            id: Date.now() + i, kind: kinds[Math.floor(Math.random() * kinds.length)],
            pos: new THREE.Vector3((Math.random() - 0.5) * BOUNDS.x * 2, (Math.random() - 0.5) * BOUNDS.y * 2, -80 - i * 15),
            active: true,
          });
        }
      }
      // Clear event after duration
      setTimeout(() => {
        if (activeEventRef.current === event) {
          activeEventRef.current = null;
          if (event === 'surge') gameSpeedRef.current = Math.max(BASE_GAME_SPEED, gameSpeedRef.current - 10);
          setHudAlert('');
        }
      }, EVENT_DURATION * 1000);
    }

    // ── Boss Logic ─────────────────────────
    if (gameTimeRef.current - lastBossSpawnRef.current > BOSS_INTERVAL && (!boss.current || !boss.current.active)) {
      // Warning phase
      if (bossWarningRef.current === 0) {
        bossWarningRef.current = gameTimeRef.current;
        sfxBossWarning();
        setHudAlert('⚠ BOSS INCOMING');
      }

      // Spawn after 2s warning
      if (gameTimeRef.current - bossWarningRef.current > 2) {
        boss.current = {
          active: true, hp: BOSS_HP,
          pos: new THREE.Vector3(0, 2, -50),
          moveDir: 1,
        };
        bossWarningRef.current = 0;
        lastBossSpawnRef.current = gameTimeRef.current;
        setHudAlert('');
      }
    }

    if (boss.current && boss.current.active) {
      const b = boss.current;
      // Move side to side
      b.pos.x += b.moveDir * 4 * effectiveDelta;
      if (b.pos.x > BOUNDS.x - 1) b.moveDir = -1;
      if (b.pos.x < -BOUNDS.x + 1) b.moveDir = 1;
      // Slowly approach
      if (b.pos.z < -15) b.pos.z += 5 * effectiveDelta;

      // Fire projectiles every 1.2s
      if (now - lastBossShotRef.current > 1.2) {
        lastBossShotRef.current = now;
        const dir = playerRef.current.pos.clone().sub(b.pos).normalize();
        bossProjectiles.current.push({ id: Date.now(), pos: b.pos.clone(), dir, active: true });
      }

      // Laser collision with boss
      lasers.forEach(laser => {
        if (b.active && laser.pos.distanceTo(b.pos) < 3) {
          b.hp--;
          laser.pos.z = -1000;
          sfxAsteroidHit();
          shakeRef.current = Math.max(shakeRef.current, 0.2);
          statsRef.current.shotsHit++;
          if (b.hp <= 0) {
            b.active = false;
            sfxExplosion(true);
            spawnExplosion(b.pos, true);
            const pts = registerKill(now, BOSS_POINTS);
            setScore(s => s + pts);
            statsRef.current.bossKills++;
          }
        }
      });

      // Player collision with boss
      if (b.pos.distanceTo(playerRef.current.pos) < 3 && invincibleRef.current <= 0) {
        if (shieldActiveRef.current) {
          shieldActiveRef.current = false; setHasShield(false);
          sfxExplosion(); shakeRef.current = 0.5;
        } else {
          const newHp = health - 1; setHealth(newHp);
          sfxPlayerHit(); spawnExplosion(playerRef.current.pos);
          shakeRef.current = 1.0; invincibleRef.current = INVINCIBILITY_DURATION;
          if (newHp <= 0) { sfxGameOver(); onGameOver(); }
        }
      }
    }

    // Update boss projectiles
    bossProjectiles.current.forEach(p => {
      if (!p.active) return;
      p.pos.add(p.dir.clone().multiplyScalar(15 * effectiveDelta));
      if (p.pos.z > 20 || p.pos.distanceTo(playerRef.current.pos) > 100) { p.active = false; return; }
      // Hit player
      if (p.pos.distanceTo(playerRef.current.pos) < 1) {
        p.active = false;
        if (invincibleRef.current <= 0) {
          if (shieldActiveRef.current) {
            shieldActiveRef.current = false; setHasShield(false);
            sfxExplosion(); shakeRef.current = 0.5;
          } else {
            const newHp = health - 1; setHealth(newHp);
            sfxPlayerHit(); spawnExplosion(playerRef.current.pos);
            shakeRef.current = 1.0; invincibleRef.current = INVINCIBILITY_DURATION;
            if (newHp <= 0) { sfxGameOver(); onGameOver(); }
          }
        }
      }
    });
    bossProjectiles.current = bossProjectiles.current.filter(p => p.active);

    // ── Formations ─────────────────────────
    if (gameTimeRef.current - lastFormationRef.current > FORMATION_INTERVAL) {
      lastFormationRef.current = gameTimeRef.current;
      obstacles.current.push(...spawnFormation());
    }

    // ── Hazard Gate ────────────────────────
    if (gameTimeRef.current - lastHazardRef.current > HAZARD_INTERVAL) {
      lastHazardRef.current = gameTimeRef.current;
      const gapY = (Math.random() - 0.5) * BOUNDS.y;
      hazard.current = { active: true, z: -100, gapY, gapSize: 4, spawnTime: gameTimeRef.current };
      sfxHazard();
      setHudAlert('⚠ HAZARD GATE');
      setTimeout(() => setHudAlert(''), 2000);
    }

    if (hazard.current && hazard.current.active) {
      hazard.current.z += gameSpeed * effectiveDelta;
      // Despawn
      if (hazard.current.z > 10) { hazard.current.active = false; hazard.current = null; }
      // Collision — player outside gap
      else if (hazard.current && Math.abs(hazard.current.z - playerRef.current.pos.z) < 1) {
        const py = playerRef.current.pos.y;
        const h = hazard.current;
        if (py > h.gapY + h.gapSize / 2 || py < h.gapY - h.gapSize / 2) {
          if (invincibleRef.current <= 0) {
            sfxHazard();
            if (shieldActiveRef.current) {
              shieldActiveRef.current = false; setHasShield(false);
              shakeRef.current = 0.5;
            } else {
              const newHp = health - 1; setHealth(newHp);
              sfxPlayerHit(); shakeRef.current = 1.0;
              invincibleRef.current = INVINCIBILITY_DURATION;
              if (newHp <= 0) { sfxGameOver(); onGameOver(); }
            }
          }
        }
      }
    }

    // ── Spawn power-ups ────────────────────
    if (gameTimeRef.current - lastPowerUpSpawnRef.current > POWERUP_SPAWN_INTERVAL && activeEventRef.current !== 'poweruprain') {
      lastPowerUpSpawnRef.current = gameTimeRef.current;
      const kinds = ['rapidfire', 'shield', 'spreadshot', 'timeslow'];
      powerUps.current.push({
        id: Date.now(), kind: kinds[Math.floor(Math.random() * kinds.length)],
        pos: new THREE.Vector3((Math.random() - 0.5) * BOUNDS.x * 2, (Math.random() - 0.5) * BOUNDS.y * 2, -120),
        active: true,
      });
    }

    // Update power-ups
    powerUps.current.forEach(pu => {
      if (!pu.active) return;
      pu.pos.z += gameSpeed * effectiveDelta;
      if (pu.pos.z > 10) { pu.active = false; return; }
      if (pu.pos.distanceTo(playerRef.current.pos) < 1.5) {
        pu.active = false; sfxPowerUp();
        if (pu.kind === 'rapidfire') rapidFireUntilRef.current = now + RAPID_FIRE_DURATION;
        else if (pu.kind === 'shield') { shieldActiveRef.current = true; setHasShield(true); }
        else if (pu.kind === 'spreadshot') spreadShotUntilRef.current = now + SPREAD_SHOT_DURATION;
        else if (pu.kind === 'timeslow') timeSlowUntilRef.current = now + TIME_SLOW_DURATION;
      }
    });
    powerUps.current = powerUps.current.filter(p => p.active);

    // ── Obstacles ──────────────────────────
    let scoreBump = 0;
    const newSplits = [];
    const stormMultiplier = activeEventRef.current === 'storm' ? 1.5 : 1;

    obstacles.current.forEach(obs => {
      if (!obs.active) { respawnObstacle(obs); return; }
      obs.pos.z += gameSpeed * effectiveDelta * stormMultiplier;
      obs.rot.x += effectiveDelta; obs.rot.y += effectiveDelta;

      if (obs.pos.z > 5) respawnObstacle(obs);

      // Player collision
      if (obs.pos.distanceTo(playerRef.current.pos) < obs.scale + 0.5 && invincibleRef.current <= 0) {
        if (shieldActiveRef.current) {
          shieldActiveRef.current = false; setHasShield(false);
          sfxExplosion(); spawnExplosion(obs.pos); shakeRef.current = 0.5; obs.active = false;
        } else {
          const newHp = health - 1; setHealth(newHp);
          sfxPlayerHit(); spawnExplosion(playerRef.current.pos);
          shakeRef.current = 1.0; invincibleRef.current = INVINCIBILITY_DURATION; obs.active = false;
          if (newHp <= 0) { sfxGameOver(); onGameOver(); }
        }
      }

      // Laser collision
      lasers.forEach(laser => {
        if (!obs.active || laser.pos.distanceTo(obs.pos) > obs.scale + 0.5) return;
        obs.hp--;
        laser.pos.z = -1000;
        statsRef.current.shotsHit++;
        if (obs.hp <= 0) {
          const def = ASTEROID_TYPES[obs.type];
          sfxExplosion(obs.type === 'large');
          spawnExplosion(obs.pos, obs.type === 'large');
          const pts = registerKill(now, def.points);
          scoreBump += pts;
          obs.active = false;
          if (def.splitInto) {
            for (let s = 0; s < 2; s++) {
              const sd = ASTEROID_TYPES[def.splitInto];
              newSplits.push({
                pos: obs.pos.clone().add(new THREE.Vector3((s === 0 ? -1 : 1) * 1.5, 0, 0)),
                rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
                scale: sd.scale[0] + Math.random() * (sd.scale[1] - sd.scale[0]),
                active: true, type: def.splitInto, hp: sd.hp, maxHp: sd.hp,
              });
            }
          }
        } else { sfxAsteroidHit(); shakeRef.current = Math.max(shakeRef.current, 0.15); }
      });
    });

    if (newSplits.length > 0) obstacles.current.push(...newSplits);
    explosions.current = explosions.current.filter(e => e.active);
    if (scoreBump > 0) setScore(s => s + scoreBump);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#ff4444" />

      <CameraShake shakeRef={shakeRef} />
      <PlayerShip playerRef={playerRef} isInvincible={invincibleRef.current > 0} hasShield={hasShield} />
      <EngineTrail playerRef={playerRef} />


      {obstacles.current.map((obs, i) => (
        <mesh key={i} visible={obs.active} position={obs.pos.toArray()} rotation={obs.rot.toArray()} scale={obs.scale} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshLambertMaterial color={ASTEROID_TYPES[obs.type]?.color || '#94a3b8'} flatShading emissive={obs.hp < obs.maxHp ? '#ff4400' : '#000'} emissiveIntensity={obs.hp < obs.maxHp ? 0.3 : 0} />
        </mesh>
      ))}

      {powerUps.current.map(pu => <PowerUpMesh key={pu.id} powerup={pu} />)}

      <BossShip boss={boss} />
      <BossProjectiles projectiles={bossProjectiles} />
      <HazardGate hazard={hazard} />

      {lasers.map(l => (
        <mesh key={l.id} position={l.pos.toArray()}>
          <boxGeometry args={[0.2, 0.2, 4]} />
          <meshStandardMaterial color="#ef4444" emissive="#ff2200" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}

      <Explosions explosions={explosions} />
      <Stars gameSpeed={gameSpeedRef.current} />
    </>
  );
};

// ── HUD Components ─────────────────────────────────────────
const Heart = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ef4444' : '#333'} stroke="#fff" strokeWidth="1.5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const powerUpLabels = { rapidfire: '⚡ RAPID FIRE', spreadshot: '🔫 SPREAD SHOT', timeslow: '⏳ TIME SLOW', shield: '🛡 SHIELD' };
const powerUpColors = { rapidfire: 'text-yellow-400', spreadshot: 'text-green-400', timeslow: 'text-purple-400', shield: 'text-cyan-400' };

// ── MAIN WINDOW ────────────────────────────────────────────
const StarChaserWindow = () => {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [warpLevel, setWarpLevel] = useState(1);
  const [gameId, setGameId] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [hudAlert, setHudAlert] = useState('');
  const [comboDisplay, setComboDisplay] = useState('');
  const fogRef = useRef(null);

  const statsRef = useRef({ kills: 0, bossKills: 0, shotsFired: 0, shotsHit: 0, timeSurvived: 0, longestCombo: 0 });
  const [finalStats, setFinalStats] = useState(null);

  const isGameOver = gameState === 'gameover';

  const resetGame = () => {
    setScore(0);
    setHealth(MAX_HEALTH);
    setWarpLevel(1);
    setActivePowerUp(null);
    setHudAlert('');
    setComboDisplay('');
    statsRef.current = { kills: 0, bossKills: 0, shotsFired: 0, shotsHit: 0, timeSurvived: 0, longestCombo: 0 };
    setFinalStats(null);
    setGameId(id => id + 1);
  };

  const handleStart = () => { setGameState('playing'); resetGame(); startAmbience(); };
  const handleGameOver = () => {
    setGameState('gameover');
    setFinalStats({ ...statsRef.current });
    stopAmbience();
  };
  const handleRestart = () => { setGameState('playing'); resetGame(); startAmbience(); };

  useEffect(() => { return () => stopAmbience(); }, []);

  useEffect(() => {
    if (gameState !== 'title') return;
    const handler = (e) => { if (e.key === ' ') { e.preventDefault(); handleStart(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState]);

  const accuracy = finalStats && finalStats.shotsFired > 0 ? Math.round((finalStats.shotsHit / finalStats.shotsFired) * 100) : 0;
  const timeStr = finalStats ? `${Math.floor(finalStats.timeSurvived / 60)}:${String(Math.floor(finalStats.timeSurvived % 60)).padStart(2, '0')}` : '0:00';

  return (
    <div className="flex flex-col h-full w-full bg-black relative select-none">
      {/* Title */}
      {gameState === 'title' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
          <h1 className="text-5xl text-yellow-400 font-bold font-mono mb-2 tracking-widest" style={{ textShadow: '0 0 24px #ff0, 0 0 48px #f80, 2px 2px 0 #000', animation: 'crtFlicker 0.15s infinite' }}>STAR CHASER</h1>
          <div className="text-lg text-blue-400 font-mono mb-8" style={{ textShadow: '0 0 12px #38f' }}>─── 3 D ───</div>
          <div className="text-white font-mono text-sm" style={{ animation: 'pulse 1.5s infinite' }}>PRESS SPACE TO START</div>
          <div className="text-zinc-500 font-mono text-xs mt-6">WASD to move &bull; SPACE to shoot</div>
        </div>
      )}

      {/* HUD */}
      {gameState !== 'title' && (
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>
          <div>
            <div className="text-white text-xl">SCORE: {score.toString().padStart(6, '0')}</div>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: MAX_HEALTH }).map((_, i) => <Heart key={i} filled={i < health} />)}
            </div>
            {activePowerUp && (
              <div className={`text-xs font-bold mt-1 ${powerUpColors[activePowerUp] || 'text-white'}`} style={{ animation: 'pulse 0.5s infinite' }}>
                {powerUpLabels[activePowerUp] || activePowerUp}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-cyan-400 font-bold text-sm">WARP LVL {warpLevel}</div>
            {/* Combo */}
            {comboDisplay && (
              <div className="text-yellow-300 font-bold text-2xl mt-1" style={{ textShadow: '0 0 12px #ff0', animation: 'pulse 0.3s infinite' }}>{comboDisplay}</div>
            )}
            <div className="text-white text-right mt-2">
              <div className="text-yellow-400 font-bold mb-1 text-xs">CONTROLS</div>
              <div className="text-xs">WASD - Move</div>
              <div className="text-xs">SPACE - Shoot</div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {hudAlert && gameState === 'playing' && (
        <div className="absolute top-1/3 left-0 w-full text-center pointer-events-none z-10">
          <div className="text-2xl text-red-400 font-bold font-mono" style={{ textShadow: '0 0 20px #f00, 2px 2px 0 #000', animation: 'pulse 0.5s infinite' }}>{hudAlert}</div>
        </div>
      )}

      {/* Game Over + Stats */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-900/50 flex flex-col items-center justify-center z-20">
          <h2 className="text-4xl text-white font-bold mb-2 font-mono drop-shadow-lg">GAME OVER</h2>
          <div className="text-yellow-400 font-mono text-lg mb-4">SCORE: {score.toString().padStart(6, '0')}</div>

          {/* Stats Panel */}
          {finalStats && (
            <div className="bg-black/70 border border-gray-600 rounded px-6 py-4 mb-4 font-mono text-sm text-white" style={{ minWidth: 260 }}>
              <div className="text-cyan-400 font-bold mb-2 text-center">─ MISSION REPORT ─</div>
              <div className="flex justify-between mb-1"><span className="text-gray-400">Time Survived</span><span>{timeStr}</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-400">Asteroids</span><span>{finalStats.kills}</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-400">Bosses</span><span>{finalStats.bossKills}</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-400">Accuracy</span><span>{accuracy}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Best Combo</span><span className="text-yellow-400">x{finalStats.longestCombo}</span></div>
            </div>
          )}

          <button className="px-6 py-2 bg-white text-black font-bold font-mono hover:bg-yellow-400 border-[3px] border-b-black border-r-black border-l-gray-300 border-t-gray-300 active:border-b-gray-300 active:border-r-gray-300 active:border-t-black active:border-l-black" onClick={handleRestart}>RETRY</button>
        </div>
      )}

      {/* Canvas */}
      <Canvas shadows camera={{ position: [0, 4, 15], fov: 60 }} dpr={0.45} className="w-full h-full cursor-crosshair [image-rendering:pixelated]">
        <color attach="background" args={['#050510']} />
        <fog ref={fogRef} attach="fog" args={['#050510', 50, 150]} />
        {gameState !== 'title' && (
          <GameScene
            key={gameId}
            isGameOver={isGameOver}
            onGameOver={handleGameOver}
            score={score} setScore={setScore}
            health={health} setHealth={setHealth}
            setWarpLevel={setWarpLevel}
            setActivePowerUp={setActivePowerUp}
            statsRef={statsRef}
            setHudAlert={setHudAlert}
            setComboDisplay={setComboDisplay}
            fogRef={fogRef}
          />
        )}
        {gameState === 'title' && <>
          <Stars gameSpeed={BASE_GAME_SPEED} />

        </>}
      </Canvas>

      <div className="crt-overlay pointer-events-none absolute inset-0 z-[100]" />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
};

export default StarChaserWindow;
