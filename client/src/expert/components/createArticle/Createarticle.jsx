import React, { useContext, useState } from "react";
import "./createArticle.scss";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const CreateArticle = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: topics,
    isLoading: loadingTopics,
    error: topicsError,
  } = useQuery({
    queryKey: ["articleTopics"],
    queryFn: () =>
      makeRequest.get("/articles/getTopics").then((res) => res.data),
    onError: (error) => console.error("Error fetching topics:", error),
  });

  const [formData, setFormData] = useState({
    topic: [],
    title: "",
    mainContext: "",
  });

  const [files, setFiles] = useState([]); // State to handle multiple files
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message

  // Upload multiple images
  const uploadImages = async () => {
    if (!files || files.length === 0) return []; // Ensure files is an array of selected files
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file)); // Append each file
      const response = await makeRequest.post("/upload-multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for handling file uploads
        },
      });
      return response.data; // Assume the server returns an array of URLs
    } catch (err) {
      console.error("Error uploading images:", err);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value, files: selectedFiles } = e.target;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter((file) => {
        const fileType = file.type;
        return (
          fileType.includes("jpeg") ||
          fileType.includes("jpg") ||
          fileType.includes("pdf")
        );
      });

      if (validFiles.length !== selectedFiles.length) {
        setErrorMsg("Only JPG and PDF files are allowed.");
      } else if (files.length + validFiles.length > 5) {
        setErrorMsg("You can upload a maximum of 5 images.");
      } else {
        setErrorMsg("");
        setFiles([...files, ...validFiles]); // Append new files to existing
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prevData) => {
      const newTopics = [...prevData.topic];

      if (checked) {
        if (newTopics.length >= 5) {
          alert("You can select a maximum of 5 topics.");
          return prevData;
        }
        newTopics.push(name);
      } else {
        // Remove unchecked topic
        const index = newTopics.indexOf(name);
        if (index > -1) newTopics.splice(index, 1);
      }

      return { ...prevData, topic: newTopics };
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const mutation = useMutation({
    mutationFn: (data) => makeRequest.post("/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["articles"]);
      setSnackbarMessage(
        "Article created successfully! 5 points added to your balance."
      ); // Set snackbar message
      setSnackbarOpen(true);
      setTimeout(() => navigate("/expert"), 8000);
      navigate("/expert");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim whitespace from title and mainContext to validate against empty input
    const trimmedTitle = formData.title.trim();
    const trimmedContent = formData.mainContext.trim();

    // Validation for title length, content length, and non-whitespace content
    if (trimmedTitle.length === 0) {
      setErrorMsg("Title cannot be empty or whitespace.");
      return;
    }
    if (trimmedTitle.length > 50) {
      setErrorMsg("Title must be no more than 50 characters.");
      return;
    }
    if (trimmedContent.length === 0) {
      setErrorMsg("Content cannot be empty or whitespace.");
      return;
    }
    if (trimmedContent.length < 200) {
      setErrorMsg("Content must be at least 200 characters.");
      return;
    }

    // Upload images first to get their URLs
    const imgUrls = await uploadImages();

    const finalFormData = {
      ...formData,
      title: trimmedTitle,
      mainContext: trimmedContent,
      img: imgUrls, // Pass the array of image URLs
    };

    try {
      await mutation.mutate(finalFormData);
      navigate("/expert");
    } catch (err) {
      console.error("Error creating article:", err);
    }
  };

  const handleCancel = () => {
    navigate("/expert");
  };

  return (
    <div className="createArticlePage">
      <div className="create-article-container">
        <h2>Create New Article</h2>
        <form onSubmit={handleSubmit} className="article-form">
          <div className="form-group">
            <label className="form-label">
              {" "}
              <b>Select Article Topics </b>
            </label>

            <div className="topicselection">
              {Array.isArray(topics) && topics.length > 0 ? (
                topics.map((topic, index) => (
                  <React.Fragment key={index}>
                    <input
                      type="checkbox"
                      name={topic.topic_name}
                      id={topic.topic_name}
                      className="topics"
                      checked={formData.topic.includes(topic.topic_name)}
                      onChange={handleCheckboxChange}
                      disabled={
                        !formData.topic.includes(topic.topic_name) &&
                        formData.topic.length >= 5
                      }
                    />
                    <label htmlFor={topic.topic_name}>{topic.topic_name}</label>
                  </React.Fragment>
                ))
              ) : loadingTopics ? (
                <p>Loading topics...</p>
              ) : (
                <p>No topics available</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {" "}
              <b>Article Title </b>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={50}
              required
            />
            <div className="char-count">{formData.title.length}/50</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {" "}
              <b>Article Main Context </b>
            </label>
            <textarea
              name="mainContext"
              value={formData.mainContext}
              onChange={handleChange}
              minLength={200}
              maxLength={10000}
              required
            ></textarea>
            <div className="char-count">
              {formData.mainContext.length}/10000 (min: 200)
            </div>
          </div>

          <div className="form-group-file">
            <label className="form-label">
              <b> Upload Images (Optional, max 5) </b>
            </label>
            <input
              type="file"
              name="imgs"
              accept=".jpg, .jpeg, .pdf"
              multiple
              onChange={handleChange}
            />
            {errorMsg && <p className="error-msg">{errorMsg}</p>}
            <div className="image-preview-container">
              {files.map((file, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected ${index + 1}`}
                    className="file-preview"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="createbuttons">
            <button type="submit" className="articlecreate">
              Submit
            </button>
            <button
              type="button"
              className="articlecancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={8000}
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

export default CreateArticle;
