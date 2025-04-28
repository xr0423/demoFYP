import React, { useContext, useEffect, useState } from "react";
import "./event.scss"; // Import the SCSS file
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add"; // Icon for create event
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import LabelIcon from "@mui/icons-material/Label"; // Add icon for event type
import DescriptionIcon from "@mui/icons-material/Description";
import TitleIcon from "@mui/icons-material/Title";
import InfoIcon from "@mui/icons-material/Info";
import { IconButton, CircularProgress, Box, Typography, Alert, Button, Link } from "@mui/material";
import { makeRequest } from "../../../../axios"; // Assuming axios config is correct
import UpdateEventForm from "../../updateEventForm/UpdateEventForm";
import CreateEventForm from "../../createShopEvent/CreateShopEvent"; // Import the Create Event Form
import Upgrade from "../../../../user/components/plan/Upgrade"
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/authContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function Event({ shopId, ownerDetails }) {
  const [eventsData, setEventsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false); // State for showing Create Event form
  const [activeTab, setActiveTab] = useState("exclusive"); // State to track active tab ("public" or "exclusive")
  const [isTncModalOpen, setIsTncModalOpen] = useState(false); // To control T&C modal visibility
  const [selectedTnc, setSelectedTnc] = useState(""); // To store the T&C content
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // State for the user modal
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [eventsJoined, setEventsJoined] = useState([]);
  const [joinedError, setJoinedError] = useState(null);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const handleUpgradePlanModal = () => {
    setOpenUpgrade((prev) => !prev)
  }
  // fetch events the user joined in the shop
  const fetchJoinedEvents = async () => {
    try {
      const response = await makeRequest.get(`/events/getJoinedEvents`, {
        params: { shop_id: shopId },
        withCredentials: true, // Ensure cookies are sent for authentication
      });
      setEventsJoined(response.data);
    } catch (err) {
      console.error("Error fetching joined events:", err);
      setJoinedError(err.response?.data || "Failed to fetch joined events");
    }
  };
  
  // useEffect to fetch joined events on component mount or when shopId changes
  useEffect(() => {
    fetchJoinedEvents();
  }, [shopId]);

  const handleJoin = async (eventId) => {
    try {
      await makeRequest.post(`/events/join`, null, {
        params: { event_id: eventId }, // Send as query parameter
        withCredentials: true,
      });
      fetchJoinedEvents(); // Refresh joined events list
      fetchEvents();
    } catch (err) {
      console.error("Error joining event:", err);
    }
  };
  
  const handleQuit = async (eventId) => {
    try {
      await makeRequest.delete(`/events/quit`, {
        params: { event_id: eventId }, // Send as query parameter
        withCredentials: true,
      });
      fetchJoinedEvents(); // Refresh joined events list
      fetchEvents();
    } catch (err) {
      console.error("Error quitting event:", err);
    }
  };  
  
  // fetch events
  const fetchEvents = async () => {
    try {
      const response = await makeRequest.get(`/events?shopId=${shopId}`);
      setEventsData(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err);
      setIsLoading(false);
    }
  };


  const fetchJoinedUsers = async (eventId, ) => {
    try {
      const response = await makeRequest.get(`/events/joined-events?event_id=${eventId}`);
      setJoinedUsers(response.data); // Set the joined users data
      setIsUserModalOpen(true);

    } catch (err) {
      console.error("Error fetching joined users:", err);
    }
  };
  
  const [shopStatus, setShopStatus] = useState(false);
  const getShopStatus = async () => {
    try {
      const response = await makeRequest.get(`/shoplistings/status?id=${shopId}`);
      setShopStatus(response.data === "active" ? true : false);
      setIsLoading(false);
    } catch (err) {}
  };
  
  useEffect(() => {
    getShopStatus();
    fetchEvents();
  }, [shopId, showUpdateForm, showCreateForm]);

  const handleEditClick = (event) => {
    setEditingEvent(event); // Set the event to be edited
    setShowUpdateForm(true); // Show the update form as a modal
  };

  const handleCreateClick = () => {
    setShowCreateForm(true); // Show the create form as a modal
  };
  const openTncModal = (tncContent) => {
    setSelectedTnc(tncContent); // Set the selected T&C content
    setIsTncModalOpen(true); // Open the modal
  };
  
  const closeTncModal = () => {
    setIsTncModalOpen(false); // Close the modal
    setSelectedTnc(""); // Clear the T&C content
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setJoinedUsers([]); // Clear the user list when closing
  };

  // Function to close the modal
  const closeModal = () => {
    setShowUpdateForm(false);
    setShowCreateForm(false); // Close create modal
  };

  const handleDelete = async (eventId) => {
    try {
      await makeRequest.delete(`/events?id=${eventId}`); // Call the delete API
      // Remove the deleted event from the state
      setEventsData(eventsData.filter((event) => event.id !== eventId));
    } catch (err) {
      setError("Failed to delete event");
    }
  };
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
  

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px" textAlign="center">
        <Alert severity="error">Error fetching events: {error.message}</Alert>
      </Box>
    );
  }

  if (joinedError) {
    return <div>Error: {error}</div>;
  }

  // Separate events based on exclusivity
  const exclusiveEvents = eventsData.filter((event) => event.exclusive === "exclusive");
  const publicEvents = eventsData.filter((event) => event.exclusive === "public");

  return (
    <div className="event-page">

      {/* Create Event Button */}
      {ownerDetails?.id === currentUser?.id && (
        <IconButton
          className="addBtn"
          sx={{ marginBottom: "15px" }}
          onClick={handleCreateClick}
          disabled={!shopStatus}
        >
          <AddIcon style={{ color: "white" }} />
        </IconButton>
      )}

      {/* Tabs for Exclusive and Public Events */}
      <div className="event-tabs">
        <Button
          onClick={() => setActiveTab("exclusive")}
          variant={activeTab === "exclusive" ? "contained" : "outlined"}
        >
          Exclusive Events
        </Button>
        <Button
          onClick={() => setActiveTab("public")}
          variant={activeTab === "public" ? "contained" : "outlined"}
          sx={{ marginRight: "10px" }}
        >
          Public Events
        </Button>
      </div>

      {/* Conditionally Render Event Lists Based on Active Tab */}
      {activeTab === "public" ? (
        publicEvents && publicEvents.length > 0 ? (
          <ul className="event-list">
            {publicEvents.map((event) => (
              <div className="event-card" key={event.id}>
                <div className="event-detail">
                  {event.img && (
                    <img
                      src={event.img ? `/upload/${event.img}` : "/upload/default-empty.jpg"}
                      alt={event.title}
                      className="event-image"
                    />
                  )}
                </div>
                <div className="event-detail">
                  <TitleIcon />
                  <div>
                    <strong>Title: </strong>
                    {event.title}
                  </div>
                </div>
                <div className="event-detail">
                  <LocationOnIcon />
                  <div>
                    <strong>Shop Name:</strong> {event.shop_name}
                  </div>
                </div>
                <div className="event-detail">
                  <LabelIcon />
                  <div>
                    <strong>Event Type: </strong>
                    {event.type_name}
                  </div>
                </div>
                <div className="event-detail">
                  <AttachMoneyIcon />
                  <div>
                    <strong>Price:</strong> ${parseFloat(event.price).toFixed(2)}
                  </div>
                </div>
                <div className="event-detail">
                  <EventAvailableIcon />
                  <div>
                    <strong>Start Date & Time:</strong> {new Date(event.start).toLocaleDateString()} -{" "}
                    {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    <br />
                    <strong>End Date & Time:</strong> {new Date(event.end).toLocaleDateString()} -{" "}
                    {new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </div>
                </div>
                <div className="event-detail">
                  <PeopleIcon />
                  <div>
                    <strong>Capacity:</strong> {event.occupied}/{event.capacity}
                    <IconButton onClick={() => fetchJoinedUsers(event.id)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                <div className="event-detail">
                  <DescriptionIcon />
                  <strong>Description:</strong>
                </div>
                <div className="event-detail">
                  <div className="event-description">{event.description}</div>
                </div>

                <div className="event-detail">
                  <Button variant="text" onClick={() => openTncModal(event.tnc)} className="tnc-button">
                    Terms and Conditions
                  </Button>
                </div>

                <div className="event-actions">
                  {ownerDetails?.id === currentUser?.id && ( // Check if current user is the owner
                    <>
                      <IconButton
                        className="mui-icon-button edit-btn"
                        aria-label="edit"
                        onClick={() => handleEditClick(event)}
                        disabled={!shopStatus}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        className="mui-icon-button delete-btn"
                        aria-label="delete"
                        onClick={() => handleDelete(event.id)}
                        disabled={!shopStatus}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                        {/*public  */}
                  {(currentUser?.type === "regular" || currentUser?.type === "expert") && (
                    (eventsJoined.some((eventsJoined) => eventsJoined.event_id === event.id) ? (
                      <button 
                        className="event-quit-btn"
                        onClick={() => handleQuit(event.id)}
                      >
                        QUIT
                      </button>
                    ) : (
                      <button
                        className="event-join-btn"
                        onClick={() => handleJoin(event.id)}
                      >
                        JOIN
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </ul>
        ) : (
          <p>No public events available.</p>
        )
      ) : (
        exclusiveEvents && exclusiveEvents?.length > 0 ? (
          <ul className="event-list">
            {exclusiveEvents.map((event) => (
              <div className="event-card" key={event.id}>
                <div className="event-detail">
                  {event.img && (
                    <img
                      src={event.img ? `/upload/${event.img}` : "/upload/default-empty.jpg"}
                      alt={event.title}
                      className="event-image"
                    />
                  )}
                </div>
                <div className="event-detail">
                  <TitleIcon />
                  <div>
                    <strong>Title: </strong>
                    {event.title}
                  </div>
                </div>
                <div className="event-detail">
                  <LocationOnIcon />
                  <div>
                    <strong>Shop Name:</strong> {event.shop_name}
                  </div>
                </div>
                <div className="event-detail">
                  <LabelIcon />
                  <div>
                    <strong>Event Type: </strong>
                    {event.type_name}
                  </div>
                </div>
                <div className="event-detail">
                  <AttachMoneyIcon />
                  <div>
                    <strong>Price:</strong> ${parseFloat(event.price).toFixed(2)}
                  </div>
                </div>
                <div className="event-detail">
                  <EventAvailableIcon />
                  <div>
                    <strong>Start Date & Time:</strong> {new Date(event.start).toLocaleDateString()} -{" "}
                    {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    <br />
                    <strong>End Date & Time:</strong> {new Date(event.end).toLocaleDateString()} -{" "}
                    {new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </div>
                </div>
                <div className="event-detail">
                  <PeopleIcon />
                  <div>
                    <strong>Capacity:</strong> {event.occupied}/{event.capacity}
                    <IconButton onClick={() => fetchJoinedUsers(event.id)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                <div className="event-detail">
                  <DescriptionIcon />
                  <strong>Description:</strong>
                </div>
                <div className="event-detail">
                  <div className="event-description">{event.description}</div>
                </div>

                <div className="event-detail">
                  <Link variant="text" onClick={() => openTncModal(event.tnc)} className="tnc-button">
                      Terms and Conditions
                  </Link>
                </div>
                  <div className="event-actions">
                    {/* Actions for the event owner */}
                    {ownerDetails?.id === currentUser?.id && (
                      <>
                        <IconButton
                          className="mui-icon-button edit-btn"
                          aria-label="edit"
                          onClick={() => handleEditClick(event)}
                          disabled={!shopStatus}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          className="mui-icon-button delete-btn"
                          aria-label="delete"
                          onClick={() => handleDelete(event.id)}
                          disabled={!shopStatus}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}

                    {/* Actions for regular or expert users */} {/*exclusive */}
                    {currentUser?.type !== "owner" && (
                      <>
                          {(currentUser?.type === "regular" && currentUser?.subscriptionId !== 1) || currentUser?.type === "expert" ? (
                              eventsJoined.some((joinedEvent) => joinedEvent.event_id === event.id) ? (
                                  <button
                                      className="event-quit-btn"
                                      onClick={() => handleQuit(event.id)}
                                  >
                                      QUIT
                                  </button>
                              ) : (
                                  <button
                                      className="event-join-btn"
                                      onClick={() => handleJoin(event.id)}
                                  >
                                      JOIN
                                  </button>
                              )
                          ) : (
                              currentUser?.type === "regular" && currentUser?.subscriptionId === 1 && (
                                  <button
                                      className="upgrade-plan-btn"
                                      onClick={handleUpgradePlanModal}
                                  >
                                      Upgrade Plan
                                  </button>
                              )
                          )}
                      </>
                  )}
                  {openUpgrade && (
                    <Upgrade open={openUpgrade} onClose={handleUpgradePlanModal} />
                  )}

                  </div>


              </div>
            ))}
          </ul>
        ) : (
          <p>No exclusive events available.</p>
        )
      )}
      
      {/* Render the UpdateEventForm as a modal */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <UpdateEventForm eventId={editingEvent.id} onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Render the CreateEventForm as a modal */}
      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <CreateEventForm onClose={closeModal} shopEditable={false} defaultShopId={shopId} /> {/* Pass shopId */}
          </div>
        </div>
      )}

      {isTncModalOpen && (
        <div className="tnc-modal" onClick={closeTncModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Terms and Conditions</h3>
            <p>{selectedTnc}</p>
            <Button variant="contained" onClick={closeTncModal}>
              Close
            </Button>
          </div>
        </div>
      )}
      
      {isUserModalOpen && (
  <div className="participants-modal" onClick={closeUserModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Users Joined</h3>
      {joinedUsers && joinedUsers.length > 0 ? (
        <ul>
          {joinedUsers.map((user) => (
            <div
                className="friend-card participant-card"
                key={user.user_id}
                onClick={() => navigate(getUserProfilePath(currentUser.type, user.user_id))}
              >
              <img
                src={user.profilePic ? `/upload/${user.profilePic}` : "/upload/empty-profile-picture.jpg"}
                alt={`${user.username}'s profile`}
                className="friend-profile-pic"
              />
              <div className="friend-info">
                <h2>{user.username}</h2>
              </div>
            </div>
          ))}
        </ul>
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
}

export default Event;
