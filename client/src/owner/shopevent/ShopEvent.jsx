import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../context/authContext";
import './shopEvent.scss';
import { makeRequest } from '../../axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import LabelIcon from '@mui/icons-material/Label';
import { IconButton } from '@mui/material';
import UpdateEventForm from '../components/updateEventForm/UpdateEventForm';
import CreateEventForm from '../components/createShopEvent/CreateShopEvent'; // Import the CreateEventForm component

function ShopEvent() {
  const { currentUser } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // Store the event being edited
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Control the visibility of the UpdateEventForm
  const [showCreateForm, setShowCreateForm] = useState(false); // Control the visibility of the CreateEventForm


  const fetchEvents = async () => {
    try {
      const response = await makeRequest.get('/events?ownerId=' + currentUser.id); // Adjust endpoint as needed
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events');
      setLoading(false);
    }
  };
  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [currentUser.id]);

  const handleEditClick = (event) => {
    setEditingEvent(event); // Set the event to be edited
    setShowUpdateForm(true); // Show the update form as a modal
  };

  // Function to close the modal
  const closeModal = () => {
    setShowUpdateForm(false);
    setShowCreateForm(false); // Close the create form if it's open
    // refresh page after close the form
    fetchEvents();
  };

  const handleDelete = async (eventId) => {
    try {
      await makeRequest.delete(`/events?id=${eventId}`); // Call the delete API
      // Remove the deleted event from the state
      setEvents(events.filter(event => event.id !== eventId));
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleAddClick = () => {
    setShowCreateForm(true); // Show the create form when the "Add Event" button is clicked
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="shopEvent">
      <h1>All Events</h1>
      {/* Add Event Button */}
      <button className="add-event-button" onClick={handleAddClick}>
        Add Event
      </button>

      {events && events.length > 0 ? (
        <ul className="event-list">
          {events.map((event) => (
            <div className="event-card" key={event.id}>
              <h3>{event.title}</h3>

              {/* Event Type */}
              <div className="event-detail">
                <LabelIcon className="icon" />
                <div className="info">
                  <strong>Event Type:</strong>
                  <span>{event.type_name}</span>
                </div>
              </div>

              <div className="event-detail">
                <LocationOnIcon className="icon" />
                <div className="info">
                  <strong>Location:</strong>
                  <span>{event.shop_name}</span>
                </div>
              </div>

              <div className="event-detail">
                <AttachMoneyIcon className="icon" />
                <div className="info">
                  <strong>Price:</strong>
                  <span>${parseFloat(event.price).toFixed(2)}</span>
                </div>
              </div>

              <div className="event-detail">
                <EventAvailableIcon className="icon" />
                <div className="info">
                  <strong>Date:</strong>
                  <span>{new Date(event.start).toLocaleDateString()}</span>
                  <br />
                  <strong>Time:</strong>
                  <span>{new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="event-detail">
                <PeopleIcon className="icon" />
                <div className="info">
                  <strong>Capacity:</strong>
                  <span>{event.occupied}/{event.capacity}</span>
                </div>
              </div>

              <div className="event-actions">
                <IconButton className="mui-icon-button" aria-label="edit" onClick={() => handleEditClick(event)}>
                  <EditIcon />
                </IconButton>
                <IconButton className="mui-icon-button" aria-label="delete" onClick={() => handleDelete(event.id)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          ))}
        </ul>
      ) : (
        <p>No events available</p>
      )}

      {/* Render the UpdateEventForm as a modal */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <UpdateEventForm eventId={editingEvent.id} onClose={closeModal} /> {/* Pass the eventId */}
          </div>
        </div>
      )}

      {/* Render the CreateEventForm as a modal */}
      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <CreateEventForm onClose={closeModal}
            shopEditable={true} /> {/* Show create event form */}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopEvent;
