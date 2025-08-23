# resonance_vector_engine_v3_blended.py — Symbolic Weighted Classifier with Emotional Blending
import re
from dataclasses import dataclass
from typing import Dict
from rapidfuzz import fuzz

# ── helpers ───────────────────────────────────────────────────────
def _count(patterns: set[str], text: str) -> int:
    return sum(1 for p in patterns if re.search(rf"\b{re.escape(p)}\b", text, re.I))

# ── emotional vocabularies ─────────────────────────────────────────
_CHAOS = {
    "overwhelmed", "falling apart", "drowning", "noise", "spiraling",
    "collapsing", "shattering", "chaotic", "panic", "can't focus",
    "frenzy", "everything's broken", "out of control"
}

_DISTORTION = {
    "confused", "don't know", "uncertain", "blurred", "lost",
    "disoriented", "fragmented", "warped", "distorted", "can't tell"
}

_SILENCE = {
    "nothing", "quiet", "stillness", "empty", "silence",
    "paused", "hushed", "void", "blank", "gone", "numb", "shut down"
}

_CLARITY = {
    "clear", "peaceful", "calm", "open", "flowing", "grounded",
    "centered", "steady", "aware", "present", "focused", "aligned"
}

_VITALITY = {
    "alive", "buzzing", "energized", "ready", "vibrant", "glowing",
    "pulsing", "firing", "fire inside", "lit up", "rushing", "vital", "spark"
}

# ── data container ─────────────────────────────────────────────────
@dataclass
class ResonanceVector:
    polarity: float
    activation: float
    depth: float
    vitality: float
    fog_field: Dict[str, float]

    def as_dict(self) -> Dict:
        return dict(
            polarity=self.polarity,
            activation=self.activation,
            depth=self.depth,
            vitality=self.vitality,
            fog_field=self.fog_field
        )

