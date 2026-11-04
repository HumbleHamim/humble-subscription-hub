/** Browser-side image prep for the admin panel: resize + compress to WebP
 *  and return a data URL, so photos can be saved with the product (no paid
 *  storage service needed). */

export const MAX_IMAGES = 6;
const MAX_SIDE = 720; // px, longest side
const QUALITY = 0.72;
/** Firestore documents are limited to 1 MiB; keep headroom for other fields. */
export const MAX_IMAGES_BYTES = 750_000;

export function dataUrlBytes(dataUrl: string): number {
  return dataUrl.startsWith('data:') ? Math.ceil(dataUrl.length * 0.75) : 0;
}

export function totalImageBytes(images: string[]): number {
  return images.reduce((sum, image) => sum + dataUrlBytes(image), 0);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(blob);
  });
}

export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`${file.name} could not be opened.`);
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image processing is not supported in this browser.');
  ctx.fillStyle = '#ffffff'; // flatten transparency so JPEG fallback is not black
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
  let blob = await toBlob('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
  if (!blob) throw new Error('Could not compress the image.');
  return blobToDataUrl(blob);
}
