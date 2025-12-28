export const buildTicks = (maxValue: number, targetSegments: number) => {
  if (maxValue <= 0) {
    return { maxScale: 0, ticks: [0] };
  }

  const roughStep = maxValue / targetSegments;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const maxScale = Math.ceil(maxValue / step) * step;
  const ticks = Array.from({ length: Math.floor(maxScale / step) + 1 }, (_, index) =>
    Math.round(maxScale - step * index)
  );

  return { maxScale, ticks };
};
