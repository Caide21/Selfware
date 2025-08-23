// utils/fingerprint.js
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId; // This is your user’s unique fingerprint hash
}
