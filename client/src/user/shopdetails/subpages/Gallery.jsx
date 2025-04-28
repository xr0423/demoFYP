import React, { useEffect, useState } from "react";
import { Card, CardMedia, Box, CircularProgress, Alert, Typography } from "@mui/material";
import { makeRequest } from "../../../axios";
import "./gallery.scss";

function UserGallery({ shopId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGalleryImages = async () => {
    try {
      const response = await makeRequest.get(`/shoplistings/gallery?shopId=${shopId}`);
      setImages(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching gallery images:", err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, [shopId]);

  if (loading) {
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
        <Alert severity="error">Error fetching gallery images: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <div className="user-gallery-container">
      {images.length > 0 ? (
        images.map((image) => (
          <Card key={image.id} className="gallery-card">
            <CardMedia
              component="img"
              image={image.image.startsWith("http") ? image.image : `/upload/${image.image}`}
              alt={`Photo ${image.id}`}
              className="gallery-image"
            />
          </Card>
        ))
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="300px"
          textAlign="center"
        >
          <Typography variant="h6" gutterBottom>
            No images in the gallery
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Check back later for more images.
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default UserGallery;
