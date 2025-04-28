import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Rating,
} from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { useNavigate } from "react-router-dom";
import "./shopListing.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";


function ShopListing({
  shoplisting,
  isFavorite = false,
  toggleFavorite = null,
  userMode = false,
}) {

  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext); 

  const handleNavigate = () => {
    // Get the role of the current user
    let basePath;
  
    if (currentUser.type === "expert") {
      basePath = "/expert";
    } else if (currentUser.type === "owner") {
      basePath = "/owner"; // Base path for owner
    } else {
      basePath = "/user"; // Default path for regular users
    }
  
    const path = `${basePath}/shoplisting/${shoplisting.shop_id}/overview`;
    navigate(path);
  };


  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(shoplisting.shop_id);
    }
  };

  const shoprating = () => {
    const rating = shoplisting.rating;
    return Math.round(rating * 100)/100;
  }

    // Function to validate if the image is a full URL or needs a prefix
    const getImageSrc = () => {
      const photo = shoplisting.img;
      if (photo) {
          // If it starts with http or https, it's a full URL
          if (photo.startsWith('http') || photo.startsWith('https')) {
              return photo;
          } else {
              // Otherwise, prepend '/upload/' to the filename
              return `/upload/${photo}`;
          }
      }
      // Default image if no photo is available
      return '/upload/default.png';
  };

  return (
      <Card
        className="user-shoplisting"
        sx={{
          width: "260px",
          height: "500px",
          m: 1, // Adjusted margin for closer distance between cards
          boxShadow: 2,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f5ebe1",
          borderRadius: "16px", 
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 3,
          },
        }}
      >
      <CardMedia
        component="img"
        image={getImageSrc()}
        alt={shoplisting.name}
        sx={{ width: "100%", height: "260px", objectFit: "cover" }} // Square image size
        onClick={handleNavigate}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" component="div" fontSize="1rem" color="#3e2723">
          {shoplisting.name}
        </Typography>
        <Typography variant="body2" color="#5d4037">
          {shoplisting.type || "No Type Provided"}
        </Typography>
        <Typography variant="body2" color="#5d4037" mt={1}>
          {shoplisting.location || "Not specified"}
        </Typography>
        <Box mt={1} display="flex" alignItems="center">
  <Rating
    name="shop-rating"
    value={shoplisting.rating || 0}
    precision={0.5}
    readOnly
  />
  <Typography variant="body2" color="#5d4037" ml={1}>
    {shoplisting.reviewCount} ratings
  </Typography>
</Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", paddingRight: 2 }}>
        {!userMode && (
          <IconButton
            onClick={handleFavoriteClick}
            aria-label="add to favorites"
          >
            {isFavorite ? (
              <FavoriteOutlinedIcon style={{ color: "red" }} />
            ) : (
              <FavoriteBorderOutlinedIcon />
            )}
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
}

export default ShopListing;
