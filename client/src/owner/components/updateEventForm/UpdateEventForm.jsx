import React, { useEffect, useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { makeRequest } from "../../../axios";
import "./updateEventForm.scss"; // Add styling if needed
import SuccessPopup from '../PopupMessage/PopUpSuccess';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const UpdateEventForm = ({ eventId, onClose }) => {
  // Initialize state variables
  const [eventData, setEventData] = useState({
    title: "",
    img: "",
    desc: "",
    start_datetime: "",
    end_datetime: "",
    price: "",
    capacity: "",
    type_id: "",
    shop_name: "",
    exclusive: "public",
    tnc: ""
  });

  const [key, setKey] = useState(0);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);
  const [timeConflictError, setTimeConflictError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Fetch data and handle file changes
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await makeRequest.get(`/events?id=${eventId}`);
        const event = response.data;
        setEventData({
          title: event.title,
          img: event.img,
          desc: event.description,
          start_datetime: new Date(event.start),
          end_datetime: new Date(event.end),
          price: event.price,
          capacity: event.capacity,
          type_id: event.type_id,
          shop_name: event.shop_name,
          exclusive: event.exclusive || "public",
          tnc: event.tnc
        });

        const existingEventsResponse = await makeRequest.get(`/events?shopId=${event.shop_id}`);
        setExistingEvents(existingEventsResponse.data.filter(evt => evt.id !== eventId));
        setLoading(false);
      } catch (err) {
        setError("Failed to load event details: " + err.message);
        setLoading(false);
      }
    };

    const fetchEventTypes = async () => {
      try {
        const response = await makeRequest.get("/events/related-data");
        setEventTypes(response.data.eventTypes);
      } catch (err) {
        setError("Failed to load event types");
      }
    };

    fetchEventDetails();
    fetchEventTypes();
  }, [eventId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileType = selectedFile.type;
    if (fileType === "image/jpeg" || fileType === "image/png") {
      setFile(selectedFile);
      setFileError(null);
    } else {
      setFile(null);
      setFileError("Only JPG and PNG formats are accepted.");
      setKey(prevKey => prevKey + 1); // Change the key to re-render component
    }
  };

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

  const handleDateTimeChange = (field, newValue) => {
    setEventData((prev) => ({ ...prev, [field]: newValue }));
    if (field === "start_datetime") {
      checkForTimeConflict(newValue, eventData.end_datetime);
    } else {
      checkForTimeConflict(eventData.start_datetime, newValue);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleCheckboxChange = (e) => {
    setEventData((prev) => ({
      ...prev,
      exclusive: e.target.checked ? "exclusive" : "public",
    }));
  };

  const updateMutation = useMutation({
    mutationFn: () => makeRequest.put(`/events?id=${eventId}`, eventData),
  });
  
  const handleSaveClick = async () => {
    if (timeConflictError) {
      setError("Please resolve the time conflict before updating the event.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to edit this event?");
    if (!isConfirmed) return;

    let imgUrl = "";
    if (file) {
      imgUrl = await uploadImage();
    } else {
      imgUrl = "default-empty.jpg";
    }

    const finalEventData = { ...eventData, img: imgUrl };

    updateMutation.mutate(finalEventData, {
      onSuccess: () => {
        setShowSuccessPopup(true);
      },
      onError: (err) => {
        if (err.response && err.response.status === 400) {
          setError("Validation failed: Please ensure all required inputs are filled and valid.");
        } else if (err.response && err.response.status === 409) {
          setError("Event update failed due to a conflict. Please check the times.");
        } else {
          setError("Validation failed: Please ensure all inputs are valid.");
        }
      },
    });
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  if (loading) return <div>Loading event details...</div>;

  return (
    <div className="updateEventForm">
      <h2>Edit Event</h2>
      
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
      <div className="character-counter">{eventData.title && eventData.title.length}/20</div>

      <label htmlFor="img">Upload New Image</label>
      <div key={key}>
      <input
        type="file"
        id="img"
        name="img"
        accept="image/*"
        onChange={handleFileChange}
      />
      {fileError && <div className="error-message">{fileError}</div>}
      {file ? (
        <img src={URL.createObjectURL(file)} alt="Selected" className="image-preview" />
      ) : (
        eventData.img && <img src={`/upload/${eventData.img}`} alt="Current" className="image-preview" />
      )}
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
      <div className="character-counter">{eventData.tnc && eventData.tnc.length}/100</div>

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
      <div className="character-counter">{eventData.tnc && eventData.tnc.length}/1000</div>

      {/* Error Messages */}
      {error && <div className="error-bottom">{error}</div>}
      {timeConflictError && <div className="error-bottom">{timeConflictError}</div>}

      {showSuccessPopup && (
        <SuccessPopup message="Event updated successfully!" onClose={handlePopupClose} />
      )}
      
      <div className="shop-name">
        <strong>Shop: </strong> {eventData.shop_name}
      </div>

      <button onClick={handleSaveClick}>Save</button>
      <button className="cancel" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
};

export default UpdateEventForm;