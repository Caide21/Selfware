import React from "react";
import { Text } from "@react-three/drei";

export default function Portals({ setRoom }) {
  return (
    <group>
      {/* Portal to Codex Library */}
      <mesh position={[-5, 0, 3]} onClick={() => setRoom("codex")}>
        <torusGeometry args={[0.5, 0.15, 16, 100]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      <Text position={[-5, 1, 3]} fontSize={0.3} color="white">
        Enter Codex Library
      </Text>

      {/* Portal to Quest Grove */}
      <mesh position={[5, 0, 3]} onClick={() => setRoom("quests")}>
        <torusGeometry args={[0.5, 0.15, 16, 100]} />
        <meshStandardMaterial color="lime" />
      </mesh>
      <Text position={[5, 1, 3]} fontSize={0.3} color="white">
        Enter Quest Grove
      </Text>
    </group>
  );
}
