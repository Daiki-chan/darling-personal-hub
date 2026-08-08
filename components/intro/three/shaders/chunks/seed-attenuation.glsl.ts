import { ELLIPSE_COORDS_GLSL } from "./ellipse-coords.glsl";

export const SEED_ATTENUATION_GLSL = `
${ELLIPSE_COORDS_GLSL}

float evaluateApprovedSeedParticleFactor(
  vec2 ndc,
  vec3 mvPos,
  vec2 seedCenter,
  float viewportAspect,
  float seedTilt,
  float seedAspect,
  float seedRadius,
  float seedViewDepth,
  float seedDepthBias,
  float awakening
) {
  float rSeed = getNormalizedRadius(ndc, seedCenter, viewportAspect, seedTilt, seedAspect, seedRadius);
  if (rSeed < 1.0 && mvPos.z < (seedViewDepth - seedDepthBias)) {
    float seedAtten = smoothstep(0.0, 1.0, rSeed);
    return mix(1.0, seedAtten, awakening);
  }
  return 1.0;
}
`;
