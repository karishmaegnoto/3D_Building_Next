export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function getImageMimeFromDataUrl(value) {
  if (typeof value !== "string") return "";
  const head = value.slice(0, 64).toLowerCase();
  if (head.startsWith("data:image/png")) return "image/png";
  if (head.startsWith("data:image/jpeg") || head.startsWith("data:image/jpg")) return "image/jpeg";
  return "";
}

function getDecodedHeadBytes(value) {
  const comma = value.indexOf(",");
  if (comma === -1) return null;
  const body = value.slice(comma + 1).replace(/\s+/g, "");
  if (!body) return null;
  const head = body.slice(0, 32);
  try {
    if (typeof atob === "function") {
      const bin = atob(head);
      const out = [];
      for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i));
      return out;
    }
  } catch (_) {
    return null;
  }
  try {
    if (typeof Buffer !== "undefined") {
      return Array.from(Buffer.from(head, "base64"));
    }
  } catch (_) {
    return null;
  }
  return null;
}

export function isValidImageDataUrl(value, maxBytes = MAX_IMAGE_BYTES) {
  if (typeof value !== "string") return false;
  const mime = getImageMimeFromDataUrl(value);
  if (!mime) return false;
  const comma = value.indexOf(",");
  if (comma === -1) return false;
  const body = value.slice(comma + 1).replace(/\s+/g, "");
  if (!body || body.length < 32) return false;
  if (body.length * 0.75 > maxBytes + 1024) return false;
  const head = getDecodedHeadBytes(value);
  if (!head || head.length < 4) return false;
  if (mime === "image/png") {
    return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  }
  return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
}

export function isSupportedImageFile(file, maxBytes = MAX_IMAGE_BYTES) {
  if (!file || typeof file !== "object") return false;
  const type = String(file.type || "").toLowerCase();
  if (type && type !== "image/png" && type !== "image/jpeg" && type !== "image/jpg") return false;
  if (typeof file.size === "number" && file.size > 0 && file.size > maxBytes) return false;
  if (typeof file.size === "number" && file.size === 0) return false;
  return true;
}

export function sanitizeQuoteFields(fields, maxBytes = MAX_IMAGE_BYTES) {
  if (!fields || typeof fields !== "object") return {};
  const next = { ...fields };
  for (const key of Object.keys(next)) {
    const val = next[key];
    if (typeof val === "string" && val.startsWith("data:image/") && !isValidImageDataUrl(val, maxBytes)) {
      next[key] = "";
    }
  }
  return next;
}

export default {
  MAX_IMAGE_BYTES,
  getImageMimeFromDataUrl,
  isValidImageDataUrl,
  isSupportedImageFile,
  sanitizeQuoteFields,
};
