export const ELLIPSE_COORDS_GLSL = `
float getNormalizedRadius(
  vec2 ndc,
  vec2 center,
  float viewportAspect,
  float tilt,
  float aspect,
  float radius
) {
  vec2 diff = ndc - center;
  diff.x *= viewportAspect;
  float cosT = cos(tilt);
  float sinT = sin(tilt);
  vec2 rot = vec2(
    diff.x * cosT - diff.y * sinT,
    diff.x * sinT + diff.y * cosT
  );
  rot.y *= aspect;
  return length(rot) / radius;
}
`;
