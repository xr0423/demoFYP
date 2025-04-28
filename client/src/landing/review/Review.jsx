import React, { useState } from "react";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import { Rating, Avatar, useMediaQuery } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { makeRequest } from "../../axios";
import "./review.scss";

// Custom Next Arrow component
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "grey", right: "25px" }}
      onClick={onClick}
    />
  );
};

// Custom Previous Arrow component
const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "grey", left: "25px" }}
      onClick={onClick}
    />
  );
};

const Review = () => {
  const [imageErrorMap, setImageErrorMap] = useState({}); // Track image errors for each user
  const [reviews, setReviews] = useState({ regular: [], owner: [] });

  // Handle individual image error
  const handleImageError = (userId) => {
    setImageErrorMap((prev) => ({
      ...prev,
      [userId]: true, // Mark this user’s image as having an error
    }));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const response = await makeRequest.get("/review/user-type"); // API call to fetch reviews
      setReviews(response.data);
      return response.data;
    },
    onError: (error) => {
      console.error("Error fetching reviews:", error); // Handle errors
    },
  });

  // Detect if the screen size is small (smaller than 600px)
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  if (isLoading) {
    return (
      <div className="review-page-container" id="review">

      </div>
    )
  }

  if (error) {
    return (
      <div className="review-page-container" id="review">

      </div>
    )
  }

  // Slider settings with arrow controls
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="review-page-container" id="review">
      <h1>User Reviews</h1>
      <h2>From Regular User</h2>
      <Slider {...settings} className="review-slider">
        {reviews.regular.map((user) => (
          <div key={user.id} className="review-card">
            <div>
              {/* Display feature_name as a tag */}
              <div className="feature-tag">
                <span>{user.feature_name}</span>
              </div>
              {!imageErrorMap[user.id] && user.image ? (
                <img
                  src={user.image}
                  className="user-image"
                  onError={() => handleImageError(user.id)} // Pass user.id to track errors individually
                  alt={user.name}
                />
              ) : (
                <Avatar
                  sx={{
                    bgcolor: "#ccc",
                    width: isSmallScreen ? "50px" : "120px",
                    height: isSmallScreen ? "50px" : "120px",
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: 60 }} />
                </Avatar>
              )}
              <h3>{user.name}</h3>
              <p className="description">{user.user_type}</p>
            </div>
            <div className="review-content">
              <div className="rating">
                <Rating
                  name={`user-rating-${user.id}`}
                  value={parseFloat(user.rating)} // Convert rating to float
                  precision={0.5}
                  readOnly
                  sx={{
                    color: "#FFD700",
                    fontSize: isSmallScreen ? "1.2rem" : "2rem", // Adjust size based on screen width
                  }}
                />
                <span className="rating-value">({user.rating})</span>
              </div>
              <p className="review-text">{user.review}</p>
            </div>
          </div>
        ))}
      </Slider>
      <h2>From Coffee Shop Owner</h2>
      <Slider {...settings} className="review-slider">
        {reviews.owner.map((user) => (
          <div key={user.id} className="review-card">
            <div>
              {/* Display feature_name as a tag */}
              <div className="feature-tag">
                <span>{user.feature_name}</span>
              </div>
              {!imageErrorMap[user.id] && user.image ? (
                <img
                  src={user.image}
                  className="user-image"
                  onError={() => handleImageError(user.id)} // Pass user.id to track errors individually
                  alt={user.name}
                />
              ) : (
                <Avatar
                  sx={{
                    bgcolor: "#ccc",
                    width: isSmallScreen ? "50px" : "120px",
                    height: isSmallScreen ? "50px" : "120px",
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: 60 }} />
                </Avatar>
              )}
              <h3>{user.name}</h3>
              <p className="description">{user.user_type}</p>
            </div>
            <div className="review-content">
              <div className="rating">
                <Rating
                  name={`user-rating-${user.id}`}
                  value={parseFloat(user.rating)} // Convert rating to float
                  precision={0.5}
                  readOnly
                  sx={{
                    color: "#FFD700",
                    fontSize: isSmallScreen ? "1.2rem" : "2rem", // Adjust size based on screen width
                  }}
                />
                <span className="rating-value">({user.rating})</span>
              </div>
              <p className="review-text">{user.review}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Review;