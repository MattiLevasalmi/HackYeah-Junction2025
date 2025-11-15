import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useDrag } from "@use-gesture/react"; 

function SaunaModel({ isPowerOn, temperature }) {
  const ref = useRef();

  // Load your GLTF model
  const gltf = useGLTF('/models/sauna_product_model.glb');

  // Track drag offsets
  const dragOffset = useRef([0, 0]);

  // Apply rotation and scale
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += isPowerOn ? delta * 0.3 : delta * 0.05;
      const scale = 1 + (temperature - 70) * 0.002;
      ref.current.scale.set(scale, scale, scale);

      // Apply drag offsets
      ref.current.position.x = dragOffset.current[0];
      ref.current.position.z = dragOffset.current[1]; // using X/Z plane
    }
  });

  // Gesture binding
  const bind = useDrag(({ movement: [mx, mz] }) => {
    // Scale down movement to reasonable units
    dragOffset.current = [mx * 0.01, mz * 0.01];
  });

  return <primitive ref={ref} object={gltf.scene} {...bind()} />;
}

export function ModelViewer({ isPowerOn, temperature }) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-neutral-800">
      <Canvas camera={{ position: [100, 150, 102], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <SaunaModel isPowerOn={isPowerOn} temperature={temperature} />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}

