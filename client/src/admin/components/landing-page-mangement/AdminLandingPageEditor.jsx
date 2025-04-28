import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Save, Cancel, PhotoCamera } from "@mui/icons-material";
import { makeRequest } from "../../../axios"; // Adjust path as needed

const AdminLandingPageEditor = () => {
  const [sectionName, setSectionName] = useState("home");
  const [contentItems, setContentItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({
    content_order: "",
    heading: "",
    content: "",
    section_name: sectionName,
  });
  const [openModal, setOpenModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundExists, setBackgroundExists] = useState(false);

  useEffect(() => {
    const checkBackgroundImage = () => {
      const img = new Image();
      img.src = `/landing-content/home-background.jpg`; // Define the image path

      // If image loads, set backgroundExists to true
      img.onload = () => setBackgroundExists(true);

      // If image fails to load, set backgroundExists to false
      img.onerror = () => setBackgroundExists(false);
    };

    checkBackgroundImage();
  }, []);

  // Fetch content items when sectionName changes
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await makeRequest.get(
          `/admin/landing?section_name=${sectionName}`
        );
        setContentItems(res.data);
      } catch (error) {
        console.error("Error fetching content:", error);
        setSnackbar({
          open: true,
          message: "Error fetching content",
          severity: "error",
        });
      }
    };
    fetchContent();
  }, [sectionName]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormValues(item);
    setOpenModal(true);
  };

  // Handle add new content button click
  const handleAddNew = () => {
    setEditingItem(null);
    setFormValues({
      content_order: "",
      heading: "",
      content: "",
      section_name: sectionName,
    });
    setOpenModal(true);
  };

  // Handle cancel button click
  const handleCancel = () => {
    setEditingItem(null);
    setFormValues({
      content_order: "",
      heading: "",
      content: "",
      section_name: sectionName,
    });
    setOpenModal(false);
  };

  // Handle save button click
  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        await makeRequest.put(`/admin/landing/${editingItem.id}`, formValues);
        setSnackbar({
          open: true,
          message: "Content updated successfully",
          severity: "success",
        });
      } else {
        // Create new item
        await makeRequest.post("/admin/landing", formValues);
        setSnackbar({
          open: true,
          message: "Content added successfully",
          severity: "success",
        });
      }
      // Refresh content items
      const res = await makeRequest.get(
        `/admin/landing?section_name=${sectionName}`
      );
      setContentItems(res.data);
      handleCancel();
    } catch (error) {
      console.error("Error saving content:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving content",
        severity: "error",
      });
    }
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this content item?")) {
      try {
        await makeRequest.delete(`/admin/landing/${id}`);
        setSnackbar({
          open: true,
          message: "Content deleted successfully",
          severity: "success",
        });
        // Refresh content items
        const res = await makeRequest.get(
          `/admin/landing?section_name=${sectionName}`
        );
        setContentItems(res.data);
      } catch (error) {
        console.error("Error deleting content:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Error deleting content",
          severity: "error",
        });
      }
    }
  };

  // Handle image file selection for Home background
  const handleFileChange = (e) => {
    setBackgroundFile(e.target.files[0]);
  };

  // Handle background image upload
  const handleBackgroundUpload = async () => {
    if (backgroundFile) {
      const formData = new FormData();
      formData.append("home-background", backgroundFile);
      try {
        await makeRequest.post("/upload-home-background", formData);
        setSnackbar({
          open: true,
          message: "Background image uploaded successfully",
          severity: "success",
        });
        setBackgroundFile(null); // Clear the selected file after upload
      } catch (error) {
        console.error("Error uploading background image:", error);
        setSnackbar({
          open: true,
          message: "Error uploading background image",
          severity: "error",
        });
      }
    }
  };

  // Handle background image deletion
  const handleBackgroundDelete = async () => {
    try {
      await makeRequest.delete("/delete-home-background");
      setSnackbar({
        open: true,
        message: "Background image deleted successfully",
        severity: "success",
      });
      setBackgroundExists(false);
    } catch (error) {
      console.error("Error deleting background image:", error);
      setSnackbar({
        open: true,
        message: "Error deleting background image",
        severity: "error",
      });
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Edit Landing Page Content
      </Typography>

      {/* Background Image Preview and Options */}
      {sectionName === "home" && (
      <Box mb={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Home Background Image
        </Typography>

        {backgroundExists ? (
          <>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={2}
            >
              <img
                src="/landing-content/home-background.jpg"
                alt="Home Background"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  marginBottom: "16px",
                }}
              />
              <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleBackgroundDelete}
                >
                  Delete Background
                </Button>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  startIcon={<PhotoCamera />}
                >
                  Replace Background
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {backgroundFile && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleBackgroundUpload}
                  >
                    Upload
                  </Button>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box textAlign="center">
            <Typography color="textSecondary" mb={2}>
              No background image uploaded
            </Typography>
            <Button
              variant="contained"
              component="label"
              color="primary"
              startIcon={<PhotoCamera />}
            >
              Add Background
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {backgroundFile && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBackgroundUpload}
                style={{ marginLeft: "10px" }}
              >
                Upload
              </Button>
            )}
          </Box>
        )}
      </Box>
        
      )}

      {/* Section Selector */}
      <Select
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        variant="outlined"
        style={{ marginBottom: "20px" }}
      >
        <MenuItem value="home">Home</MenuItem>
        <MenuItem value="aboutus">About Us</MenuItem>
      </Select>

      {/* Content Editor Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Content Order</TableCell>
            <TableCell>Heading</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Section</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.content_order}</TableCell>
              <TableCell>{item.heading}</TableCell>
              <TableCell>{item.content}</TableCell>
              <TableCell>{item.section_name}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(item)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)} color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddNew}
        style={{ marginTop: "20px" }}
      >
        Add New Content
      </Button>

      {/* Edit/Add Modal */}
      <Dialog open={openModal} onClose={handleCancel}>
        <DialogTitle>
          {editingItem ? "Edit Content" : "Add New Content"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Content Order"
            name="content_order"
            value={formValues.content_order}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Heading"
            name="heading"
            value={formValues.heading}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            name="content"
            value={formValues.content}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          {/* Section Selector in Modal */}
          <Select
            label="Section Name"
            name="section_name"
            value={formValues.section_name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="home">Home</MenuItem>
            <MenuItem value="aboutus">About Us</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<Save />}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLandingPageEditor;
