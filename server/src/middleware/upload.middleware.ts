import multer from 'multer';
import path from 'path';
import { config } from '../config';
import fs from 'fs';

if (!fs.existsSync(config.upload?.dir || 'uploads/')) {
  fs.mkdirSync(config.upload?.dir || 'uploads/', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload?.dir || 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: config.upload?.maxFileSize || 5 * 1024 * 1024 },
});
