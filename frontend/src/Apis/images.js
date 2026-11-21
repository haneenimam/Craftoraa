import axiosInstance from "./config";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 15 * 1024 * 1024; // what we're willing to read in the browser
const MAX_SIDE = 1200;                    // px; sharp on the product page, small to upload
const QUALITY = 0.85;

// Images uploaded from the dashboard are stored on products as "/api/images/<id>".
// They are served by the backend, so add its address; other URLs and paths are used as-is.
export const resolveImageUrl = (src) =>
  typeof src === "string" && src.startsWith("/api/images/") ? `${API_BASE_URL}${src}` : src;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file couldn't be read as an image."));
    };
    img.src = url;
  });

const canvasToBlob = (canvas, type) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

// Resize to at most 1200 px and re-encode in the browser. Uploads stay small, photos
// keep the orientation the browser shows them in, and the original file's metadata
// (for example a phone's GPS location) is not uploaded.
export async function prepareImage(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG or WebP image.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That image is too large. Please choose one under 15 MB.");
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // transparent areas become white rather than black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Some browsers can't encode WebP and silently return a PNG instead, so check the result
  let blob = await canvasToBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg");
  }
  if (!blob) throw new Error("This image couldn't be processed. Please try another one.");
  return blob;
}

// Returns the "/api/images/<id>" path to save on the product
export async function uploadProductImage(file) {
  const blob = await prepareImage(file);
  const formData = new FormData();
  formData.append("image", blob, blob.type === "image/webp" ? "product.webp" : "product.jpg");

  const res = await axiosInstance.post("/api/images", formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data.url;
}
