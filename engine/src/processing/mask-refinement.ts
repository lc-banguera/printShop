import { createAlphaData, type AlphaData } from './image-processing';

export type MaskMorphologyOperation = 'none' | 'opening' | 'closing';
export type MaskConnectivity = 4 | 8;

export interface MaskRefinementOptions {
  operation?: MaskMorphologyOperation;
  radius?: number;
  connectivity?: MaskConnectivity;
  fillHoles?: boolean;
  minimumForegroundRegionSize?: number;
}

function validateOptions(options: MaskRefinementOptions): void {
  const radius = options.radius ?? 1;
  const minimumSize = options.minimumForegroundRegionSize ?? 0;
  if (!['none', 'opening', 'closing'].includes(options.operation ?? 'none')) {
    throw new TypeError(`Unsupported mask morphology operation: ${String(options.operation)}`);
  }
  if (!Number.isSafeInteger(radius) || radius < 0 || radius > 64) {
    throw new RangeError('Mask refinement radius must be an integer between 0 and 64.');
  }
  if (options.connectivity !== undefined && options.connectivity !== 4 && options.connectivity !== 8) {
    throw new RangeError('Mask connectivity must be 4 or 8.');
  }
  if (!Number.isSafeInteger(minimumSize) || minimumSize < 0) {
    throw new RangeError('Minimum foreground region size must be a non-negative safe integer.');
  }
}

function morphology(
  values: Uint8Array,
  width: number,
  height: number,
  radius: number,
  dilate: boolean,
): Uint8Array {
  if (radius === 0) return new Uint8Array(values);

  const stride = width + 1;
  const integral = new Uint32Array(stride * (height + 1));
  for (let y = 0; y < height; y += 1) {
    let rowSum = 0;
    for (let x = 0; x < width; x += 1) {
      rowSum += values[y * width + x] >= 128 ? 1 : 0;
      integral[(y + 1) * stride + x + 1] =
        integral[y * stride + x + 1] + rowSum;
    }
  }

  const output = new Uint8Array(values.length);
  const expected = (radius * 2 + 1) ** 2;
  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height, y + radius + 1);
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width, x + radius + 1);
      const count =
        integral[bottom * stride + right] -
        integral[top * stride + right] -
        integral[bottom * stride + left] +
        integral[top * stride + left];
      output[y * width + x] = (dilate ? count > 0 : count === expected) ? 255 : 0;
    }
  }
  return output;
}

function neighbors(
  pixel: number,
  width: number,
  height: number,
  connectivity: MaskConnectivity,
): number[] {
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  const adjacent: number[] = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      if (connectivity === 4 && Math.abs(dx) + Math.abs(dy) !== 1) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
        adjacent.push(ny * width + nx);
      }
    }
  }
  return adjacent;
}

function filterSmallComponents(
  values: Uint8Array,
  width: number,
  height: number,
  foreground: boolean,
  minimumSize: number,
  connectivity: MaskConnectivity,
): void {
  if (minimumSize <= 1) return;
  const visited = new Uint8Array(values.length);
  const queue = new Int32Array(values.length);
  for (let start = 0; start < values.length; start += 1) {
    if (visited[start] || (values[start] >= 128) !== foreground) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    visited[start] = 1;
    while (head < tail) {
      const pixel = queue[head++];
      for (const adjacent of neighbors(pixel, width, height, connectivity)) {
        if (visited[adjacent] || (values[adjacent] >= 128) !== foreground) continue;
        visited[adjacent] = 1;
        queue[tail++] = adjacent;
      }
    }
    if (tail < minimumSize) {
      const replacement = foreground ? 0 : 255;
      for (let index = 0; index < tail; index += 1) values[queue[index]] = replacement;
    }
  }
}

function fillEnclosedHoles(
  values: Uint8Array,
  width: number,
  height: number,
  connectivity: MaskConnectivity,
): void {
  const visited = new Uint8Array(values.length);
  const queue = new Int32Array(values.length);
  let head = 0;
  let tail = 0;
  const enqueue = (pixel: number) => {
    if (visited[pixel] || values[pixel] >= 128) return;
    visited[pixel] = 1;
    queue[tail++] = pixel;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }
  while (head < tail) {
    const pixel = queue[head++];
    for (const adjacent of neighbors(pixel, width, height, connectivity)) enqueue(adjacent);
  }
  for (let pixel = 0; pixel < values.length; pixel += 1) {
    if (values[pixel] < 128 && !visited[pixel]) values[pixel] = 255;
  }
}

export function refineForegroundMask(
  source: AlphaData,
  options: MaskRefinementOptions = {},
): AlphaData {
  validateOptions(options);
  if (
    !Number.isSafeInteger(source.width) ||
    source.width <= 0 ||
    !Number.isSafeInteger(source.height) ||
    source.height <= 0 ||
    source.values.length !== source.width * source.height
  ) {
    throw new TypeError('Invalid alpha mask dimensions or data length.');
  }

  const values = new Uint8Array(source.values);
  const radius = options.radius ?? 1;
  const operation = options.operation ?? 'none';
  if (radius > 0 && operation === 'opening') {
    const eroded = morphology(values, source.width, source.height, radius, false);
    values.set(morphology(eroded, source.width, source.height, radius, true));
  } else if (radius > 0 && operation === 'closing') {
    const dilated = morphology(values, source.width, source.height, radius, true);
    values.set(morphology(dilated, source.width, source.height, radius, false));
  }

  const connectivity = options.connectivity ?? 4;
  filterSmallComponents(
    values,
    source.width,
    source.height,
    true,
    options.minimumForegroundRegionSize ?? 0,
    connectivity,
  );
  if (options.fillHoles) fillEnclosedHoles(values, source.width, source.height, connectivity);
  return createAlphaData(source.width, source.height, values);
}
