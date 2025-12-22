export const qrAgent = (userLoc, safeZones) => {
  if (!userLoc || safeZones.length === 0) return null;

  let bestZone = null;
  let bestScore = Infinity;

  safeZones.forEach((zone) => {
    const d =
      Math.pow(userLoc.latitude - zone.latitude, 2) +
      Math.pow(userLoc.longitude - zone.longitude, 2);

    if (d < bestScore) {
      bestScore = d;
      bestZone = zone;
    }
  });

  return bestZone;
};
