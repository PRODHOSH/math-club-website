'use client';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Global type augmentation for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshNormalMaterial: any;
      boxGeometry: any;
      sphereGeometry: any;
      torusKnotGeometry: any;
      cylinderGeometry: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

const ParticleField = () => {
  const ref = useRef<THREE.Points>(null!);
  
  // Create particles
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const p = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#eab308"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  );
};

const ConnectingLines = () => {
    // A simple wireframe geometry to represent "structure"
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh rotation={[0, 0, 0]} scale={2.5}>
                <icosahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#0f172a" wireframe transparent opacity={0.1} />
            </mesh>
             <mesh rotation={[0, 0, 0]} scale={2.5}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} wireframe transparent opacity={0.05} />
            </mesh>
        </Float>
    )
}

const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <ConnectingLines />
        <ParticleField />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <fog attach="fog" args={['#050b14', 5, 15]} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
