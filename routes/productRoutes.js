import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadProducts, listProducts, searchProducts } from '../controllers/productController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Serve the HTML upload form
router.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'upload-form.html'));
});

router.post('/upload', upload.single('file'), uploadProducts);
router.get('/products', listProducts);
router.get('/products/search', searchProducts);

export default router;
