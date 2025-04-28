import React, { useContext, useState, useEffect } from "react";
import "../createMenuItem/createMenuItem.scss";
import { AuthContext } from "../../../context/authContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import { CheckCircle, HighlightOff, Star, StarOutline } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const UpdateMenuItem = ({ onClose, item_id }) => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    dietary_restrictions: [],
  });

  const fetchMenuItemDetails = async () => {
    try {
      const response = await makeRequest.get(`shoplistings/menuitem?id=${item_id}`);
      const item = response.data[0];
      setFormData({
        name: item.name || "",
        desc: item.desc || "",
        img: item.img || "",
        category_id: item.category_id || "",
        usual_price: item.usual_price || "",
        discounted_rate: item.discounted_rate || 0,
        availability: item.availability,
        special: item.special,
        dietary_restrictions: item.dietary_restriction ? item.dietary_restriction.split(",") : [],
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItemDetails();
  }, [item_id]);

  const [file, setFile] = useState(null); // Handle file selection

  const uploadImage = async () => {
    if (!file) return formData.img; // Return existing image if no new file is selected
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await makeRequest.post("/upload", formData);
      return response.data; // Return uploaded image path
    } catch (err) {
      console.error("Error uploading file:", err);
      return formData.img; // Fall back to existing image if upload fails
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    setFile(e.target.files[0]); // Set the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imgUrl = await uploadImage(); // Upload image (if selected) and get the URL

    const finalFormData = { ...formData, img: imgUrl }; // Include image URL in the form data

    try {
      const response = await makeRequest.put(`/shoplistings/menuitem?item_id=${item_id}`, finalFormData);
      if (response.status === 200) {
        alert("Menu item updated successfully!");
        onClose(); // Close the modal after successful update
      }
    } catch (err) {
      console.error("Error updating menu item:", err);
      alert("Failed to update menu item.");
    }
  };

  if (loading) return <div>Loading menu item details...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="form-container">
      <h2>Update Menu Item</h2>
      <form onSubmit={handleSubmit} className="create-menu-item-form">
        <div className="form-group">
          <label>Item Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength={50} required/>
          <small>{formData.name.length} / 50 characters</small>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="desc" value={formData.desc} onChange={handleInputChange} maxLength={500} required  />
          <small>{formData.desc.length} / 200 characters</small>
        </div>

        <div className="form-group">
          <label>Image</label>
          <input type="file" onChange={handleFileChange} />
          {file && <img src={URL.createObjectURL(file)} alt="Selected" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
            <option value="">Select Category</option>
            {menuItemRelatedData.itemCategory.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Usual Price</label>
          <input type="number" name="usual_price" value={formData.usual_price} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Discounted Rate</label>
          <input type="number" name="discounted_rate" value={formData.discounted_rate} onChange={handleInputChange} />
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
          <label><strong>Dietary Restrictions</strong></label>
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
                <label htmlFor={restriction.restriction_name}>{restriction.restriction_name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="btnGroup">
          <button type="submit" className="addBtn">Update</button>
          <button type="button" className="cancelBtn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMenuItem;
