import express from "express";
import {
  getReviews,
  createReview,
  editReview,
  deleteReview,
  updateReply,
  deleteReply,
  getReviewCategories,
} from "../controllers/shopreview.js";

const router = express.Router();

// Route to get all reviews or reviews for a specific shop
router.get("/", getReviews);

// Route to create a new review
router.post("/", createReview);

// Route to edit a review
router.put("/", editReview);

// Route to delete a review
router.delete("/", deleteReview);

// Route to reply to a review
router.put("/reply", updateReply);

// Route to delete a reply
router.delete("/reply", deleteReply);

router.get("/review-categories", getReviewCategories);
export default router;
