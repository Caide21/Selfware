import { SYMBOLIC_COLORS } from "@/lib/colors";

export default function ScrollContainer({
  children,
  color = SYMBOLIC_COLORS.Codex,
}) {
  const { base, light, dark } = color;

  return (
      <svg viewBox="0 0 1400 2000" width="100%" height="auto">
        <defs>
          <clipPath id="scrollClip">
            <path d="
              M 200 200
              L 1100 200
              L 1100 1600
              L 200 1600
              Z

              M 200 200
              L 200 275
              Q 275 240 200 200
              Z
            "/>
          </clipPath>
          <linearGradient id="scrollGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8000FF" />
            <stop offset="100%" stopColor="#4B0082" />
          </linearGradient>
        </defs>

        <rect
          x="200"
          y="200"
          width="900"
          height="1400"
          fill="url(#scrollGrad)"
          stroke="#000"
          strokeWidth="10"
          clipPath="url(#scrollClip)"
        />

        <path
          d="M 200 200 L 200 275 Q 275 240 200 200 Z"
          fill="none"
          stroke="#000"
          strokeWidth="5"
        />


        


      {/* Content */}
      <foreignObject
        x="250"
        y="450"
        width="800"
        height="1300"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="p-6 text-black overflow-hidden"
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
