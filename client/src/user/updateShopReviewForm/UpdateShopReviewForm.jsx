import React, { useState, useEffect } from 'react';
import { makeRequest } from '../../axios';
import { Rating, Select, MenuItem, Button } from '@mui/material';
import './updateShopReviewForm.scss';

const UpdateShopReviewForm = ({ onClose, review,onReviewSubmit }) => {
  const [reviewData, setReviewData] = useState({
    rating: review.rating || 0,
    category_id: review.category_id || '',
    review_text: review.review_text || '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await makeRequest.get('/shopreviews/review-categories');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories.');
      }
    };
    fetchCategories();
  }, []);

  // Handle generic input changes for textarea and other inputs
  const handleInputChange = (e) => {
    setReviewData({
      ...reviewData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle category selection change
  const handleCategoryChange = (e) => {
    console.log("Selected Category ID:", e.target.value);
    setReviewData({
      ...reviewData,
      category_id: e.target.value,
    });
  };

  // Handle rating change
  const handleRatingChange = (event, newValue) => {
    setReviewData({
      ...reviewData,
      rating: newValue,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.review_id) {
      setError('Review ID is missing. Cannot update review.');
      return;
    }
    if (!reviewData.rating || !reviewData.category_id || !reviewData.review_text) {
      setError("All fields are required.");
      return;
    }
    try {
      // Use the review ID to update the review
      const response = await makeRequest.put(`/shopreviews?id=${review.review_id}`, reviewData);
      if (response.status === 200) {
        onReviewSubmit(); 
        onClose(); // Close modal after successful submission
      } else {
        setError(`Failed to update review.` );
        console.error('Update failed with status: ', response.status);
      }
    } catch (err) {
      setError('You can only update your own review');
      console.error('Error during update:', err);
    }
  };

  return (
    <div className="updateReviewForm">
      <h1>Edit Review</h1>
      <form className="review-form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <label htmlFor="category_id">Category</label>
        <Select
          id="category_id"
          name="category_id"
          value={reviewData.category_id}
          onChange={handleCategoryChange} // Change handler for category
          displayEmpty
          required
        >
          <MenuItem value="">
            <em>Select Category</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.category_name}
            </MenuItem>
          ))}
        </Select>

        <label htmlFor="rating">Rating</label>
        <Rating
          name="rating"
          value={reviewData.rating}
          precision={0.5}
          onChange={handleRatingChange}
          size="large"
        />

        <label htmlFor="review_text">Review</label>
        <textarea
          id="review_text"
          name="review_text"
          value={reviewData.review_text}
          onChange={handleInputChange}
          placeholder="Write your review here"
          maxLength={200}
        ></textarea>
        <div>{reviewData.review_text.length} / 200 characters</div>
          <button className="update-btn" type="submit">
            Update Review
          </button>
          <button className="cancel-btn" type="button" onClick={onClose}>
            Cancel
          </button>
      </form>
    </div>
  );
};

export default UpdateShopReviewForm;
