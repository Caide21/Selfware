# emotionClassifier.py
import json
import re
from collections import defaultdict
from pathlib import Path
from rapidfuzz import process, fuzz

################################################################################
# 1. ─── LOAD & FLATTEN EMOTION TREE ────────────────────────────────────────────
################################################################################

def load_emotion_tree(path: str | Path | None = None) -> dict:
    """Return the full emotion tree (core → secondary → keywords list)."""
    if path is None:
        path = Path(__file__).parent / "emotion_tree_expanded.json"
    with open(path, "r") as f:
        return json.load(f)["EMOTION_ROOT"]

def flatten_emotion_keywords(emotion_tree: dict) -> dict:
    """
    Map every keyword (lower‑cased) to a tuple (core, secondary).
    Ex: "gratitude" → ("LOVE", "Gratitude")
    """
    keyword_map = {}
    for core, secondaries in emotion_tree.items():
        for secondary, keywords in secondaries.items():
            for kw in keywords:
                keyword_map[kw.lower()] = (core, secondary)
    return keyword_map

################################################################################
# 2. ─── KEYWORD MATCHING WITH FUZZY CONFIDENCE ────────────────────────────────
################################################################################

def classify_emotions_with_confidence(
    text: str,
    keyword_map: dict,
    threshold: int = 85
) -> tuple[dict, list]:
    """
    Return:
      detected_emotions = {core: {secondary: [matched_kw, …]}}
      match_log         = list of dicts {input, matched, score, core, secondary}
    """
    text = text.lower()
    words = re.findall(r"\b\w+\b", text)

    detected = defaultdict(lambda: defaultdict(list))
    match_log: list[dict] = []

    for word in words:
        match, score, _ = process.extractOne(word, keyword_map.keys(), scorer=fuzz.ratio)
        if score >= threshold:
            core, secondary = keyword_map[match]
            detected[core][secondary].append(match)
            match_log.append(
                dict(input=word, matched=match, score=score, core=core, secondary=secondary)
            )
    return dict(detected), match_log

################################################################################
# 3. ─── RECURSIVE VECTOR SCORING  ✨ NEW ✨ ─────────────────────────────────────
################################################################################

# Core‑level polarity weights (tweak as you like)
CORE_POLARITY = {
    "LOVE":  +1.0,
    "FEAR":  -1.0,
    # add NEUTRAL = 0.0 if you create one
}

# Secondary‑level intensities  (all positive magnitudes → polarity comes only from CORE_POLARITY)
SECONDARY_INTENSITY = {
    # LOVE branch
    "Joy":          0.90,
    "Peace":        0.80,
    "Trust":        0.75,
    "Gratitude":    0.70,
    "Empowerment":  0.85,
    # FEAR branch  ← now positive values
    "Anger":        0.90,
    "Shame":        0.95,
    "Control":      0.80,
    "Guilt":        0.70,
    "Anxiety":      0.85,
}


# Modifier words that amplify or dampen intensity
AMPLIFIERS = {"very", "super", "extremely", "so", "really"}
DIMINISHERS = {"slightly", "a little", "kinda", "somewhat", "barely"}

def _modifier_factor(text: str) -> float:
    """
    Simple heuristic: +20 % intensity if amplifiers present,
    –20 % if diminishers present (both can cancel).
    """
    t = text.lower()
    amp = any(w in t for w in AMPLIFIERS)
    dim = any(w in t for w in DIMINISHERS)
    if amp and not dim:
        return 1.2
    if dim and not amp:
        return 0.8
    return 1.0

def calculate_emotional_vector(
    text: str,
    keyword_map: dict,
    threshold: int = 85,
    match_log: list | None = None
) -> dict:
    """
    Return a dict with core_scores, net_vector, and full log.
    """
    detected, log = classify_emotions_with_confidence(text, keyword_map, threshold)
    if match_log is not None:
        match_log.extend(log)          # allow external collection

    # Aggregate raw contributions first
    raw_scores: dict[str, float] = defaultdict(float)
    mod_factor = _modifier_factor(text)

    for core, secondaries in detected.items():
        for sec, kw_list in secondaries.items():
            sec_intensity = SECONDARY_INTENSITY.get(sec, 0.0)
            raw_scores[core] += sec_intensity * len(kw_list) * mod_factor

    # Normalize by total keyword count
    total_kw = sum(len(kw) for s in detected.values() for kw in s.values())
    if total_kw:
        for c in raw_scores:
            raw_scores[c] /= total_kw

    # Apply core polarity to get signed core scores
    core_scores = {
        core: raw_scores[core] * CORE_POLARITY.get(core, 0.0)
        for core in raw_scores
    }

    net_vector = sum(core_scores.values())
    dominant = (
        "LOVE" if net_vector > 0
        else "FEAR" if net_vector < 0
        else "NEUTRAL"
    )

    return dict(
        core_scores=core_scores,
        net_vector=net_vector,
        match_log=log,
        dominant=dominant
    )


################################################################################
# 4. ─── SIMPLE CLI / TEST ─────────────────────────────────────────────────────
################################################################################

if __name__ == "__main__":
    tree = load_emotion_tree()
    keywords = flatten_emotion_keywords(tree)

    sample = (
            "I'm deeply frustrated with how things have been going lately — "
    "there’s this lingering guilt and anxiety that won’t go away, "
    "but I’m also trying to stay hopeful and grateful for what I have. "
    "Sometimes I even feel a strange sense of peace in the chaos."
    )
    result = calculate_emotional_vector(sample, keywords, threshold=85)
    print(json.dumps(result, indent=2))
