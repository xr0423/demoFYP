import React, { useState, useEffect } from "react";
import { makeRequest } from "../../axios";
import { Rating } from "@mui/material"; // Import Rating from Material-UI
import "./reviewForm.scss";

const ReviewForm = ({ onClose }) => {
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [rating, setRating] = useState(0); // Default rating set to 2.5 stars
  const [reviewText, setReviewText] = useState("");

  const fetchFeatures = async () => {
    try {
      const response = await makeRequest.get("/review/related-data");
      setFeatures(response.data);
    } catch (err) {
      console.error("Error fetching platform features:", err);
    }
  };

  useEffect(() => {
    fetchFeatures();

    // Disable scrolling when the modal is open
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the modal is closed
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      feature_id: selectedFeature,
      rating,
      review_text: reviewText,
    };

    try {
      await makeRequest.post("/review", formData);
      alert("Review submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit the review.");
    }
  };

  return (
    <div className="app-review-form-modal">
      <div className="modal">
        <div className="modal-content">
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
          <h1 className="title">Submit Your Review</h1>
          <form className="review-form" onSubmit={handleSubmit}>
            <label htmlFor="feature">Select Feature:</label>
            <select
              id="feature"
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              required
            >
              <option value="">-- Select Feature --</option>
              {features.map((feature) => (
                <option key={feature.id} value={feature.id}>
                  {feature.feature_name}
                </option>
              ))}
            </select>
            Rating:
            {/* Rating using Material-UI Rating component */}
            <Rating
              name="rating"
              value={rating}
              precision={0.5}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
            />


            <label htmlFor="reviewText">Review:</label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>

            <button type="submit">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
