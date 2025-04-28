import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeRequest } from '../../../axios';
import './createShopEvent.scss';
import SuccessPopup from '../PopupMessage/PopUpSuccess';

import MuiAlert from '@mui/material/Alert';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CreateEventForm = ({ onClose, shopEditable, defaultShopId }) => {
  // Initial state for eventData
  const initialEventData = {
    title: '',
    img: '',
    desc: '',
    start_datetime: '',
    end_datetime: '',
    price: '',
    capacity: '',
    type_id: '',
    shop_id: defaultShopId || '',
    exclusive: 'public',
    tnc: '',
  };

  const [eventData, setEventData] = useState(initialEventData);
  const [existingEvents, setExistingEvents] = useState([]);
  const [timeConflictError, setTimeConflictError] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [shops, setShops] = useState([]);
  const [error, setError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [key, setKey] = useState(0);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Fetch event types and shops on component mount
  useEffect(() => {
    const fetchTypesAndShops = async () => {
      try {
        const eventTypeResponse = await makeRequest.get('/events/related-data');
        setEventTypes(eventTypeResponse.data.eventTypes);
        setShops(eventTypeResponse.data.shops);
      } catch (err) {
        setError('Failed to load event types or shops');
      }
    };
    fetchTypesAndShops();
  }, []);

  // Fetch existing events for the selected shop
  useEffect(() => {
    const fetchExistingEvents = async () => {
      try {
        const response = await makeRequest.get(`/events?shopId=${defaultShopId}`);
        setExistingEvents(response.data);
      } catch (err) {
        setError('Failed to load existing events');
      }
    };
    if (defaultShopId) fetchExistingEvents();
  }, [defaultShopId]);

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (fileType === "image/jpeg" || fileType === "image/png") {
        setFile(selectedFile);
        setFileError(null);
      } else {
        setFile(null);
        setFileError("Only JPG and PNG formats are accepted.");
        setKey(prevKey => prevKey + 1);
      }
    }
  };

  // Image upload function
  const uploadImage = async () => {
    if (!file) return null;
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const response = await makeRequest.post("/upload", uploadFormData);
      return response.data;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent non-numeric and negative inputs for price and capacity
  if ((name === "price" || name === "capacity") && (isNaN(value) || value < 0)) {
    return; // Exit if non-numeric or negative
  }
    if (name === "title" && value.length > 20) return;
    if (name === "desc" && value.length > 100) return;
    if (name === "tnc" && value.length > 1000) return;

    setEventData({
      ...eventData,
      [name]: value,
    });

    if (name === "start_datetime" && new Date(value) >= new Date(eventData.end_datetime)) {
      setEventData((prev) => ({ ...prev, end_datetime: value }));
    } else if (name === "end_datetime" && new Date(value) <= new Date(eventData.start_datetime)) {
      alert("End Date & Time must be after the Start Date & Time");
      return;
    }
  };

  // Handle date and time changes and check for conflicts
  const handleDateTimeChange = (field, newValue) => {
    setEventData((prev) => ({ ...prev, [field]: newValue }));
    if (field === "start_datetime") {
      checkForTimeConflict(newValue, eventData.end_datetime);
    } else {
      checkForTimeConflict(eventData.start_datetime, newValue);
    }
  };

  // Check if the selected start and end times conflict with any existing events
  const checkForTimeConflict = (newStart, newEnd) => {
    if (!newStart || !newEnd) return;

    const newStartTime = new Date(newStart).getTime();
    const newEndTime = new Date(newEnd).getTime();

    const hasConflict = existingEvents.some((event) => {
      const existingStartTime = new Date(event.start_datetime).getTime();
      const existingEndTime = new Date(event.end_datetime).getTime();
      return (
        (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
        (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
      );
    });

    setTimeConflictError(hasConflict ? 'The selected times conflict with an existing event.' : null);
  };

  // Handle checkbox toggle for exclusivity
  const handleCheckboxChange = (e) => {
    setEventData((prev) => ({
      ...prev,
      exclusive: e.target.checked ? "exclusive" : "public",
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (timeConflictError) {
      alert("Please resolve the time conflict before creating the event.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to create this event?");
    if (!isConfirmed) return;

    let imgUrl = "";
    if (file) {
      imgUrl = await uploadImage();
    } else {
      imgUrl = 'default-empty.jpg';
    }

    const finalEventData = { ...eventData, img: imgUrl, shop_id: defaultShopId };

    try {
      console.log("Submitting event data:", finalEventData);

      const response = await makeRequest.post('/events', finalEventData);

      if (response.status === 200) {
        setShowSuccessPopup(true);
        setEventData(initialEventData); // Clear form fields
        setFile(null); // Clear file input
      } else {
        setError('Failed to create event');
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('Validation failed: Please ensure all requried inputs are filled and valid.');
      } else if (err.response && err.response.status === 409) {
        setError('Event creation failed due to a conflict. Please check the times.');
      } else {
        setError('Validation failed: Please ensure all inputs are valid.');
      }
    }
  };

  // Handle success popup close
  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  return (
    <div className="createEventForm">
      <h2>Add New Event</h2>
      
      <label htmlFor="title">Event Title</label>
      <input
        type="text"
        id="title"
        name="title"
        value={eventData.title}
        onChange={handleInputChange}
        placeholder="Event Title"
        maxLength={20}
        required
      />
      <div className="character-counter">{eventData.title.length}/20</div>

      <label htmlFor="img">Upload Image</label>
      <div key={key}>
        <input
          type="file"
          id="img"
          name="img"
          accept="image/*"
          onChange={handleFileChange}
        />
        {fileError && <div className="error-message">{fileError}</div>}
        {file && <img src={URL.createObjectURL(file)} alt="Selected" className="image-preview" />}
      </div>
      <label htmlFor="desc">Event Description</label>
      <textarea
        id="desc"
        name="desc"
        value={eventData.desc}
        onChange={handleInputChange}
        placeholder="Event Description"
        maxLength={100}
        required
      />
      <div className="character-counter">{eventData.desc.length}/100</div>

      {/* Start and End DateTime */}
      <div className="input-group">
        <div className="half-width">
          <label htmlFor="start_datetime">Start Date & Time</label>
          <input
            type="datetime-local"
            id="start_datetime"
            name="start_datetime"
            value={eventData.start_datetime}
            onChange={handleInputChange}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="half-width">
          <label htmlFor="end_datetime">End Date & Time</label>
          <input
            type="datetime-local"
            id="end_datetime"
            name="end_datetime"
            value={eventData.end_datetime}
            onChange={handleInputChange}
            min={eventData.start_datetime}
          />
        </div>
      </div>

      <div className="input-group">
        <div className="half-width">
          <label htmlFor="price">Event Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={eventData.price}
            onChange={handleInputChange}
            placeholder="Event Price"
            min="0" // Prevents negative values
            required
          />
        </div>

        <div className="half-width">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={eventData.capacity}
            onChange={handleInputChange}
            placeholder="Capacity"
            min="0" // Prevents negative values
            required
          />
        </div>
      </div>


      <label htmlFor="type_id">Event Type</label>
      <select
        id="type_id"
        name="type_id"
        value={eventData.type_id}
        onChange={handleInputChange}
        required
      >
        <option value="">Select Event Type</option>
        {eventTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.type_name}
          </option>
        ))}
      </select>

      <label htmlFor="exclusive">
        <input
          type="checkbox"
          id="exclusive"
          name="exclusive"
          checked={eventData.exclusive === "exclusive"}
          onChange={handleCheckboxChange}
        />
        Exclusive Event
      </label>

      <label htmlFor="tnc">Terms and Conditions</label>
      <textarea
        id="tnc"
        name="tnc"
        value={eventData.tnc}
        onChange={handleInputChange}
        placeholder="Terms and Conditions"
        maxLength={1000}
        required
      />
      <div className="character-counter">{eventData.tnc.length}/1000</div>

      {shopEditable ? (
        <div>
          <label htmlFor="shop_id">Shop</label>
          <select name="shop_id" value={eventData.shop_id} onChange={handleInputChange}>
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.shop_id} value={shop.shop_id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="shop-name">
          <strong>Shop:</strong> {shops.find(shop => shop.shop_id === defaultShopId)?.name || 'N/A'}
        </div>
      )}

      <button onClick={handleSubmit}>Create</button>
      <button className="cancel" onClick={onClose}>Cancel</button>

      {showSuccessPopup && (
        <SuccessPopup message="Event created successfully!" onClose={handlePopupClose} />
      )}

      {error && <div className="error-bottom">{error}</div>}

    </div>
  );
};

export default CreateEventForm;
