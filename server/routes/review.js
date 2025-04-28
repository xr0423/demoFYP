import express from "express";
import { createReview, getFeatures, getLatestReviewByUserType, getReviewRelatedData } from "../controllers/review.js";

const router = express.Router();


router.get("/related-data", getReviewRelatedData);
router.post("/", createReview);
router.get("/features", getFeatures);
router.get("/user-type", getLatestReviewByUserType);
export default router;