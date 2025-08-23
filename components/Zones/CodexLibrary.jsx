import React from "react";
import GlyphTree from "../Enchantments/GlyphTree";

export default function CodexLibrary({ entries, position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <GlyphTree entries={entries} />
    </group>
  );
}
