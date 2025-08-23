export function triggerFog(type = 'myst') {
    const fog = document.createElement('div');
    fog.className = `fog-overlay fog-${type}`;
    document.body.appendChild(fog);
    setTimeout(() => fog.remove(), 3000);
  }
  
  export function pulseSigil(emotion = 'echo') {
    console.log(`Sigil pulse: ${emotion}`);
    // future symbolic emitter
  }