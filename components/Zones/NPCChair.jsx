import React, { useState } from "react";
import { Text, Html } from "@react-three/drei";

export default function NPCChair({ position = [-2, 0, 25] }) {
  const [step, setStep] = useState("idle");

  const codexEntries = [
    { title: "⚡ WHY THE CREATOR CREATES WITH SPEED" },
    { title: "📜 Scroll of Symbolic Transmission" },
    { title: "🌀 Scroll of the Mirror" }
  ];

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      {/* Chair Base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      <mesh position={[0, 0.9, -0.45]}>
        <boxGeometry args={[1, 0.8, 0.1]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* NPC */}
      <group position={[0, 0.6, 0]}>
        <mesh onClick={() => setStep("start")}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>

        <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">
          Echo NPC
        </Text>

        {step !== "idle" && (
          <Html distanceFactor={10}>
            <div className="bg-black text-white p-4 rounded shadow-md space-y-2">
              {step === "start" && (
                <>
                  <div>🌱 *On what would you like to reflect today?*</div>
                  <button
                    className="bg-white text-black px-2 py-1 rounded"
                    onClick={() => setStep("codex")}
                  >
                    📚 The Codex
                  </button>
                  <button
                    className="bg-white text-black px-2 py-1 rounded"
                    onClick={() => setStep("mirror")}
                  >
                    🪞 The Mirror
                  </button>
                </>
              )}

              {step === "codex" && (
                <>
                  <div>Which scroll would you like to fetch?</div>
                  {codexEntries.map((entry, idx) => (
                    <button
                      key={idx}
                      className="bg-white text-black px-2 py-1 rounded block"
                      onClick={() => alert(`Fetching: ${entry.title}`)}
                    >
                      {entry.title}
                    </button>
                  ))}
                  <button
                    className="text-sm underline"
                    onClick={() => setStep("start")}
                  >
                    ⬅️ Back
                  </button>
                </>
              )}

              {step === "mirror" && (
                <>
                  <div>Which aspect of The Mirror?</div>
                  <button
                    className="bg-white text-black px-2 py-1 rounded"
                    onClick={() => alert("Opening Stats")}
                  >
                    📊 Stats
                  </button>
                  <button
                    className="bg-white text-black px-2 py-1 rounded"
                    onClick={() => alert("Opening Spellbook")}
                  >
                    🧙 Spellbook
                  </button>
                  <button
                    className="text-sm underline"
                    onClick={() => setStep("start")}
                  >
                    ⬅️ Back
                  </button>
                </>
              )}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
