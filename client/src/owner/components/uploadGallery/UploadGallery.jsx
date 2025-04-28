import React, { useState, useContext } from "react";
import "./uploadGallery.scss";
import { AuthContext } from "../../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";

const UploadGallery = ({ onClose, shopId }) => {
  const { currentUser } = useContext(AuthContext);
  const [files, setFiles] = useState([]); // for multiple files
  const [uploading, setUploading] = useState(false);


  const upload = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file); // Append each file to the formData
      });
      const res = await makeRequest.post("/upload-multiple", formData);
      return res.data; // Return the uploaded image URLs
    } catch (err) {
      console.log(err);
    }
  };



  const mutation = useMutation({
    mutationFn: (newGalleries) => makeRequest.post("/shoplistings/gallery", newGalleries),
    onSuccess: () => {
      alert("Image uploaded successfully!");
      setUploading(false);
      onClose();
    },
    onError: (err) => {
      console.error("Error uploading image:", err);
      alert("Failed to upload image.");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imgUrls = [];
    if (files.length > 0) {
      imgUrls = await upload(); // Upload multiple files and get URLs
    }
    setUploading(true);
    mutation.mutate({ shopId, imgs: imgUrls }); // Save the post with multiple images
    setFiles([]); // Reset the file state
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setUploading(true); 

  //   let imgUrl = await uploadImage();

  //   if (imgUrl) {
  //     try {
  //       const response = await makeRequest.post("/shoplistings/gallery", {
  //         shopId,
  //         img: imgUrl, 
  //       });

  //       if (response.status === 200) {
  //         alert("Image uploaded successfully!");
  //         onClose(); 
  //       }
  //     } catch (err) {
  //       console.error("Error uploading image:", err);
  //       alert("Failed to upload image.");
  //     }
  //   }

  //   setUploading(false); 
  // };

  return (
    <div className="form-container">
      <h2>Upload Image</h2>
      <form onSubmit={handleSubmit} className="upload-gallery-form">
        <div className="form-group">
          <label>Image</label>
          <input
            type="file"
            id="file"
            multiple // Allow multiple file selection
            onChange={(e) => setFiles([...e.target.files])} // Use setFiles to handle multiple files
          />
          {files.length > 0 && (
            <div className="image-preview-container">
              {files.map((file, index) => (
                <img
                  key={index}
                  className="file"
                  alt={`Selected file ${index}`}
                  src={URL.createObjectURL(file)} // Preview each selected file
                />
              ))}
            </div>
          )}
        </div>
        <div className="btnGroup">
          <button type="submit" className="uploadBtn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button type="button" className="cancelBtn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadGallery;
