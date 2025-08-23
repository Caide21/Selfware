import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlyphTree from "./GlyphTree";
import { useTheme } from "../../context/ThemeContext";

export default function ThreeScene({ entries }) {
    const { theme } = useTheme();
  
    return (
      <Canvas
        style={{ width: "100%", height: "100vh" }}
        camera={{ position: [0, 0, 5], fov: 60 }}
      >
        <ambientLight intensity={theme === "dark" ? 0.3 : 0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <GlyphTree entries={entries} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    );
  }
  
