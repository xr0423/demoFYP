import React, { useContext, useState, useEffect } from "react";
import "./updateShoplistingForm.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const UpdateShopListingForm = ({ onClose, id }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = parseInt(location.pathname.split("/")[4]);
  const queryClient = useQueryClient();

  const [isLoadingShopData, setIsLoadingShopData] = useState(true);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type_id: "",
    img: "",
    location: "",
    postal_code: "",
    closed_on: [],
    date_established: "",
    license_number: "",
    services_offered: [],
    delivery_options: [],
    photo: "",
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch related data for form fields
  const { data: relatedData, isLoading: isLoadingRelatedData } = useQuery({
    queryKey: ["relatedData"],
    queryFn: async () => {
      const response = await makeRequest.get("/shoplistings/related-data");
      return response.data;
    },
  });

  // Fetch shop listing details
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [relatedDataResponse, shopDataResponse] = await Promise.all([
          makeRequest.get("/shoplistings/related-data"),
          makeRequest.get(`/shoplistings/find/${id}`)
        ]);

        const relatedData = relatedDataResponse.data;
        const { shopData, servicesOffered, deliveryOptions, closedDays } = shopDataResponse.data;

        const matchedType = relatedData?.shopTypes.find(
          (type) => type.id === shopData.type_id
        );

        setFormData({
          name: shopData.name || "",
          description: shopData.description || "",
          type: matchedType ? matchedType.type_name : "",
          img: shopData.img || "",
          location: shopData.location || "",
          postal_code: shopData.postal_code || "",
          closed_on: closedDays || [],
          date_established: shopData.date_established
            ? new Date(shopData.date_established).toISOString().split("T")[0]
            : "",
          license_number: shopData.license_number || "",
          services_offered: servicesOffered || [],
          delivery_options: deliveryOptions || [],
          photo: shopData.img || "",
        });

        setPreviewUrl(`/upload/${shopData.img}`);
        setIsLoadingShopData(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoadingShopData(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleCheckboxChange = (e, field) => {
    const { name, checked } = e.target;
    const newValues = [...formData[field]];

    if (checked) {
      newValues.push(name);
    } else {
      const index = newValues.indexOf(name);
      newValues.splice(index, 1);
    }

    setFormData({ ...formData, [field]: newValues });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData({ ...formData, photo: selectedFile });
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

  const updateShopListingMutation = useMutation({
    mutationFn: (data) => makeRequest.put(`/shoplistings/update/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["shoplistings"]);
      alert("Shop listing updated successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Error updating shop listing:", error);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedImage = formData.photo;

      if (file) {
        const imageFormData = new FormData();
        imageFormData.append("file", file);
        const imageResponse = await makeRequest.post("/upload", imageFormData);
        uploadedImage = imageResponse.data;
      }

      const finalFormData = {
        ...formData,
        photo: uploadedImage,
        closed_on: formData.closed_on || [],
        services_offered: formData.services_offered || [],
        delivery_options: formData.delivery_options || [],
        owner_id: currentUser.id,
      };

      updateShopListingMutation.mutate(finalFormData);
    } catch (error) {
      console.error("Error updating shop listing:", error);
    }
  };

  if (isLoadingShopData || isLoadingRelatedData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="modal-overlay2" onClick={onClose}>
      <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
        <h2>Update Shop Listing</h2>
        <form onSubmit={handleSubmit} className="shop-form">
          {status !== "pending" && (
            <>
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
                  maxLength={300}
                  required
                />
                <small>{formData.description.length} / 300 characters</small>
              </div>

              <div className="form-group">
                <label className="form-label">Photo</label>
                <input type="file" name="photo" onChange={handleFileChange} />
                {previewUrl && (
                  <img src={previewUrl} alt="Selected" className="image-preview" />
                )}
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
                  {relatedData?.shopTypes.map((shopType) => (
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
                  maxLength={30}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Closed On</label>
                <div className="checkbox-group">
                  {relatedData?.daysOfWeek.map((day) => (
                    <React.Fragment key={day.id}>
                      <input
                        type="checkbox"
                        name={day.day_name}
                        id={day.day_name}
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
                  {relatedData?.servicesOffered.map((service) => (
                    <React.Fragment key={service.id}>
                      <input
                        type="checkbox"
                        name={service.service_name}
                        id={service.service_name}
                        checked={formData.services_offered.includes(service.service_name)}
                        onChange={(e) => handleCheckboxChange(e, "services_offered")}
                      />
                      <label htmlFor={service.service_name}>{service.service_name}</label>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Options</label>
                <div className="checkbox-group">
                  {relatedData?.deliveryOptions.map((option) => (
                    <React.Fragment key={option.id}>
                      <input
                        type="checkbox"
                        name={option.option_name}
                        id={option.option_name}
                        checked={formData.delivery_options.includes(option.option_name)}
                        onChange={(e) => handleCheckboxChange(e, "delivery_options")}
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
                  maxLength={30}
                  required
                />
              </div>
            </>
          )}

          <div className="btnGroup">
            <button type="submit" className="updatebutton">
              Update Shop
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

export default UpdateShopListingForm;
