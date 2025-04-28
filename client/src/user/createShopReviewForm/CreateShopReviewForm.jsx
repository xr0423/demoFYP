import React, { useState, useEffect } from 'react';
import { makeRequest } from '../../axios';
import { Rating, Select, MenuItem } from '@mui/material';
import './createShopReviewForm.scss';

const CreateShopReviewForm = ({ onClose, shopId, onReviewSubmit }) => {
  const [reviewData, setReviewData] = useState({
    rating: 0,
    category_id: '',
    review_text: '',
    shop_id: shopId,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure `category_id` is treated as a string
    if (name === 'category_id' || name === 'review_text') {
        setReviewData({
            ...reviewData,
            [name]: value,
        });
    } else if (name === 'rating') {
        // Parse rating as a float to ensure it's a number
        setReviewData({
            ...reviewData,
            [name]: parseFloat(value) || 0,
        });
    }
};

const handleRatingChange = (event, newValue) => {
    // Set rating value as a number
    setReviewData({
        ...reviewData,
        rating: newValue || 0, // Ensure it's a number
    });
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.rating || !reviewData.category_id || !reviewData.review_text) {
      setError("All fields are required.");
      return;
    }
    try {
      await makeRequest.post(`/shopreviews`, reviewData);
      onReviewSubmit(); // Call parent function to refresh points and reviews
      onClose(); // Close modal after successful submission
    } catch (err) {
      setError('Failed to create review.');
    }
  };

  return (
    <div className="createReviewForm">
      <h1>Add New Review</h1>
      <form className="user-review-form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <label htmlFor="category_id">Category</label>
        <Select
          id="category_id"
          name="category_id"
          value={reviewData.category_id}
          onChange={handleInputChange}
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
          precision={1.0}
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
          <button className="submit-btn" type="submit">
            Submit Review
          </button>
          <button className="cancel-btn" type="button" onClick={onClose}>
            Cancel
          </button>
      </form>
    </div>
  );
};

export default CreateShopReviewForm;
