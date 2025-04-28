import React, { useState, useEffect, useContext } from "react";
import Event from "./Event";
import UpgradePlanModal from "../components/plan/Upgrade"; // Import UpgradePlanModal
import "./userShopEvent.scss";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import dayjs from "dayjs";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const UserShopEvent = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Track search input
  const [eventType, setEventType] = useState(""); // Track selected event type
  const [eventTypes, setEventTypes] = useState([]); // Store event types
  const [startDate, setStartDate] = useState(null); // Start date filter
  const [endDate, setEndDate] = useState(null); // End date filter
  const [isModalOpen, setIsModalOpen] = useState(false); // T&C modal visibility
  const [modalContent, setModalContent] = useState(""); // T&C modal content
  const [openUpgrade, setOpenUpgrade] = useState(false); // Upgrade modal visibility
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // User modal visibility
  const [joinedUsers, setJoinedUsers] = useState([]); // Track users joined an event
  const {currentUser} = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch events
  const {
    isLoading,
    error,
    data: events = [],
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => makeRequest.get("/events").then((res) => res.data),
  });

  // Fetch event types
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await makeRequest.get("/events/eventtypes");
        setEventTypes(response.data.eventTypes);
      } catch (error) {
        console.error("Failed to fetch event types", error);
      }
    };
    fetchEventTypes();
  }, []);

  // Handle search term change
  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  // Handle event type selection change
  const handleEventTypeChange = (e) => setEventType(e.target.value);

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Open modal
  const openModal = (content) => {
    setModalContent(content); // Set modal content
    setIsModalOpen(true); // Show modal
  };

  // Close modal
  const closeModal = () => {
    setModalContent("");
    setIsModalOpen(false); // Hide modal
  };

  // Open or close upgrade plan modal
  const handleUpgradePlanModal = () => {
    setOpenUpgrade((prev) => !prev); // Toggle upgrade modal visibility
  };

  // Fetch joined users for an event
  const fetchJoinedUsers = async (eventId, ) => {
    try {
      const response = await makeRequest.get(`/events/joined-events?event_id=${eventId}`);
      setJoinedUsers(response.data); // Set the joined users data
      setIsUserModalOpen(true);

    } catch (err) {
      console.error("Error fetching joined users:", err);
    }
  };

  // Close user modal
  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setJoinedUsers([]); // Clear the user list when closing
  };

  // Filter events based on search term, selected event type, and date range
  const filteredEvents = events.filter((event) => {
    const eventStart = dayjs(event.start);
    const eventEnd = dayjs(event.end);

    // Check search term and event type
    const matchesSearchTerm =
      event.title.toLowerCase().includes(searchTerm) ||
      event.shop_name.toLowerCase().includes(searchTerm) ||
      event.type_name.toLowerCase().includes(searchTerm);

    const matchesEventType = eventType === "" || event.type_name === eventType;

    // Check date range
    const matchesDateRange =
      (!startDate || eventEnd.isAfter(dayjs(startDate))) &&
      (!endDate || eventStart.isBefore(dayjs(endDate).add(1, "day")));

    return matchesSearchTerm && matchesEventType && matchesDateRange;
  });

  // Separate events into exclusive and public
  const exclusiveEvents = filteredEvents.filter(
    (event) => event.exclusive === "exclusive"
  );
  const publicEvents = filteredEvents.filter(
    (event) => event.exclusive === "public"
  );

  // user profile path to link to profile
  const getUserProfilePath = (userType, userId) => {
    switch (userType) {
      case "owner":
        return `/owner/profile/${userId}`;
      case "regular":
        return `/user/profile/${userId}`;
      case "expert":
        return `/expert/profile/${userId}`;
      case "admin":
        return `/admin/check-user-profile/${userId}`;
      default:
        return "/404"; // Fallback for unexpected user types
    }
  };

  return (
    <div className="user-shop-events">
      <h2>Events</h2>

      {/* Filters */}
      <div className="type-date-filter">
        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="event-type-select-label">Event Type</InputLabel>
          <Select
            labelId="event-type-select-label"
            id="event-type-select"
            value={eventType}
            onChange={handleEventTypeChange}
            label="Event Type"
          >
            <MenuItem value="">All</MenuItem>
            {eventTypes.map((type) => (
              <MenuItem key={type.id} value={type.type_name}>
                {type.type_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newDate) => setStartDate(newDate)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" />
            )}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newDate) => setEndDate(newDate)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" />
            )}
          />
        </LocalizationProvider>
        <Button
          className="resetBtn"
          variant="outlined"
          onClick={clearDates}
          style={{ marginLeft: "10px" }}
        >
          Clear Dates
        </Button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <TextField
          label="Search Events"
          variant="outlined"
          fullWidth
          onChange={handleSearch}
          placeholder="Search by event title, shop name, or type"
        />
      </div>

      {/* Events */}
      {error ? (
        <p>Something went wrong...</p>
      ) : isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>Public Events</h3>
          {publicEvents.length > 0 ? (
            <div className="event-container">
              {publicEvents.map((event) => (
                <Event
                  key={event.id}
                  event={event}
                  onOpenModal={openModal}
                  onUpgradePlan={handleUpgradePlanModal}
                  onFetchJoinedUsers={fetchJoinedUsers} // Pass user fetch handler
                />
              ))}
            </div>
          ) : (
            <p>No public events found.</p>
          )}

          <h3>Exclusive Events</h3>
          {exclusiveEvents.length > 0 ? (
            <div className="event-container">
              {exclusiveEvents.map((event) => (
                <Event
                  key={event.id}
                  event={event}
                  onOpenModal={openModal}
                  onUpgradePlan={handleUpgradePlanModal}
                  onFetchJoinedUsers={fetchJoinedUsers} // Pass user fetch handler
                />
              ))}
            </div>
          ) : (
            <p>No exclusive events found.</p>
          )}
        </>
      )}

      {/* Terms Modal */}
      {isModalOpen && (
        <div className="user-event-tnc-modal-overlay" onClick={closeModal}>
          <div
            className="user-event-tnc-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Terms and Conditions</h3>
            <p>{modalContent}</p>
            <Button variant="contained" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {openUpgrade && (
        <UpgradePlanModal
          open={openUpgrade}
          onClose={handleUpgradePlanModal}
        />
      )}

      {/* Users Joined Modal */}
      {isUserModalOpen && (
        <div className="participants-modal" onClick={closeUserModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Users Joined</h3>
            {joinedUsers.length > 0 ? (
              joinedUsers.map((user) => (
                <div
                  className="friend-card participant-card"
                  key={user.user_id}
                  onClick={() => navigate(getUserProfilePath(currentUser.type, user.user_id))}
                >
                  <img
                    src={
                      user.profilePic
                        ? `/upload/${user.profilePic}`
                        : "/upload/empty-profile-picture.jpg"
                    }
                    alt={`${user.username}'s profile`}
                    className="friend-profile-pic"
                  />
                  <div className="friend-info">
                    <h2>{user.username}</h2>
                  </div>
                </div>
              ))
            ) : (
              <p>No users have joined this event.</p>
            )}
            <Button variant="contained" onClick={closeUserModal}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserShopEvent;
