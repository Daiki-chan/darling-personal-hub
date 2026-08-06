const paletteCache = new Map<string, string>();

function seededFallback(seed: string) {
  let hash = 0;
  for (const character of seed) hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 58% 56%)`;
}

export async function extractAmbientColor(thumbnail: string, seed: string) {
  const known = paletteCache.get(thumbnail);
  if (known) return known;
  try {
    const stored = localStorage.getItem(`darling-palette:${thumbnail}`);
    if (stored) {
      paletteCache.set(thumbnail, stored);
      return stored;
    }
  } catch {
    // Palette storage is an optimization only.
  }

  const fallback = seededFallback(seed);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  image.src = thumbnail;
  try {
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 24;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return fallback;
    context.drawImage(image, 0, 0, 24, 24);
    const pixels = context.getImageData(0, 0, 24, 24).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let total = 0;
    for (let index = 0; index < pixels.length; index += 16) {
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 28 || brightness > 230 || Math.max(r, g, b) - Math.min(r, g, b) < 22) continue;
      red += r;
      green += g;
      blue += b;
      total += 1;
    }
    const color = total
      ? `rgb(${Math.round(red / total)} ${Math.round(green / total)} ${Math.round(blue / total)})`
      : fallback;
    paletteCache.set(thumbnail, color);
    try {
      localStorage.setItem(`darling-palette:${thumbnail}`, color);
    } catch {
      // Palette storage is an optimization only.
    }
    return color;
  } catch {
    paletteCache.set(thumbnail, fallback);
    return fallback;
  }
}
