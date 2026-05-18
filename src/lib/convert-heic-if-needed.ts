const MAX_BYTES = 5 * 1024 * 1024;

export function isHeicLike(file: File): boolean {
  const lower = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return (
    mime === "image/heic" ||
    mime === "image/heif" ||
    lower.endsWith(".heic") ||
    lower.endsWith(".heif")
  );
}

/**
 * Converts HEIC/HEIF to JPEG in the browser so thumbnails and next/image work.
 * Non-HEIC files are returned unchanged.
 */
export async function convertHeicIfNeeded(file: File): Promise<File> {
  if (!isHeicLike(file)) return file;

  try {
    const { default: heic2any } = await import("heic2any");
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const blob = Array.isArray(result) ? result[0] : result;
    const baseName = file.name.replace(/\.(heic|heif)$/i, "") || "photo";
    const jpeg = new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    if (jpeg.size > MAX_BYTES) {
      throw new Error(
        "Converted JPEG is larger than 5 MB - try a smaller photo or export JPEG from your phone.",
      );
    }
    return jpeg;
  } catch (err) {
    if (err instanceof Error && err.message.includes("Converted JPEG")) {
      throw err;
    }
    throw new Error(
      "Could not convert HEIC - export as JPEG from Photos or choose PNG/WebP.",
    );
  }
}
