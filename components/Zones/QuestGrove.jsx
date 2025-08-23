import React from "react";
import { Text } from "@react-three/drei";

export default function QuestGrove({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.3} color="white">
        Quest Grove Placeholder
      </Text>
    </group>
  );
}
