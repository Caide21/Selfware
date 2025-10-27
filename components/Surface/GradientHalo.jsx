export default function GradientHalo({ className = "", opacity = 0.12, style }) {
  return (
    <div
      className={`halo ${className}`.trim()}
      style={{ opacity, ...style }}
    />
  );
}