# ── core engine ────────────────────────────────────────────────────
class ResonanceVectorEngine:
    """Weighted symbolic emotional classifier with blending."""

    def analyze(self, text: str) -> Dict:
        first_pass = self._analyze_pass(text)
        recursive_pass = self._recursive_reweight(first_pass, text)
        blended_field = self._resolve_fog(first_pass, recursive_pass)

        vector = ResonanceVector(
            polarity=recursive_pass['polarity'],
            activation=recursive_pass['activation'],
            depth=recursive_pass['depth'],
            vitality=recursive_pass['vitality'],
            fog_field=blended_field
        )

        reflection = self._narrate(vector)
        return dict(resonance_vector=vector.as_dict(), reflection=reflection)

    def _analyze_pass(self, text: str) -> Dict:
        t = text.lower()

        scores = {
            "chaos": 0,
            "distortion": 0,
            "silence": 0,
            "clarity": 0
        }

        # Pattern hits
        scores["chaos"] += _count(_CHAOS, t) * 3
        scores["distortion"] += _count(_DISTORTION, t) * 2
        scores["silence"] += _count(_SILENCE, t) * 2
        scores["clarity"] += _count(_CLARITY, t) * 3

        # Activation modifiers
        exclamations = t.count("!")
        negations = len(re.findall(r"\b(can't|won't|don't|can't tell|nothing|nobody)\b", t))

        if exclamations >= 1:
            scores["chaos"] += 2
        if negations >= 1:
            scores["chaos"] += 2
            scores["distortion"] += 1

        # Entropy calculation
        entropy = 0
        if len(re.findall(r"(confused|don't know|can't tell|blurred|disoriented|fragmented|lost)", t)) >= 2:
            entropy += 2
        if "but" in t or "although" in t or "however" in t:
            entropy += 1
        if "not sure" in t or "uncertain" in t:
            entropy += 2

        if entropy >= 2:
            scores["distortion"] += entropy

        # Polarity and activation
        pos_hits = _count(_CLARITY, t)
        neg_hits = _count(_CHAOS.union(_DISTORTION).union(_SILENCE), t)
        polarity = (pos_hits - neg_hits) / max(pos_hits + neg_hits, 1)
        polarity = max(-1, min(1, polarity))

        excl = t.count("!")
        caps = sum(1 for w in re.findall(r"\b[A-Z]{2,}\b", text))
        amps = len(re.findall(r"(very|extremely|so|totally|super|absolutely)", t))
        activation = max(0, min(1, (excl + caps + amps) / 10))

        vitality_hits = _count(_VITALITY, t)
        vitality = min(1.0, vitality_hits / 3)

        depth = min(1, (text.count("feel") + text.count("inside") + text.count("body")) / 5)

        # 🌟 Life-force refinement (new)
        if vitality >= 0.5:
            scores["clarity"] += int(vitality * 5)  # Boost clarity if vitality is strong
            scores["chaos"] = max(0, scores["chaos"] - int(vitality * 3))  # Soften chaos if life energy strong

        return dict(
            polarity=polarity,
            activation=activation,
            depth=depth,
            vitality=vitality,
            fog_scores=scores
        )


    def _recursive_reweight(self, result: Dict, text: str) -> Dict:
        """Simulate emotional field rebalancing."""
        polarity = result['polarity']
        activation = result['activation']
        vitality = result['vitality']
        depth = result['depth']
        fog_scores = result['fog_scores']

        # Vitality-driven positivity reinforcement
        if vitality >= 0.6:
            polarity = min(1.0, polarity + 0.3)
            activation = max(0.0, activation - 0.3)

        # Strong positive polarity breathing room
        if polarity >= 0.5:
            vitality = min(1.0, vitality + 0.2)

        # Special calm field boost
        if vitality >= 0.7 and polarity >= 0.6:
            polarity = min(1.0, polarity + 0.2)
            activation = max(0.0, activation - 0.1)

        return dict(
            polarity=polarity,
            activation=activation,
            depth=depth,
            vitality=vitality,
            fog_scores=fog_scores
        )

    def _resolve_fog(self, first_pass: Dict, recursive_pass: Dict) -> Dict[str, float]:
        """Blend fog fields into emotional field proportions."""

        # Sum scores
        fog_scores = recursive_pass.get('fog_scores', {})
        total_score = sum(fog_scores.values())

        if total_score == 0:
            return {"silence": 1.0}

        # Normalize
        blended_field = {fog: round(score / total_score, 3) for fog, score in fog_scores.items()}

        return blended_field

    @staticmethod
    def _narrate(v: ResonanceVector) -> str:
        tone = "positive" if v.polarity > 0 else "negative" if v.polarity < 0 else "neutral"
        energy = "high" if v.activation > .6 else "moderate" if v.activation > .3 else "low"

        fogs = ", ".join([f"{k}: {int(v.fog_field[k]*100)}%" for k in sorted(v.fog_field, key=v.fog_field.get, reverse=True) if v.fog_field[k] > 0])

        return (f"This reflection carries {energy} energy and leans {tone}. "
                f"Vitality is {v.vitality:.1f}; depth is {v.depth:.1f}; emotional field: {fogs}.")

# ── CLI Batch Test Block ───────────────────────────────────────────
if __name__ == "__main__":
    engine = ResonanceVectorEngine()

    test_phrases = [
        # Chaos-leaning
        "Everything is happening too fast! I can't hold on!",
        "It's all falling apart and I can't fix it!",

        # Distortion-leaning
        "I'm confused... I can't tell what's real anymore.",
        "Nothing makes sense but I'm still standing somehow.",

        # Silence-leaning
        "I feel empty, like nothing matters anymore.",
        "Everything stopped... It's just quiet now.",

        # Clarity-leaning
        "I'm steady, clear, and grounded no matter what.",
        "Even in the storm, I can feel a deep calm inside.",

        # High vitality Clarity
        "I'm alive, vibrating with possibility!",
        "I feel a fire inside that's pushing me forward!",

        # Complex/mixed
        "I'm falling apart and yet I know I'll be okay.",
        "My mind is racing but my heart feels strangely calm."
    ]

    print("\n🧪 FINAL DEEP EMOTIONAL BATCH TEST (PHASE 3.2+):")
    for i, phrase in enumerate(test_phrases, 1):
        result = engine.analyze(phrase)
        print(f"\nTest {i}:")
        print(f"Input: {phrase}")
        print(f"Resonance Vector: {result['resonance_vector']}")
        print(f"Reflection: {result['reflection']}")

