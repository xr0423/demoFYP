import React, { useContext, useState } from "react";
import "./createMenuItem.scss";
import { AuthContext } from "../../../context/authContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import { CheckCircle, HighlightOff, Star, StarOutline } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const CreateMenuItem = ({ onClose, shopId }) => {
  const { currentUser } = useContext(AuthContext);
  const [menuItemRelatedData, setMenuItemRelatedData] = useState({
    itemCategory: [],
    dietaryRestriction: [],
  });

  const { data: relatedData, isLoading: isLoadingRelatedData } = useQuery({
    queryKey: ["relatedData"],
    queryFn: async () => {
      const response = await makeRequest.get(`shoplistings/menuitem/related-data`);
      setMenuItemRelatedData(response.data);
      return response.data;
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    img: "",
    category_id: "",
    usual_price: "",
    discounted_rate: 0,
    availability: true,
    special: false,
    shop_id: shopId || "",
    dietary_restrictions: [],
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const uploadImage = async () => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await makeRequest.post("/upload", formData);
      return response.data;
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "usual_price") {
      // Allow cents for usual_price
      let price = parseFloat(value);
      if (isNaN(price) || price < 0) {
        price = 0;
      }
      price = Math.round(price * 100) / 100; // Allow up to 2 decimal places

      setFormData((prevData) => ({
        ...prevData,
        [name]: price,
      }));
    } else if (name === "discounted_rate") {
      // Ensure discounted_rate is a non-negative whole number
      let rate = parseInt(value, 10);
      if (isNaN(rate) || rate < 0) {
        rate = 0;
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: rate,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => {
      const newDietaryRestrictions = [...prevData.dietary_restrictions];
      if (checked) {
        newDietaryRestrictions.push(name);
      } else {
        const index = newDietaryRestrictions.indexOf(name);
        newDietaryRestrictions.splice(index, 1);
      }
      return { ...prevData, dietary_restrictions: newDietaryRestrictions };
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const newErrors = {};
    if (!formData.category_id) {
      newErrors.category_id = "Category is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let imgUrl = "";
    if (file) {
      imgUrl = await uploadImage();
    }

    const finalFormData = { ...formData, img: imgUrl };

    try {
      const response = await makeRequest.post("/shoplistings/menuitem", finalFormData);
      if (response.status === 200) {
        alert("Menu item created successfully!");
        onClose();
      }
    } catch (err) {
      console.error("Error creating menu item:", err);
      alert("Failed to create menu item.");
    }
  };

  return (
    <div className="form-container">
      <h2>New Menu Item</h2>
      <form onSubmit={handleSubmit} className="create-menu-item-form">
        <div className="form-group">
          <label>Item Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            maxLength={99}
            required
          />
          <div className="char-count">{formData.name && formData.name.length} / 99 characters</div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="desc"
            value={formData.desc}
            onChange={handleInputChange}
            maxLength={300}
            required
          />
          <div className="char-count">{formData.name && formData.desc.length} / 300 characters</div>
        </div>

        <div className="image-form-group">
          <label>Image</label>
          <input type="file" onChange={handleFileChange} />
          {file && <img src={URL.createObjectURL(file)} alt="Selected" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {menuItemRelatedData.itemCategory.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
          {errors.category_id && <div className="error-message">{errors.category_id}</div>}
        </div>

        <div className="form-group">
          <label>Usual Price</label>
          <input
            type="number"
            name="usual_price"
            value={formData.usual_price}
            onChange={handleInputChange}
            min="1"
            max="1000"
            required
          />
        </div>

        <div className="form-group">
          <label>Discounted Rate</label>
          <input
            type="number"
            name="discounted_rate"
            value={formData.discounted_rate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label><strong>{formData.availability ? "Available" : "Unavailable"}</strong></label>
            <IconButton onClick={() => handleInputChange({ target: { name: "availability", value: !formData.availability } })}>
              {formData.availability ? <CheckCircle /> : <HighlightOff />}
            </IconButton>
          </div>

          <div className="form-group">
            <label><strong>{formData.special ? "Recommended Item" : "Normal Item"}</strong></label>
            <IconButton onClick={() => handleInputChange({ target: { name: "special", value: !formData.special } })}>
              {formData.special ? <Star /> : <StarOutline />}
            </IconButton>
          </div>
        </div>

        <div className="form-group">
          <label>Dietary Restrictions</label>
          <div className="checkbox-group">
            {menuItemRelatedData.dietaryRestriction.map((restriction) => (
              <div key={restriction.id} className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id={restriction.restriction_name}
                  name={restriction.restriction_name}
                  checked={formData.dietary_restrictions.includes(restriction.restriction_name)}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={restriction.restriction_name}>
                  {restriction.restriction_name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="btnGroup">
          <button type="submit" className="addBtn">
            Add
          </button>
          <button type="button" className="cancelBtn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMenuItem;
