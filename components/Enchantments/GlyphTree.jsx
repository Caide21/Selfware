import React from "react";
import { Text } from "@react-three/drei";
import { useRouter } from "next/router";

export default function GlyphTree({ entries }) {
  const router = useRouter();

  return (
    <>
      {entries.map((entry, index) => {
        const x = 0; // Centered horizontally
        const y = index * -2.8; // Stacked downward, more space for 2 lines
        const z = 0; // In front of camera

        return (
          <group
            key={entry.slug}
            position={[x, y, z]}
            onClick={() => router.push(`/codex/${entry.slug}`)}
          >
            {/* Card background */}
            <mesh>
              <planeGeometry args={[5, 2]} />
              <meshStandardMaterial color="white" transparent opacity={0.1} />
            </mesh>

            {/* Symbol + Title */}
            <Text
              fontSize={0.35}
              color="white"
              anchorX="center"
              anchorY="middle"
              position={[0, 0.4, 0.01]}
              maxWidth={4.5}
            >
              {`${entry.symbol} ${entry.title}`}
            </Text>

            {/* Description */}
            <Text
              fontSize={0.2}
              color="#ccc"
              anchorX="center"
              anchorY="top"
              position={[0, -0.2, 0.01]}
              maxWidth={4.2}
            >
              {entry.description}
            </Text>
          </group>
        );
      })}
    </>
  );
}
