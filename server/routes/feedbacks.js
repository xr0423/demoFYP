import express from 'express';
const router = express.Router();
import { getRelatedData, addFeedback } from '../controllers/feedback.js'; // Updated path to feedbackController


// Route to fetch Feedback Types
router.get('/related-data', getRelatedData);

// Route to add new Feedback (optional)
router.post('/', addFeedback);

export default router;
