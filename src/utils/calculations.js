// === Расчёт расстояния (haversine) ===
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function pointInCircle(p, c) {
  const [plat, plon] = p;
  const [clat, clon, r] = c;
  return haversine(plat, plon, clat, clon) <= r + 1e-6;
}

// === Вычисление оптимальной точки (пока центр масс) ===
export function optimalStop(houses) {
  // Filter valid houses (with coordinates)
  const validHouses = houses.filter(
    (h) => typeof h.lat === 'number' && !isNaN(h.lat) &&
           typeof h.lon === 'number' && !isNaN(h.lon)
  );

  if (validHouses.length === 0) {
    return { best_pt: [0, 0], covered: 0, total: 0, circles: [] };
  }

  // Use minimum population of 1 for houses with 0 population
  const populations = validHouses.map(h => h.population > 0 ? h.population : 1);
  const totalPop = populations.reduce((a, b) => a + b, 0);
  
  // Calculate weighted center of mass
  const lat_c = validHouses.reduce((sum, h, i) => sum + h.lat * populations[i], 0) / totalPop;
  const lon_c = validHouses.reduce((sum, h, i) => sum + h.lon * populations[i], 0) / totalPop;

  // Calculate average population and circles
  const p_avg = totalPop / validHouses.length;
  const circles = validHouses.map((h) => [
    h.lat,
    h.lon,
    250 + 250 * ((h.population > 0 ? h.population : 1) / p_avg),
  ]);

  const best_pt = [lat_c, lon_c];
  const covered = circles.filter((c) => pointInCircle(best_pt, c)).length;

  return { best_pt, covered, total: validHouses.length, circles };
}