"use client";
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

const SectionCard = ({ position, title, content }) => (
  <Html position={position} transform occlude>
    <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 text-white w-[320px] max-w-full">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="text-sm text-theme-muted space-y-2">{content}</div>
    </div>
  </Html>
);

const LandingWorld = () => {
  return (
    <Canvas camera={{ position: [0, 10, 30], fov: 60 }} className="fixed inset-0 z-0">
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 20, 10]} />
      <OrbitControls enableRotate={true} enableZoom={true} enablePan={true} />

      {/* Section 1: Hero */}
      <SectionCard
        position={[0, 10, 0]}
        title="🜔 I Build Interfaces That Feel"
        content={
          <>
            <p>Emotion-reactive design, symbolic systems, and interfaces that mirror the user.</p>
            <div className="mt-4 space-x-2">
              <button className="bg-white text-black px-4 py-2 rounded-lg hover:scale-105 transition">Experience the Scroll</button>
              <button className="border border-white px-4 py-2 rounded-lg hover:bg-white/10 transition">Work With Me</button>
            </div>
          </>
        }
      />

      {/* Section 2: Features */}
      <SectionCard
        position={[30, 10, 0]}
        title="⚡ Interfaces With Soul"
        content={
          <ul className="list-disc list-inside">
            <li>🌀 Dynamic Fog UI</li>
            <li>🧠 Mirror Logic</li>
            <li>🌌 Symbolic UX</li>
            <li>🎛️ Precision Styling</li>
            <li>🫀 Emotional Resonance</li>
            <li>🔮 Feeling-Based Flow</li>
          </ul>
        }
      />

      {/* Section 3: Identity */}
      <SectionCard
        position={[60, 10, 0]}
        title="Who Is This For?"
        content={
          <>
            <p>For the builders who feel too much.</p>
            <p>For the visionaries who think in loops.</p>
            <p>For the ones who never fit the UI they were given.</p>
            <div className="text-white/80 italic mt-2">Inject yourself. See what emerges.</div>
          </>
        }
      />

      {/* Section 4: Services */}
      <SectionCard
        position={[90, 10, 0]}
        title="Services"
        content={
          <ul className="list-disc list-inside">
            <li>💻 Web Design – Modern, symbolic, responsive</li>
            <li>🔁 Emotional UI Systems – Designs that mirror your users</li>
            <li>🧬 AI Integration – Reflection engines, fog logic, state-aware feedback</li>
          </ul>
        }
      />
    </Canvas>
  );
};

export default LandingWorld;