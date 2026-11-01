'use client';

import { Component, Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { AdditiveBlending, Box3, DoubleSide, Vector3 } from 'three';
import type { Group, Mesh } from 'three';

const MODEL_URL = '/extracted_model.glb';

function ExtractedModel() {
  const { scene } = useGLTF(MODEL_URL);
  const spin = useRef<Group>(null);
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);

    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    model.position.set(-center.x, -center.y, -center.z);
    model.scale.setScalar(2.35 / maxDim);
  }, [model]);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={spin}>
      <primitive object={model} />
    </group>
  );
}

function OrbitFrame() {
  const rings = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (rings.current) rings.current.rotation.z = clock.elapsedTime * 0.18;
  });

  return (
    <group ref={rings}>
      <mesh rotation={[Math.PI / 2.15, 0.15, 0]}>
        <torusGeometry args={[1.72, 0.01, 16, 96]} />
        <meshBasicMaterial color="#2af4ff" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[0.45, 0.8, 0.2]}>
        <torusGeometry args={[1.95, 0.007, 12, 90]} />
        <meshBasicMaterial color="#ff3df0" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.05, 2.14, 80]} />
        <meshBasicMaterial
          color="#2af4ff"
          transparent
          opacity={0.22}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Placeholder() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.8;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.7, 1]} />
      <meshBasicMaterial color="#2af4ff" wireframe />
    </mesh>
  );
}

class ModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <Placeholder />;
    return this.props.children;
  }
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#d8fbff', '#1a1030', 0.85]} />
      <directionalLight position={[4, 5, 3]} intensity={2.4} color="#f4feff" />
      <directionalLight position={[-4, 1, -2]} intensity={1.2} color="#9b8cff" />
      <pointLight position={[2.5, 1.2, 2]} color="#2af4ff" intensity={8} />
      <pointLight position={[-2, -0.4, 1.5]} color="#ff3df0" intensity={6} />
      <ModelBoundary>
        <Suspense fallback={<Placeholder />}>
          <ExtractedModel />
        </Suspense>
      </ModelBoundary>
      <OrbitFrame />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.55}
      />
    </>
  );
}

useGLTF.preload(MODEL_URL);

export default function HoloCore({ compact = false }: { compact?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, compact ? 4.6 : 5.6], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Scene />
    </Canvas>
  );
}
