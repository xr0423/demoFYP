import { Details } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { makeRequest } from '../../../axios'; // Adjust based on your axios setup
import './updateMeetupForm.scss'; // Add relevant styles for this form

const UpdateMeetupForm = ({ meetup, onClose }) => {
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    return date.toISOString().slice(0, 16);
  };

  const [meetupData, setMeetupData] = useState({
    title: meetup.title,
    description: meetup.description,
    startDate_Time: formatDateTime(meetup.startDate_Time),
    endDate_Time: formatDateTime(meetup.endDate_Time),
    shop_id: meetup.shop_id,
    event_name: meetup.event_title || '',
  });

  const [shops, setShops] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events based on selected shop
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch available shops and events when the form is loaded
  useEffect(() => {
    const fetchShopsAndEvents = async () => {
      try {
        const response = await makeRequest.get('/meetups/related-data');
        setShops(response.data.shops);
        setEvents(response.data.events);

        // Set initial filtered events based on existing meetup data
        const initialFilteredEvents = response.data.events.filter(
          (event) => event.shop_id === parseInt(meetup.shop_id, 10)
        );
        setFilteredEvents(initialFilteredEvents);
      } catch (err) {
        setError('Failed to load shops and events');
      }
    };

    fetchShopsAndEvents();
  }, [meetup.shop_id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > 20) return;
    if (name === "description" && value.length > 100) return;
    setMeetupData({
      ...meetupData,
      [name]: value,
    });

    // Filter events based on selected shop
    if (name === 'shop_id') {
      const selectedShopId = parseInt(value, 10); // Ensure shop_id is a number
      const shopEvents = events.filter((event) => event.shop_id === selectedShopId); // Filter by shop_id
      setFilteredEvents(shopEvents); // Set the filtered events
      setMeetupData({
        ...meetupData,
        shop_id: value,  // Update shop_id
        event_name: '',    // Reset event selection when shop changes
      });
    }

    if (name === "startDate_Time" && new Date(value) < new Date()) {
      alert("Start date and time cannot be in the past.");
      return;
    }
  
    // Validate the end date/time
    if (name === "endDate_Time" && new Date(value) <= new Date(setMeetupData.startDate_Time)) {
      alert("End date and time must be later than the start date and time.");
      return;
    }
  };

  // Handle form submission for update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await makeRequest.put(`/meetups/update/${meetup.meetup_id}`, meetupData); // Send the request with meetup_id in the URL
  
      if (response.status === 200) {
        setSuccess(true);
        console.log("Meetup updated successfully, showing popup.");
      }else
      {
        setError('Failed to update meetup' + response.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Meetup time range conflicts with another meetup.');
      }else {
      setError("Failed to create meetup");
      }
    }
  };
  
  
  

  // Close the form and clear success state
  const closeForm = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <div className="update-meetup-modal">
    <div className="update-meetup-form">
      <h2>Update Meetup</h2>
      {success ? (
        <div className="success">
          Meetup updated successfully!
          <button onClick={closeForm} className="close-button">Close</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={meetupData.title}
            onChange={handleInputChange}
            placeholder="Meetup Title"
            maxLength={20}
            required
          />
          {meetupData.title.length}/20
          <textarea
            name="description"
            value={meetupData.description}
            onChange={handleInputChange}
            placeholder="Meetup Description"
            maxLength={100}
            required
          />
          <div className="character-counter">{meetupData.description.length}/100</div>
          <input
            type="datetime-local"
            name="startDate_Time"
            value={meetupData.startDate_Time}
            onChange={handleInputChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          <input
            type="datetime-local"
            name="endDate_Time"
            value={meetupData.endDate_Time}
            onChange={handleInputChange}
            min={meetupData.startDate_Time}
            required
          />
          <select
            name="shop_id"
            value={meetupData.shop_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.shop_id} value={shop.shop_id}>
                {shop.shop_name}
              </option>
            ))}
          </select>
          {error && <div className="error">{error}</div>}
          
          <div className="button-group">
            <button type="submit" className="update-button">Update Meetup</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      )}
    </div>
  </div>

  );
};

export default UpdateMeetupForm;