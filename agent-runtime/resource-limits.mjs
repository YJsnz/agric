export function resourceLimits(input) {
  const integer = (value, fallback, low, high) => {
    const number = value === undefined ? fallback : Number(value);
    if (!Number.isInteger(number) || number < low || number > high) throw new Error('Invalid model resource limit');
    return number;
  };
  const limits = {
    contextTokens: integer(input.contextTokens, 8192, 2048, 32768),
    maxTokens: integer(input.maxTokens, 768, 128, 2048),
    timeoutSeconds: integer(input.timeoutSeconds, 600, 60, 900),
  };
  if (limits.maxTokens >= limits.contextTokens) throw new Error('Output budget exceeds context');
  return limits;
}
