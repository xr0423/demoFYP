import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { Close, Save, Add, Delete, SettingsAccessibilityOutlined, SettingsBluetooth } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../../axios";
import "./variable-modal.scss"; // Ensure you have appropriate styles

const VariableModal = ({
  open,
  handleClose,
  modalConfig,
  relatedData,
  setSnackbar,
}) => {
  const { title, variableType, item, category } = modalConfig;
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({});
  const [imagePreview, setImagePreview] = useState(null); // For image preview 
  const [newImage, setNewImage] = useState(null);
  const [jsonFields, setJsonFields] = useState([]); // For managing JSON features
  const [hasJson, setHasJson] = useState(false); // For managing
  const [num, setNum] = useState(0);

  const TableNameKey = [
    // =====================
    // Users Related Variables
    // =====================
    {
      variable: "User Types",
      tableName: "UserType",
      pk: "id",
      properties: "update only",
      restriction: "type_name",
      fields: [
        { name: "type_name", label: "Type Name", type: "text", required: true },
        { name: "type_full_name", label: "Type Full Name", type: "text", required: true }
      ],
    },
    {
      variable: "Gender",
      tableName: "Gender",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "gender_name", label: "Gender Name", type: "text", required: true },
      ],
    },
    {
      variable: "Subscription",
      tableName: "Subscription",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "subscription_name", label: "Subscription Name", type: "text", required: true },
        { name: "user_type_id", label: "User Type", type: "select", required: true },
        { name: "subscription_point", label: "Subscription Point", type: "int", required: false },
        { name: "price", label: "Price", type: "decimal", required: true },
        { name: "features", label: "Features", type: "json", required: true },
      ],
    },
    {
      variable: "Coffee Beans",
      tableName: "CoffeeBeans",
      pk: "bean_id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "bean_name", label: "Bean Name", type: "text", required: true },
        { name: "origin", label: "Origin", type: "text", required: true },
      ],
    },
    {
      variable: "Brewing Methods",
      tableName: "BrewingMethods",
      pk: "method_id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "method_name", label: "Method Name", type: "text", required: true },
      ],
    },
    {
      variable: "Coffee Types",
      tableName: "CoffeeTypes",
      pk: "type_id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "type_name", label: "Type Name", type: "text", required: true },
      ],
    },
    {
      variable: "Allergies",
      tableName: "Allergies",
      pk: "allergy_id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "allergy_name", label: "Allergy Name", type: "text", required: true },
      ],
    },
    {
      variable: "Tags",
      tableName: "Tags",
      pk: "tag_id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "tag_name", label: "Tag Name", type: "text", required: true },
      ],
    },


    {
      variable: "Post Category",
      tableName: "PostCategory",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "name", label: "Category Name", type: "text", required: true },
        { name: "type", label: "User Type", type: "userTypeName", required: true },
      ],
    },

    // =====================
    // Shop Owner Related Variables
    // =====================
    {
      variable: "Job Title",
      tableName: "JobTitle",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "title_name", label: "Job Title", type: "text", required: true },
      ],
    },

    // =====================
    // Shop Listing Related Variables
    // =====================
    {
      variable: "Shop Type",
      tableName: "ShopType",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "type_name", label: "Shop Type", type: "text", required: true },
      ],
    },
    {
      variable: "Service Offered",
      tableName: "ServiceOffered",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "service_name", label: "Service Name", type: "text", required: true },
      ],
    },
    {
      variable: "Social Media",
      tableName: "SocialMedia",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "platform_name", label: "Platform Name", type: "text", required: true },
        { name: "url", label: "URL", type: "url", required: true },
      ],
    },
    {
      variable: "Delivery Option",
      tableName: "DeliveryOption",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "option_name", label: "Delivery Option", type: "text", required: true },
      ],
    },
    {
      variable: "Day Of Week",
      tableName: "DayOfWeek",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "day_name", label: "Day Name", type: "text", required: true },
      ],
    },

    // =====================
    // Event Related Variables
    // =====================
    {
      variable: "Event Type",
      tableName: "EventType",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "type_name", label: "Event Type", type: "text", required: true },
      ],
    },

    // =====================
    // Menu Item Related Variables
    // =====================
    {
      variable: "Menu Item Category",
      tableName: "MenuItemCategory",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "category_name", label: "Category Name", type: "text", required: true },
      ],
    },
    {
      variable: "Dietary Restriction",
      tableName: "DietaryRestriction",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "restriction_name", label: "Dietary Restriction", type: "text", required: true },
      ],
    },

    // =====================
    // Expert Related Variables
    // =====================
    {
      variable: "Specialization",
      tableName: "Specialization",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "specialization_name", label: "Specialization Name", type: "text", required: true },
      ],
    },
    // =====================
    // Articles Related Variables
    // =====================
    {
      variable: "Article Topic",
      tableName: "ArticleTopic",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "topic_name", label: "Topic Name", type: "text", required: true },
      ]
    },

    // =====================
    // Contact Us Related Variables
    // =====================
    {
      variable: "Contact Subjects",
      tableName: "contactus_subjects",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "subject_name", label: "Subject Name", type: "text", required: true },
      ],
    },
    {
      variable: "Contact Subjects Options",
      tableName: "contactus_subjects_options",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "option_name", label: "Option Name", type: "text", required: true },
        { name: "subject_id", label: "Contact Subject", type: "select", required: true },
      ],
    },

    // =====================
    // Platform Features Related Variables
    // =====================
    {
      variable: "Platform Features",
      tableName: "PlatformFeatures",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "feature_name", label: "Feature Name", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "feature_image", label: "Feature Image", type: "img", required: true },
      ],
    },
    {
      variable: "Role Feature",
      tableName: "RoleFeature",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "user_type_id", label: "User Type", type: "select", required: true },
        { name: "feature_id", label: "Feature", type: "select", required: true }
      ]
    },
    // Reviews related variables
    {
      variable: "Review Category",
      tableName: "reviewcategory",
      pk: "id",
      properties: "full access",
      restriction: null,
      fields: [
        { name: "category_name", label: "Category Name", type: "text", required: true },
      ]
    },
  ]

  // Function to handle file uploads
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.error("File Upload Error:", err);
      setSnackbar({
        open: true,
        message: "Failed to upload image.",
        severity: "error",
      });
      throw err;
    }
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    setNewImage(null);
    if (formValues.feature_image) {
      formValues.feature_image = null;
      // try delete image here
    }
  }

  // Initialize form values
  useEffect(() => {
    if (item) {
      const imageField = currentTable?.fields.find(field => field.type === "img");
      const jsonField = currentTable?.fields.find(field => field.type === "json");
      if (variableType === 'Contact Subjects Options') {
        // Remove subject_name from item to prevent sending it back to the backend
        const { subject_name, ...rest } = item;
        setFormValues(rest);
      } else if (imageField && item[imageField.name]) {
        setImagePreview(`/upload/${item[imageField.name]}`); // Assuming the backend returns the image 
        setFormValues(item);
      } else if (variableType === 'Subscription') {
        const { type_name, ...rest } = item;
        setFormValues(rest);
        if (jsonField) {
          setHasJson(true);
          const jsonString = item.features || [];
          setJsonFields(jsonString);
        }
      } else if (variableType === 'Role Feature') {
        const { type_full_name, feature_name, ...rest } = item;
        setFormValues(rest);
      } else {
        setFormValues(item);
      }
    } else {
      setFormValues({});
      setImagePreview(null);
      setJsonFields([]);
    }
  }, [item]);

  // Determine the primary key field based on variableType
  const getPrimaryKey = () => {
    const mapping = TableNameKey.find((entry) => entry.variable === variableType);
    return mapping ? mapping.pk : "id";
  };

  const primaryKey = getPrimaryKey();
  const currentTable = TableNameKey.find((entry) => entry.variable === variableType);

  // Mutation for adding or updating a variable
  const mutation = useMutation({
    mutationFn: (payload) => {
      const tableMapping = TableNameKey.find((entry) => entry.variable === variableType);
      if (!tableMapping)
        throw new Error(`Table mapping not found for variable type: ${variableType}`);


      if (item) {
        const id = payload[primaryKey];
        // Exclude the primary key from the payload to avoid redundancy
        const { [primaryKey]: _, ...updatePayload } = payload;
        // Update
        console.log(payload);

        return makeRequest
          .put(`/admin/variables?variableType=${variableType}&key=${id}`, updatePayload)
          .then((res) => res.data);
      } else {
        // Create
        return makeRequest
          .post(`/admin/variables?variableType=${variableType}`, payload)
          .then((res) => res.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variableControlData"]);
      setSnackbar({
        open: true,
        message: item
          ? `${variableType} updated successfully.`
          : `${variableType} added successfully.`,
        severity: "success",
      });
      handleClose();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      setSnackbar({
        open: true,
        message: `Failed to ${item ? "update" : "add"} ${variableType}. ${error.message}`,
        severity: "error",
      });
    },
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newImage) {
      // upload image here
      const imgUrl = await uploadFile(newImage);
      formValues.feature_image = imgUrl;
    }

    if (hasJson) {
      formValues.features = JSON.stringify(jsonFields);
    }


    console.log(formValues);
    mutation.mutate(formValues);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;


    // If the field is an image, handle the file input
    if (e.target.type === "file") {
      const file = files[0];
      if (file) {
        // Set image preview
        setNewImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.type === "number") {
      console.log("values: " + value)
      if (value === "") {
        setFormValues((prev) => ({
          ...prev,
          [name]: 0,
        }));
      } else {
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    else {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle changes to JSON fields
  const handleJsonFieldChange = (index, value) => {
    const updatedFields = [...jsonFields];
    updatedFields[index] = value;
    setJsonFields(updatedFields);
  };

  // Add a new JSON field
  const addJsonField = () => {
    setJsonFields((prev) => [...prev, ""]);
  };

  // Remove a JSON field
  const removeJsonField = (index) => {
    setJsonFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Render form fields based on the fields configuration
  const renderFormFields = () => {
    if (!currentTable) return null;

    return currentTable.fields.map((field) => {
      const { name, label, type, required } = field;
      const value = formValues[name] || "";
      const isDisabled = currentTable.restriction
        ? currentTable.restriction.includes(name)
        : false;

      if (type === "select") {
        // Determine options based on the field name
        let options = [];
        if (name === "subject_id") {
          options = relatedData['contactUs']?.['Contact Subjects']?.data || [];
        }
        if (name === "user_type_id") {
          options = relatedData['users']?.['User Types']?.data || [];
        }

        if (name === "feature_id") {
          options = relatedData['platformFeatures']?.['Platform Features Options']?.data || [];
        }

        return (
          <TextField
            key={name}
            select
            label={label}
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required={required}
            className="variable-control__text-field"
            disabled={isDisabled}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.subject_name || option.name || option.option_name || option.type_full_name || 'N/A'}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      if (type === 'userTypeName') {
        const options = [{ name: 'regular', type_full_name: 'regular user' }, { name: 'owner', type_full_name: 'shop owner' }]
        return (
          <TextField
            key={name}
            select
            label={label}
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required={required}
            className="variable-control__text-field"
            disabled={isDisabled}
          >
            {
              options.map((option) => (
                <MenuItem key={option.name} value={option.name}>
                  {option.type_full_name || 'N/A'}
                </MenuItem>
              ))
            }
          </TextField>
        )

      }

      if (type === "img") {
        return (
          <Box key={name} className="variable-control__image-field" marginY={2}>
            <Typography variant="body1" gutterBottom>
              {label}
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id={`upload-${name}`}
              type="file"
              name={name}
              onChange={handleChange}
              disabled={isDisabled}
            />
            <label htmlFor={`upload-${name}`}>
              <Button variant="contained" color="primary" component="span">
                Upload {label}
              </Button>
            </label>
            {imagePreview && (
              <Button variant="contained" color="primary" onClick={handleDeleteImage}>Delete</Button>
            )}
            {imagePreview && (
              <Box mt={2}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </Box>
            )}
          </Box>
        );
      }
      if (type === 'decimal') {
        return (
          <TextField
            key={name}
            label={label}
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required={required}
            className="variable-control__text-field"
            disabled={isDisabled}
            type="number"
            inputProps={{
              step: "0.01", // Defines the granularity of the value
              min: "0",      // Minimum value
              max: "500",    // Maximum value
            }}
          />
        )
      }

      if (type === 'int') {
        return (
          <TextField
            key={name}
            label={label}
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required={required}
            className="variable-control__text-field"
            disabled={isDisabled}
            type="number"
            inputProps={{
              min: "0",      // Minimum value
              max: "500",    // Maximum value
            }}
          />
        )
      }

      if (type === "json") {
        return (
          <Box key={name} className="variable-control__json-field" marginY={2}>
            <Typography variant="body1" gutterBottom>
              {label}
            </Typography>
            {jsonFields.map((fieldValue, index) => (
              <Box key={index} display="flex" alignItems="center" marginBottom={1}>
                <TextField
                  value={fieldValue}
                  onChange={(e) => handleJsonFieldChange(index, e.target.value)}
                  fullWidth
                  margin="normal"
                  className="variable-control__text-field"
                />
                <IconButton onClick={() => removeJsonField(index)} aria-label="delete">
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" color="primary" onClick={addJsonField} startIcon={<Add />}>
              Add Feature
            </Button>
          </Box>
        );
      }

      return (
        <TextField
          key={name}
          label={label}
          name={name}
          value={value}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required={required}
          className="variable-control__text-field"
          disabled={isDisabled}
        />
      );
    });
  };

  return (
    <Box className="variable-control__modal" display={open ? "flex" : "none"}>
      <Box className="variable-control__modal-content">
        <IconButton
          className="variable-control__modal-close"
          onClick={handleClose}
          aria-label="close"
        >
          <Close />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <form onSubmit={handleSubmit} className="variable-control__form">
          {/* Render form fields based on the configuration */}
          {renderFormFields()}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={mutation.isLoading}
            className="variable-control__submit-button"
          >
            {mutation.isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Save />
            )}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default VariableModal;