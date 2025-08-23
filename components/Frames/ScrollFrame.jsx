import { SYMBOLIC_COLORS } from "@/lib/colors";

export default function ScrollFrame({ children }) {
  const { base, light } = SYMBOLIC_COLORS.Scroll;

  return (
    <div className="relative w-full max-w-3xl mx-auto my-12 rounded-md overflow-x-hidden">
      {/* Top curl */}
      <div
        className="absolute top-0 left-0 right-0 h-12 rounded-t-full shadow-inner overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${light}, ${base})`,
        }}
      />

      {/* Main scroll body */}
      <div
        className="px-4 sm:px-8 py-20 relative z-10"
        style={{ backgroundColor: base }}
      >
        {children}
      </div>

      {/* Bottom curl */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 rounded-b-full shadow-inner overflow-hidden"
        style={{
          background: `linear-gradient(to top, ${light}, ${base})`,
        }}
      />
    </div>
  );
}
