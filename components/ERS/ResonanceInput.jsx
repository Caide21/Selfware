import { useState } from "react";

export default function ResonanceInput({ pulseTrigger, onSubmit }) {
  const [feeling, setFeeling] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feeling.trim() !== "") {
      onSubmit(feeling);
      setSubmitted(true);
    }
  };

  const handleChange = (e) => {
    if (pulseTrigger) pulseTrigger();
    const value = e.target.value;
    setFeeling(value);
    setHasTyped(value.trim().length > 0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${
        submitted ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-xl">
      <div
        className={`absolute inset-0 flex items-center justify-center text-white/50 text-xl md:text-2xl font-light font-cormorant pointer-events-none transition-opacity duration-700 ${
            hasTyped ? "opacity-0" : "opacity-100"
        }`}
        style={{
            textShadow:
            "0 0 6px rgba(255,255,255,0.1), 0 0 14px rgba(255,255,255,0.08)",
        }}
        >
        ...and how do you feel?
        </div>


        <input
          type="text"
          value={feeling}
          onChange={handleChange}
          className="bg-transparent text-center text-white text-xl md:text-2xl font-light font-cormorant w-full outline-none"
          style={{
            textShadow:
              "0 0 6px rgba(255,255,255,0.1), 0 0 14px rgba(255,255,255,0.08)",
          }}
        />
      </div>
    </form>
  );
}