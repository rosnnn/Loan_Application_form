const MAX_WIDTH = 1200;
const TARGET_MAX_BYTES = 2 * 1024 * 1024; // 2MB

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

/**
 * Compresses an image file client-side via Canvas API.
 * Only applies to image/* files - PDFs are returned unchanged.
 * Non-blocking: uses async/await with Promises throughout.
 */
export async function compressImage(file) {
  if (!file.type.startsWith('image/')) {
    return {
      file, originalSize: file.size, compressedSize: file.size, wasCompressed: false,
    };
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_WIDTH / img.width);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.7;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > TARGET_MAX_BYTES && quality > 0.3) {
    quality -= 0.1;
    // eslint-disable-next-line no-await-in-loop
    blob = await canvasToBlob(canvas, quality);
  }

  const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
  });

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    wasCompressed: true,
  };
}
