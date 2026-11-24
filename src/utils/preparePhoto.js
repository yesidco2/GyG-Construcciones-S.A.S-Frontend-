export const PHOTO_TYPES = 'image/jpeg,image/png,image/webp';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// The server re-encodes uploads as RGBA PNG. Bound even poorly compressible photos.
const WORK_PHOTO_PIXELS = 1_200_000;

export function prepareProfilePhoto(file) {
  return preparePhoto(file, true);
}

export function prepareWorkPhoto(file) {
  return preparePhoto(file, false);
}

async function preparePhoto(file, profile) {
  if (!file.size || !PHOTO_TYPES.split(',').includes(file.type)) {
    throw new Error('Selecciona una foto JPEG, PNG o WebP válida.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {
      throw new Error('No se pudo leer la foto. Selecciona una imagen JPEG, PNG o WebP válida.');
    });

    const { naturalWidth: width, naturalHeight: height } = image;
    const pixels = width * height;
    if (!profile && pixels <= WORK_PHOTO_PIXELS && file.size <= MAX_UPLOAD_BYTES) return file;
    const scale = profile ? Math.min(1, 512 / Math.max(width, height))
      : Math.min(1, Math.sqrt(WORK_PHOTO_PIXELS / pixels), 4096 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no pudo preparar la foto.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('No se pudo procesar la foto. Selecciona otra imagen.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
