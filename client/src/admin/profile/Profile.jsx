// src/pages/Profile/Profile.jsx

import React, { useState, useContext, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./Profile.scss";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const userId = parseInt(location.pathname.split("/")[3]);
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false); // for wrong image type
  const [alertMessage, setAlertMessage] = useState("");

  const queryClient = useQueryClient();

  // remove invalid files for cover and profile pic
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // State for Update Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // State for Snackbar Notifications
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    message: "",
    severity: "success",
  });

  // Fetch user profile data
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    data: user,
    error: userError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      makeRequest.get("/admin/profile?id=" + userId).then((res) => res.data),
  });

  // Fetch related data (gender options)
  const {
    isLoading: isRelatedDataLoading,
    isError: isRelatedDataError,
    data: relatedData,
    error: relatedDataError,
  } = useQuery({
    queryKey: ["profileRelatedData"],
    queryFn: () =>
      makeRequest.get("/admin/profile/related-data").then((res) => res.data),
  });

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: (payload) =>
      makeRequest.put("/admin/profile", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["user", userId]);
      setSnackbarContent({
        message: "Profile updated successfully.",
        severity: "success",
      });
      setIsSnackbarOpen(true);
      handleCloseUpdateModal();
    },
    onError: (error) => {
      console.error("Update Error:", error);
      setSnackbarContent({
        message: "Failed to update profile.",
        severity: "error",
      });
      setIsSnackbarOpen(true);
    },
  });

  // Handle opening update modal
  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  // Handle closing update modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  // Handle Snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setIsSnackbarOpen(false);
  };

  // Handle form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      // Extract form data
      const formData = new FormData(e.target);

      let coverUrl = user.coverPic;
      let profileUrl = user.profilePic;

      if (cover) coverUrl = await uploadFile(cover);
      if (profile) profileUrl = await uploadFile(profile);

      // Prepare payload
      const payload = {
        id: user.id,
        name: formData.get("name") || "", // Get "name" from form data
        email: formData.get("email") || "",
        gender: formData.get("gender") || "", // Get "gender" from form data
        dob: formData.get("dob") || null, // Get "dob" from form data, set to null if empty
        phone: formData.get("phone") || "",
        coverPic: coverUrl,
        profilePic: profileUrl,
      };

      // Trigger update mutation
      updateMutation.mutate(payload);
    } catch (err) {
      console.error("Form Submission Error:", err);
      setSnackbarContent({
        message: "An unexpected error occurred.",
        severity: "error",
      });
      setIsSnackbarOpen(true);
    }
  };

  // Function to handle file uploads
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data; // Assuming the server returns { url: "path/to/file" }
    } catch (err) {
      console.error("File Upload Error:", err);
      setSnackbarContent({
        message: "Failed to upload image.",
        severity: "error",
      });
      setIsSnackbarOpen(true);
      throw err;
    }
  };

  if (isUserLoading || isRelatedDataLoading) {
    return (
      <Box className="profile__loading">
        <CircularProgress />
      </Box>
    );
  }

  if (isUserError) {
    return (
      <Box className="profile__error">
        <Typography variant="h6" color="error">
          Error: {userError.message}
        </Typography>
      </Box>
    );
  }

  if (isRelatedDataError) {
    return (
      <Box className="profile__error">
        <Typography variant="h6" color="error">
          Error fetching related data: {relatedDataError.message}
        </Typography>
      </Box>
    );
  }

  // wrong image file type for profile and cover pic 
  // Handle cover file change
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setCover(file);
    } else {
      setAlertOpen(true); // Show alert if file type is invalid
      setAlertMessage("Only .jpg and .png files are allowed for the cover picture.");
      setCover(null); // Clear the cover file state
      if (coverInputRef.current) coverInputRef.current.value = ""; // Reset the file input
    }
  };

  // Handle profile file change
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProfile(file);
    } else {
      setAlertOpen(true); // Show alert if file type is invalid
      setAlertMessage("Only .jpg and .png files are allowed for the profile picture.");
      setProfile(null); // Clear the profile file state
      if (profileInputRef.current) profileInputRef.current.value = ""; // Reset the file input
    }
  };

  
  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Box className="profile">
      {/* Cover and Profile Pictures */}
      <Box className="profile__header">
        <img
          src={
            user.coverPic
              ? `/upload/${user.coverPic}`
              : "/upload/empty-cover-picture.jpg" // Replace with default cover image path
          }
          alt="Cover"
          className="profile__cover"
        />
        <Avatar
          src={
            user.profilePic
              ? `/upload/${user.profilePic}` : "/upload/empty-profile-picture.jpg" // Replace with default profile image path
          }
          alt={user.name || "Profile Picture"}
          className="profile__avatar"
        />
      </Box>

      {/* Profile Information */}
      <Paper elevation={3} className="profile__info">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box className="profile__details">
              <Typography variant="h5" className="profile__name">
                {user.name || "Unknown User"}
              </Typography>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                className="profile__role"
              >
                {user.role || "No Role Assigned"}
              </Typography>
              <Box mt={2}>
                <Typography variant="body1" className="profile__item">
                  <strong>Email:</strong> {user.email || "N/A"}
                </Typography>
                <Typography variant="body1" className="profile__item">
                  <strong>Gender:</strong> {user.gender || "N/A"}
                </Typography>
                <Typography variant="body1" className="profile__item">
                  <strong>Date of Birth:</strong>{" "}
                  {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                </Typography>
                <Typography variant="body1" className="profile__item">
                  <strong>Phone:</strong> {user.phone || "N/A"}
                </Typography>
                <Typography variant="body1" className="profile__item">
                  <strong>Created On:</strong>{" "}
                  {new Date(user.created_on).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            container
            direction="column"
            alignItems="flex-end"
            justifyContent="center"
          >
            {userId === currentUser.id && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleOpenUpdateModal}
                className="profile__edit-button"
              >
                Update Profile
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Update Modal */}
      <Modal open={isUpdateModalOpen} onClose={handleCloseUpdateModal}>
        <Box className="profile__modal">
          <IconButton
            className="profile__modal-close"
            onClick={handleCloseUpdateModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" gutterBottom>
            Update Profile
          </Typography>
          <form onSubmit={handleUpdateSubmit} className="profile__form">
            {/* Cover Picture Upload */}
            <Box className="profile__form-group">
              <Typography variant="body1" gutterBottom>
                Cover Picture
              </Typography>
              <input
                type="file"
                accept="image/jpeg, image/png"
                name="coverPic"
                ref={coverInputRef} // Attach the ref here
                onChange={handleCoverChange}
                className="profile__input-file"
              />
            </Box>

            <Box className="profile__form-group">
              <Typography variant="body1" gutterBottom>
                Profile Picture
              </Typography>
              <input
                type="file"
                accept="image/jpeg, image/png"
                name="profilePic"
                ref={profileInputRef} // Attach the ref here
                onChange={handleProfileChange}
                className="profile__input-file"
              />
            </Box>


            {/* Snackbar for error alert */}
            <Snackbar open={alertOpen} autoHideDuration={3000} onClose={handleCloseAlert}>
              <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                {alertMessage}
              </Alert>
            </Snackbar>

            {/* Name */}
            <TextField
              label="Name"
              name="name"
              defaultValue={user.name || ""}
              fullWidth
              margin="normal"
              className="profile__text-field"
            />

            {/* Email */}
            <TextField
              label="Email"
              name="email"
              type="email"
              defaultValue={user.email || ""}
              fullWidth
              margin="normal"
              required
              className="profile__text-field"
              style={{ display: "none" }} // Hide the field
            />

            {/* Gender */}
            <FormControl fullWidth margin="normal" className="profile__form-control">
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                defaultValue={user.gender || ""}
                label="Gender"
                className="profile__select"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {relatedData.gender.map((g) => (
                  <MenuItem key={g.id} value={g.gender_name}>
                    {g.gender_name.charAt(0).toUpperCase() + g.gender_name.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date of Birth */}
            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              defaultValue={
                user.dob ? new Date(user.dob).toISOString().substr(0, 10) : ""
              }
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              className="profile__text-field"
            />

            {/* Phone Number */}
            <TextField
              label="Phone Number"
              name="phone"
              type="tel"
              defaultValue={user.phone || ""}
              fullWidth
              margin="normal"
              className="profile__text-field"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={updateMutation.isLoading}
              className="profile__submit-button"
            >
              {updateMutation.isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Snackbar Notifications */}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarContent.severity}
          sx={{ width: "100%" }}
        >
          {snackbarContent.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
