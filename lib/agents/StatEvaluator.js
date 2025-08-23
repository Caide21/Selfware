// lib/agents/StatEvaluator.js
export function buildPrompt(userLog) {
    return `
  You are a symbolic stat evaluator. Given a user log, assess growth or decline in:
  
  - discipline
  - emotional_regulation
  - clarity
  - energy
  - creativity
  
  Return ONLY this JSON format:
  {
    "discipline": [+/-int],
    "emotional_regulation": [+/-int],
    "clarity": [+/-int],
    "energy": [+/-int],
    "creativity": [+/-int]
  }
  
  User Log: """${userLog}"""
  `;
  }
  