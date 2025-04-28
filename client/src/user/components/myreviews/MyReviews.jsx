import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import Rating from "@mui/material/Rating";
import { useNavigate } from "react-router-dom";
import "./myReviews.scss";

const MyReviews = ({ userId }) => {
  const { currentUser } = useContext(AuthContext);
  const [myReviews, setMyReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const response = await makeRequest.get("/shopreviews?userId=" + userId);
        setMyReviews(response.data.reviews);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch reviews");
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, [userId]);

  // Function to get the shop link based on the user type and shop ID
  const getShopLink = (userType, shopId) => {
    switch (userType) {
      case "regular":
        return `/user/shoplisting/${shopId}/overview`;
      case "owner":
        return `/owner/shoplisting/${shopId}/overview`;
      case "admin":
        return `/admin/shoplisting/${shopId}/overview`;
      default:
        return `/expert/shoplisting/${shopId}/overview`;
    }
  };

  // Function to handle navigation to the respective shop listing
  const handleShopClick = (shopId) => {
    const link = getShopLink(currentUser.type, shopId);
    navigate(link);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="my-reviews">
      {myReviews.length > 0 ? (
        <ul className="review-list">
          {myReviews.map((review) => (
            <div className="review-card" key={review.review_id}>
              <div className="review-header">
                {/* Shop name clickable to navigate to the respective shop listing */}
                <h3
                  onClick={() => handleShopClick(review.shop_id)} // Pass the shop ID
                  className="shop-link"
                  style={{ cursor: "pointer", color: "black" }} // Add pointer cursor and link color
                >
                  {review.shop_name}
                </h3>
                <p className="category">{review.category_name}</p>
              </div>
              <div className="review-rating">
                <Rating value={review.rating} readOnly precision={0.5} />
                <span className="rating-number">({review.rating})</span>
              </div>
              <div className="review-text">
                <p>{review.review_text}</p>
              </div>
              {review.reply_text && (
                <div className="reply-section">
                  <p>Reply: {review.reply_text}</p>
                </div>
              )}
              <p className="created-at">
                {new Date(review.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </ul>
      ) : (
        <p>No reviews available.</p>
      )}
    </div>
  );
};

export default MyReviews;
