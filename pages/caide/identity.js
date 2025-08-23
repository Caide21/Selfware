import PageShell from "@/components/Layout/PageShell";

export default function Identity() {
  return (
    <PageShell
      heading={{
        emoji: "🪞",
        title: "Identity",
        subtitle: "How I think, what I notice, and the perspective I bring.",
      }}
    >
      <div className="text-white/80 space-y-8 max-w-xl mx-auto px-4 text-center text-sm sm:text-base">
        <p>
          I don’t really do personas — I just notice things. Patterns, emotions, 
          the signals under the surface. I’ve always been tuned to feedback 
          and the quiet shifts people often miss.

        </p>
        <p className="text-white/60">
          I tend to notice the invisible stuff — the little signals under the surface that shape 
          how people work and connect.  
          My focus is on translating that into systems that feel natural and make life run smoother.
        </p>
      </div>
    </PageShell>
  );
}
