import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./createShoplisting.scss";

const CreateShopListing = ({ onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shoplistingRelatedData, setShoplistingRelatedData] = useState({
    shopTypes: [],
    servicesOffered: [],
    deliveryOptions: [],
    daysOfWeek: [],
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    img: "",
    location: "",
    postal_code: "",
    closed_on: [],
    date_established: "",
    license_number: "",
    services_offered: [],
    delivery_options: [],
    documents: [],
  });

  const [file, setFile] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const response = await makeRequest.get("/shoplistings/related-data");
        setShoplistingRelatedData(response.data);
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };
    fetchRelatedData();
  }, []);

  const handleCheckboxChange = (e, field) => {
    const { name, checked } = e.target;
    const newValues = [...formData[field]];

    if (checked) newValues.push(name);
    else newValues.splice(newValues.indexOf(name), 1);

    setFormData({ ...formData, [field]: newValues });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => makeRequest.post("/shoplistings/create", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["shoplistings"]);
      onClose();
      navigate("/owner/shoplisting");
    },
  });

  const uploadFiles = async (fileList) => {
    try {
      const formData = new FormData();
      fileList.forEach((file) => formData.append("files", file));
      const response = await makeRequest.post("/upload-documents", formData);
      return response.data;
    } catch (error) {
      console.error(`Error uploading the docoment:`, error);
      throw error;
    }
  };

  const uploadPhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await makeRequest.post('/upload', formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all documents are of the correct type before submission
    const areAllDocumentsValid = documents.every((doc) =>
      allowedDocumentTypes.includes(doc.type)
    );

    if (!areAllDocumentsValid) {
      alert("Only PDF files are allowed. Please remove invalid files.");
      return; // Prevent form submission
    }

    try {
      let uploadedImages = null;
      let uploadedDocuments = [];

      if (file) {
        uploadedImages = await uploadPhoto(file);
        console.log(uploadedImages);
      }
      if (documents.length) {
        console.log(documents);
        uploadedDocuments = await uploadFiles(documents);
      }

      const finalFormData = {
        ...formData,
        img: uploadedImages,
        documents: uploadedDocuments
      };

      mutation.mutate(finalFormData);
    } catch (error) {
      console.error("Error creating shop listing:", error);
    }
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }
  };
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const allowedDocumentTypes = [
    'application/pdf'
  ];

  const handleDocumentChange = (e) => {
    const selectedFiles = [...e.target.files];

    // Filter out files that do not match allowed types
    const validFiles = selectedFiles.filter((file) =>
      allowedDocumentTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files are not supported. Only PDF files are allowed.");
    }

    setDocuments(validFiles); // Only valid files are stored
  };


  return (
    <div className="modal-overlay2" onClick={onClose}>
      <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
        <h2>Create Shop Listing</h2>
        <form onSubmit={handleSubmit} className="shop-form">
          <div className="form-group">
            <label className="form-label">Shop Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
            />
            <small>{formData.name.length} / 100 characters</small>
          </div>
          

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={300}
            />
            <small>{formData.description.length} / 300 characters</small>
          </div>

          <div className="form-group">
            <label className="form-label">Photo</label>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <div className="image-preview-container">
              {previewUrl  && (
                <img
                  src={previewUrl }
                  alt="Preview"
                  className="image-preview"
                />
              )}
            </div>
          </div>


          <div className="form-group">
            <label className="form-label">Upload Verification Documents</label>
            <input type="file" multiple onChange={handleDocumentChange}
              accept=".pdf, .doc, .docx" />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select a type</option>
              {shoplistingRelatedData.shopTypes.map((shopType) => (
                <option key={shopType.id} value={shopType.type_name}>
                  {shopType.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Closed On</label>
            <div className="checkbox-group">
              {shoplistingRelatedData.daysOfWeek.map((day) => (
                <React.Fragment key={day.id}>
                  <input
                    type="checkbox"
                    id={day.day_name}
                    name={day.day_name}
                    checked={formData.closed_on.includes(day.day_name)}
                    onChange={(e) => handleCheckboxChange(e, "closed_on")}
                  />
                  <label htmlFor={day.day_name}>{day.day_name}</label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Services Offered</label>
            <div className="checkbox-group">
              {shoplistingRelatedData.servicesOffered.map((service) => (
                <React.Fragment key={service.id}>
                  <input
                    type="checkbox"
                    name={service.service_name}
                    id={service.service_name}
                    checked={formData.services_offered.includes(service.service_name)}
                    onChange={(e) =>
                      handleCheckboxChange(e, "services_offered")
                    }
                  />
                  <label htmlFor={service.service_name}>{service.service_name}</label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Options</label>
            <div className="checkbox-group">
              {shoplistingRelatedData.deliveryOptions.map((option) => (
                <React.Fragment key={option.id}>
                  <input
                    type="checkbox"
                    name={option.option_name}
                    id={option.option_name}
                    checked={formData.delivery_options.includes(option.option_name)}
                    onChange={(e) =>
                      handleCheckboxChange(e, "delivery_options")
                    }
                  />
                  <label htmlFor={option.option_name}>{option.option_name}</label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date Established</label>
            <input
              type="date"
              name="date_established"
              value={formData.date_established}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">License Number</label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              maxLength={20}
              required
            />
          </div>

          <div className="btnGroup">
            <button type="submit" className="createbutton">
              Create Shop
            </button>
            <button type="button" className="cancelbutton" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShopListing;
