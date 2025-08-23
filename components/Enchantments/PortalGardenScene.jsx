import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PointerLockControls, Stars } from "@react-three/drei";
import NeuralFloor from "../Zones/NeuralFloor";
import NPCChair from "../Zones/NPCChair";

export default function PortalGardenScene({ codexEntries }) {
  const [mode, setMode] = useState("orbit"); // orbit or walk

  return (
    <>
      <button
        onClick={() => setMode(mode === "orbit" ? "walk" : "orbit")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          padding: "8px 12px",
          background: "#000",
          color: "#fff",
          border: "1px solid #333",
          cursor: "pointer"
        }}
      >
        Toggle: {mode === "orbit" ? "Switch to WASD" : "Switch to Orbit"}
      </button>

      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Infinite stars backdrop */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />

        {/* Neural cortex floor */}
        <NeuralFloor active={false} />

        {/* NPC on the Chair of Reflection */}
        <NPCChair position={[-2, 0, 25]} />

        {/* Lighting */}
        <ambientLight intensity={2.0} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
        />

        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.8}
        />

        <hemisphereLight
          skyColor={"#8888ff"}
          groundColor={"#220033"}
          intensity={0.2}
        />


        {/* Controls */}
        {mode === "orbit" && <OrbitControls />}
        {mode === "walk" && <PointerLockControls />}
      </Canvas>
    </>
  );
}
