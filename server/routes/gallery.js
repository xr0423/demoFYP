import express from "express";
import { uploadImage, getGalleryImages } from "../controllers/galleries.js";
import multer from "multer"; 

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); 

// Route to upload images
router.post('/upload', upload.single('file'), uploadImage); // 'file' is the name of the file input

// Route to get images for a specific shop
router.get('/:shopId', getGalleryImages);

export default router;
