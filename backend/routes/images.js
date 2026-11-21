const express = require('express');
const multer = require('multer');
const { imageSize } = require('image-size');
const { auth, roleCheck } = require('../middleware/auth');
const ProductImage = require('../models/ProductImage');

const router = express.Router();

const MAX_BYTES = 2 * 1024 * 1024; // well under the ~4.5 MB request-body cap of serverless hosts
const MAX_SIDE = 5000;             // px; the dashboard uploads at most 1200 px
const TYPE_BY_FORMAT = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Files stay in memory (nothing is written to the server's disk); exactly one file field, no text fields
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1, fields: 0, parts: 1 }
}).single('image');

// Detect the real format from the file's first bytes; the client's Content-Type and filename are never trusted
const sniffType = (buf) => {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE)) return 'image/png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
};

// ===== UPLOAD (Admin, Seller) =====
router.post('/', auth, roleCheck(['Admin', 'Seller']), (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Image must be 2 MB or smaller' });
      }
      return res.status(400).json({ error: 'Send exactly one image in the "image" field' });
    }
    if (err) return res.status(400).json({ error: 'Invalid upload' });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    try {
      const buf = req.file.buffer;
      const contentType = sniffType(buf);

      // Magic bytes alone can be faked, so also parse the image header and check it agrees
      let dims = null;
      try { dims = imageSize(buf); } catch { dims = null; }

      if (!contentType || !dims || TYPE_BY_FORMAT[dims.type] !== contentType) {
        return res.status(415).json({ error: 'Only JPG, PNG or WebP images are allowed' });
      }
      if (!dims.width || !dims.height || dims.width > MAX_SIDE || dims.height > MAX_SIDE) {
        return res.status(400).json({ error: `Image must be at most ${MAX_SIDE} x ${MAX_SIDE} pixels` });
      }

      const image = await ProductImage.create({
        data: buf,
        contentType,
        size: buf.length,
        width: dims.width,
        height: dims.height,
        uploadedBy: req.user.id
      });

      res.status(201).json({
        id: image._id,
        url: `/api/images/${image._id}`,
        width: dims.width,
        height: dims.height
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// ===== SERVE (Public) =====
router.get('/:id', async (req, res) => {
  try {
    if (!/^[a-f0-9]{24}$/i.test(req.params.id)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = await ProductImage.findById(req.params.id).select('data contentType');
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Locked down so the browser can only ever treat the response as an image
    res.set({
      'Content-Type': image.contentType,
      'Content-Disposition': `inline; filename="product-image.${EXT_BY_TYPE[image.contentType]}"`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      // The shop's website is a different site from the API, so it must be allowed to embed these
      'Cross-Origin-Resource-Policy': 'cross-origin',
      // An id always points to the same bytes, so browsers may cache it for a year
      'Cache-Control': 'public, max-age=31536000, immutable'
    });
    res.send(image.data);
  } catch (error) {
    console.error('Image fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
