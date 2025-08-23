export default function ScrollContainer({ children, contentHeight = 1000 }) {
  const width = 1289;
  const leftEdge = 82;
  const rightEdge = 1224.5;

  const topHeight = 208;
  const bottomHeight = 208;
  const bodyPadding = 40;
  const paddedBodyHeight = contentHeight + bodyPadding;

  const Y0 = topHeight + paddedBodyHeight;
  const totalHeight = topHeight + paddedBodyHeight + bottomHeight;

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* --- Base purple gradient --- */}
        <linearGradient id="scrollBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B1C42" />
          <stop offset="100%" stopColor="#1A001F" />
        </linearGradient>

        {/* --- Crosshatch linen weave --- */}
        <pattern id="fabricWeave" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M 0 0 L 0 8 M 0 0 L 8 0" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
        </pattern>

        {/* --- Grainy cloth noise --- */}
        <filter id="fabricNoise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="turb" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.03" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="turb" mode="multiply" />
        </filter>

        {/* --- Mask to clean up edge bleed if needed --- */}
        <mask id="scrollTextureMask">
          <rect width="100%" height="100%" fill="white" />
        </mask>
      </defs>

      {/* --- Top curls --- */}
      <g filter="url(#fabricNoise)" mask="url(#scrollTextureMask)">
        <path
          d={`
            M82 208 
            C -29.3851 146.437 -23.761 102.629 82 1 
            H1224.5 
            C 1093.86 83.8414 1103.03 129.765 1224.5 208 
            H82
            Z
          `}
          fill="url(#scrollBase)"
        />
        <path
          d={`
            M82 208 
            C -29.3851 146.437 -23.761 102.629 82 1 
            H1224.5 
            C 1093.86 83.8414 1103.03 129.765 1224.5 208 
            H82
            Z
          `}
          fill="url(#fabricWeave)"
        />
      </g>

      {/* --- Stretchy middle body --- */}
      <g filter="url(#fabricNoise)" mask="url(#scrollTextureMask)">
        <rect
          x="82"
          y={208}
          width={1142.5}
          height={paddedBodyHeight}
          fill="url(#scrollBase)"
        />
        <rect
          x="82"
          y={208}
          width={1142.5}
          height={paddedBodyHeight}
          fill="url(#fabricWeave)"
        />
      </g>

      {/* --- Bottom curls --- */}
      <g filter="url(#fabricNoise)" mask="url(#scrollTextureMask)">
        <path
          d={`
            M82 ${Y0} 
            C -29.3851 ${Y0 + 61.563} -23.761 ${Y0 + 105.371} 82 ${Y0 + 208}
            H1224.5 
            C 1093.86 ${Y0 + 124.159} 1103.03 ${Y0 + 78.235} 1224.5 ${Y0} 
            H82
            Z
          `}
          fill="url(#scrollBase)"
        />
        <path
          d={`
            M82 ${Y0} 
            C -29.3851 ${Y0 + 61.563} -23.761 ${Y0 + 105.371} 82 ${Y0 + 208}
            H1224.5 
            C 1093.86 ${Y0 + 124.159} 1103.03 ${Y0 + 78.235} 1224.5 ${Y0} 
            H82
            Z
          `}
          fill="url(#fabricWeave)"
        />
      </g>

      {/* --- Content --- */}
      <foreignObject
        x={leftEdge + 50}
        y={topHeight + 20}
        width={rightEdge - leftEdge - 100}
        height={contentHeight}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            color: "white",
            fontFamily: "serif",
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
