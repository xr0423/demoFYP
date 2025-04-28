import express from 'express';
import {getAdvertisePost} from '../controllers/advertise.js';

const router = express.Router();

router.get('/posts', getAdvertisePost);

export default router;