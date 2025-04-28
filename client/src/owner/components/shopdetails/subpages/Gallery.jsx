import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { makeRequest } from "../../../../axios";
import UploadGallery from '../../uploadGallery/UploadGallery';
import "./gallery.scss";
import { AuthContext } from "../../../../context/authContext";

const Gallery = ({ shopId, ownerDetails}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadGalleryForm, setShowUploadGalleryForm] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const { currentUser } = useContext(AuthContext);

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

  const [shopStatus, setShopStatus] = useState(false)
  const getShopStatus = async () => {
    try {
      const response = await makeRequest.get(`/shoplistings/status?id=${shopId}`);
      setShopStatus(response.data === 'active' ? true : false);
      setLoading(false);
    } catch (err) {
    }
  }

  useEffect(() => {
    getShopStatus();
    fetchGalleryImages();
  }, [shopId, showUploadGalleryForm]);

  const handleUploadGalleryForm = () => setShowUploadGalleryForm((prev) => !prev);

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedImages([]);
  };

  const handleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selectedImages.map((imageId) =>
          makeRequest.delete(`/shoplistings/gallery?imageId=${imageId}`)
        )
      );
      fetchGalleryImages();
      setDeleteMode(false);
      setSelectedImages([]);
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error("Error deleting photos:", error);
    }
  };

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
        <Alert severity="error">Error fetching events: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <div className="gallery-container">
      {images.length > 0 ? (
        <>
          {ownerDetails?.id === currentUser?.id && (
            <div className="button-wrapper">
              <IconButton
                className="upload-image-button"
                onClick={handleUploadGalleryForm}
                disabled={!shopStatus}
              >
                <CloudUploadIcon />
              </IconButton>
              <IconButton
                className="edit-images-button"
                onClick={toggleDeleteMode}
                disabled={!shopStatus}
              >
                {deleteMode ? <CancelIcon /> : <EditIcon />}
              </IconButton>
              {deleteMode && (
                <IconButton
                  className="delete-image-button"
                  onClick={() => setOpenConfirmDialog(true)}
                  disabled={selectedImages.length === 0 || !shopStatus}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          )}


          <div className="gallery-grid">
            {images.map((image) => (
              <Card
                key={image.id}
                className={`gallery-card ${deleteMode && selectedImages.includes(image.id) ? "selected" : ""}`}
                onClick={deleteMode ? () => handleSelectImage(image.id) : undefined}
              >
                <CardMedia
                  component="img"
                  image={image.image.startsWith("http") ? image.image : `/upload/${image.image}`}
                  alt={`Photo ${image.id}`}
                  className="gallery-image"
                />
                <CardActions>
                  {deleteMode && selectedImages.includes(image.id) && (
                    <CheckCircleIcon color="success" />
                  )}
                </CardActions>
              </Card>
            ))}
          </div>
        </>
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
            Add images to showcase your gallery.
          </Typography>
          {ownerDetails?.id === currentUser?.id && (
            <IconButton
              className="upload-image-button"
              onClick={handleUploadGalleryForm}
              disabled={!shopStatus}
            >
              <CloudUploadIcon />
            </IconButton>
          )}

        </Box>
      )}

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the selected photos?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {showUploadGalleryForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UploadGallery onClose={handleUploadGalleryForm} shopId={shopId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
