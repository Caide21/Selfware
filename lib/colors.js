// /lib/colours.js
import React from "react";

export const scrollGradients = {
  prism: {
    radial: {
      id: "scrollGlow",
      definition: (
        <radialGradient id="scrollGlow" cx="50%" cy="0%" r="130%" fx="50%" fy="0%">
          <stop offset="0%" stopColor="#D3A2DE" stopOpacity="0.18" />
          <stop offset="35%" stopColor="#8483C8" />
          <stop offset="65%" stopColor="#4B0082" />
          <stop offset="100%" stopColor="#1A001F" />
        </radialGradient>
      )
    },

    weaveMask: {
      id: "weaveMask",
      definition: (
        <>
          <linearGradient id="scrollWeave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.06" />
            <stop offset="100%" stopColor="white" stopOpacity="0.015" />
          </linearGradient>
          <mask id="weaveMask" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            <rect width="100%" height="100%" fill="url(#scrollWeave)" />
          </mask>
        </>
      )
    },

    textureOverlay: {
      id: "linenPattern",
      definition: (
        <pattern
          id="linenPattern"
          patternUnits="userSpaceOnUse"
          width="512"
          height="512"
        >
          <image
            href="/textures/scroll-fabric.png"
            width="512"
            height="512"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
      )
    }
  }
};
