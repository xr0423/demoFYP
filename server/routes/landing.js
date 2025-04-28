import express from "express";
import {getContentBySection} from "../controllers/landing.js"
const router = express.Router();

router.get('/', getContentBySection);

export default router;