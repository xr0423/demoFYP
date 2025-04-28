import React, { useState, useEffect, useContext } from "react";
import { IconButton, Rating, Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import { makeRequest } from "../../../axios";
import { AuthContext } from "../../../context/authContext";
import CreateShopReviewForm from "../../createShopReviewForm/CreateShopReviewForm";
import UpdateShopReviewForm from "../../updateShopReviewForm/UpdateShopReviewForm";
import "./shopReview.scss";

const ShopReview = ({ shopId }) => {
  const { currentUser } = useContext(AuthContext);
  const [reviewsData, setReviewsData] = useState([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  const closeModal = () => {
    setShowCreateForm(false);
    setShowUpdateForm(false);
  };

  const fetchPointsBalance = async () => {
    try {
      const response = await makeRequest.get(`/myrewards/points?userId=${currentUser.id}`);
      setPointsBalance(response.data.points_balance);
    } catch (error) {
      console.error("Error fetching points balance:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await makeRequest.get(`/shopreviews?shopId=${shopId}`);
      setReviewsData(response.data.reviews);
      const avgRating = Number(response.data.ratingSummary?.averageRating || 0);
      setAverageRating(avgRating);
      setReviewCount(response.data.ratingSummary.reviewCount || 0);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await makeRequest.get(`/shopreviews/review-categories`);
      setCategories([{ id: "all", category_name: "All Reviews" }, ...response.data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchPointsBalance();
    fetchCategories();
  }, [shopId]);

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleReviewSubmit = (message) => {
    alert(message);
    fetchPointsBalance();
    fetchReviews();
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setShowUpdateForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await makeRequest.delete(`/shopreviews?id=${reviewId}`);
        setReviewsData(reviewsData.filter((review) => review.review_id !== reviewId));
        fetchReviews();
      } catch (err) {
        setError("Failed to delete review.");
      }
    }
  };

  // Filter reviews based on selected category and rating
  const filteredReviews = reviewsData.filter((review) => {
    const categoryMatch = selectedCategory === "all" || review.category_id === selectedCategory;
    const ratingMatch = selectedRating === "all" || review.rating === selectedRating;
    return categoryMatch && ratingMatch;
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="shop-review">
      <h2>Shop Reviews</h2>
      <p>Points Balance: {pointsBalance}</p>

      <div className="review-summary">
        <div> 
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            displayEmpty
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.category_name}
              </MenuItem>
            ))}
          </Select>

          {/* Rating Filter */}
          <Select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            displayEmpty
            style={{ marginLeft: "10px" }} // Optional styling
          >
            <MenuItem value="all">All Ratings</MenuItem>
            <MenuItem value="5.0">
              <span className="star-icon">
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
              </span>
            </MenuItem>
            <MenuItem value="4.0">
              <span className="star-icon">
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
              </span>
          

            </MenuItem>
            <MenuItem value="3.0">
              <span className="star-icon">
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
              </span>
              </MenuItem>
            <MenuItem value="2.0">
              <span className="star-icon">
                <StarIcon style={{ color: '#fead3d' }} />
                <StarIcon style={{ color: '#fead3d' }} />
              </span>
            </MenuItem>
            <MenuItem value="1.0">
              <span className="star-icon">
                <StarIcon style={{ color: '#fead3d' }} />
              </span>
            </MenuItem>
          </Select>
        </div>
        <div className="rating-summary">
          <h3>Overall Rating</h3>
          <div className="overall-rating">
            <Rating value={averageRating} readOnly precision={0.5} size="large" />
            <p className="rating-number">{averageRating.toFixed(1)}</p>
            <p className="review-count">({reviewCount} reviews)</p>
          </div>
        </div>
        <button className="addBtn" aria-label="add" onClick={handleCreateClick}>
          Make a review
        </button>
      </div>

      {filteredReviews.length > 0 ? (
        <ul className="review-list">
          {filteredReviews.map((review) => (
            <div className="review-card" key={review.review_id}>
              <div className="review-user">
                <img
                  src={review.profilePic}
                  alt={`${review.username}`}
                  className="review-user-pic"
                />
                <div>
                  <p>{review.username}</p>
                  <p className="created-at">{new Date(review.created_at).toLocaleString()}</p>
                </div>
                <p className="category">{review.category_name}</p>
              </div>
              <div className="review-rating">
                <Rating
                  name={`rating-${review.review_id}`}
                  value={review.rating}
                  precision={1}
                  readOnly
                />
                <span className="rating-number">({review.rating})</span>
              </div>
              <div className="review-section">
                <p className="review-text">{review.review_text}</p>
              </div>
              {review.reply_text && (
                 <div className="reply-section">
                 <p className="reply-text">Reply: {review.reply_text}</p>
                 <p className="replied-at">Replied at: {new Date(review.replied_at).toLocaleString()}</p>
               </div>
              )}

              {currentUser.id === review.user_id && (
              <div className="review-actions">
                <IconButton onClick={() => handleEditClick(review)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(review.review_id)}>
                  <DeleteIcon />
                </IconButton>
              </div>
              )}
            </div>
          ))}
        </ul>
      ) : (
        <p>No reviews available.</p>
      )}

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <CreateShopReviewForm
              shopId={shopId}
              onClose={closeModal}
              onReviewSubmit={() => handleReviewSubmit("Review has been created, and points added if eligible.")}
            />
          </div>
        </div>
      )}

      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <UpdateShopReviewForm 
              review={editingReview} 
              onClose={closeModal}
              onReviewSubmit={() => handleReviewSubmit("Review updated successfully.")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopReview;
