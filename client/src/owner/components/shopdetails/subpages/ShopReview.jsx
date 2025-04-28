import React, { useState, useEffect } from "react";
import { Rating, Select, MenuItem, Box, CircularProgress, Alert, IconButton } from "@mui/material"; // Import Rating, Select, and MenuItem from MUI
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import { makeRequest } from "../../../../axios";
import UpdateShopReplyForm from "../../updateShopReplyForm/UpdateShopReplyForm";
import "./shopReview.scss";
import { AuthContext } from "../../../../context/authContext";
import { useContext } from "react";

import CreateShopReviewForm from "../../../../user/createShopReviewForm/CreateShopReviewForm";
import UpdateShopReviewForm from "../../../../user/updateShopReviewForm/UpdateShopReviewForm";


const ShopReview = ({ shopId, ownerDetails }) => {
  const [reviewsData, setReviewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const { currentUser } = useContext(AuthContext);
  const [editingReview, setEditingReview] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shopStatus, setShopStatus] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const closeModal = () => {
    setShowCreateForm(false);
    setShowUpdateForm(false);
  };
  
  const getShopStatus = async () => {
    try {
      const response = await makeRequest.get(`/shoplistings/status?id=${shopId}`);
      setShopStatus(response.data === 'active' ? true : false);
    } catch (err) {
    }
  }

  useEffect(() => {
    getShopStatus();
    fetchReviews();
    fetchCategories();
  }, [shopId]);

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

  const handleReplyClick = (reviewId) => {
    setReplyingToReviewId(reviewId);
  };

  const handleReplyUpdated = async () => {
    setReplyingToReviewId(null);
    try {
      const updatedReviews = await makeRequest.get(`/shopreviews?shopId=${shopId}`);
      setReviewsData(updatedReviews.data.reviews);
    } catch (err) {
      setError("Failed to refresh reviews.");
    }
  };
  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      try {
        await makeRequest.delete(`/shopreviews/reply?id=${reviewId}`);
        setReviewsData(reviewsData.filter((review) => review.review_id !== reviewId));
        fetchReviews(); // Update average rating and count after deletion
      } catch (err) {
        setError("Failed to delete reply.");
      }
    }
  };

  const handleCancelReply = () => {
    setReplyingToReviewId(null);
  };

  // Filter reviews based on selected category
  const filteredReviews = reviewsData.filter((review) => {
    const categoryMatch = selectedCategory === "all" || review.category_id === selectedCategory;
    const ratingMatch = selectedRating === "all" || review.rating === selectedRating;
    return categoryMatch && ratingMatch;
  });

  // user side review 
  const handleEditClick = (review) => {
    setEditingReview(review);
    setShowUpdateForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
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

  const fetchPointsBalance = async () => {
    try {
      const response = await makeRequest.get(`/myrewards/points?userId=${currentUser.id}`);
      setPointsBalance(response.data.points_balance);
    } catch (error) {
      console.error("Error fetching points balance:", error);
    }
  };

  const handleReviewSubmit = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    fetchPointsBalance();
    fetchReviews();
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };


    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px"
        >
          <CircularProgress />
        </Box>
      );
    }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
        textAlign="center"
      >
        <Alert severity="error">Error loading Shop Reviews</Alert>
      </Box>
    );
  }

  return (
    <div className="shop-review">
      <h2>Shop Reviews</h2>

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
        {(currentUser.type === "regular" || currentUser.type === "expert") && (
          <button className="addBtn" aria-label="add" onClick={handleCreateClick}>
            Make a review
          </button>
        )}
      </div>

      {filteredReviews && filteredReviews.length > 0 ? (
        <ul className="review-list">
          {filteredReviews.map((review) => (
            <div className="review-card" key={review.review_id}>
              <div className="review-user">
                <img
                  src={ review.profilePic ? `/upload/${review.profilePic}` : '/upload/empty-profile-picture.jpg'}
                  alt={ review.name }
                  className="review-user-pic"
                />
                <div>
                <p>{review.name}</p>
                <p className="created-at">{new Date(review.created_at).toLocaleString()}</p>
                </div>
                <p className="category"> {review.category_name}</p>
              </div>
              <div className="review-rating">
                <Rating
                  name={`rating-${review.review_id}`}
                  value={review.rating}
                  precision={0.5}
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
              {replyingToReviewId === review.review_id ? (
                <UpdateShopReplyForm
                  reviewId={review.review_id}
                  currentReplyText={review.reply_text}
                  onReplyUpdated={handleReplyUpdated}
                  onCancel={handleCancelReply}
                />
              ) : (
                <div className="review-actions">
                {ownerDetails?.id === currentUser?.id && ( // Only show actions if current user is the owner
                  <>
                    {review.reply_text && ( // Only show delete button if there's a reply
                      <button className="delete-btn" onClick={() => handleDelete(review.review_id)}>
                        Delete
                      </button>
                    )}
                    <button className="edit-btn" onClick={() => handleReplyClick(review.review_id)}>
                      {review.reply_text ? "Edit Reply" : "Reply"}
                    </button>
                  </>
                )}
                {currentUser.id === review.user_id && (
                  <>
                    <IconButton onClick={() => handleEditClick(review)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteReview(review.review_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
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
              onReviewSubmit={() => handleReviewSubmit("Review updated successfully!")}
            />
          </div>
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ShopReview;
