/**
 * Оптимизация изображений перед загрузкой
 * - Ресайз до максимального размера (2048px по большей стороне)
 * - Конвертация в JPEG с качеством 85%
 * - Возвращает Blob
 */

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

export async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;

        // Ресайз если нужно
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Белая подложка для JPEG (нет прозрачности)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function optimizeFiles(files: File[]): Promise<File[]> {
  const optimized: File[] = [];

  for (const file of files) {
    // Пропускаем не-изображения
    if (!file.type.startsWith('image/')) continue;

    try {
      const blob = await optimizeImage(file);
      const name = file.name.replace(/\.[^.]+$/, '.jpg');
      const optimizedFile = new File([blob], name, { type: 'image/jpeg' });
      optimized.push(optimizedFile);
    } catch (e) {
      console.error('Failed to optimize image:', file.name, e);
      // Если не удалось оптимизировать — добавляем оригинал
      optimized.push(file);
    }
  }

  return optimized;
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
