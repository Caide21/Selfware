import React, { useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function NeuralFloor({ active = false }) {
  const lineRef = useRef();

  // ✅ Load the neural web texture
  const texture = useLoader(THREE.TextureLoader, "/neural-web.png");

  // ✅ Set tiling repeat to make it cover the big plane nicely
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5); // tweak 4, 5, or 8 for more or less density

  // ✅ Optional: Animate your overlay line pulse
  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.material.color.lerp(
        new THREE.Color(active ? "cyan" : "#222"),
        0.1
      );
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Base plane with neural web texture */}
      <mesh receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={1}
          color="#220033"               // deep purple base tone
          emissive="#7a00ff"            // vivid purple glow
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Optional: single overlay pathway */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -25, 0, 0, 25])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#222" linewidth={2} />
      </line>
    </group>
  );
}
