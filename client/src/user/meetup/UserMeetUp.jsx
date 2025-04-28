import React, { useContext, useEffect, useState } from 'react';
import { makeRequest } from '../../axios';
import Event from "../shopevent/Event";
import './userMeetUp.scss';
import { Divider, Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Button, IconButton, Avatar, Card, CardContent, CardActions, Typography } from '@mui/material';
import CreateMeetupForm from '../components/createMeetupForm/CreateMeetupForm';
import UpdateMeetupForm from '../components/updateMeetupForm/UpdateMeetupForm';
import { AuthContext } from '../../context/authContext';
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UpgradePlanModal from "../components/plan/Upgrade";
import { useNavigate } from "react-router-dom";

const UserMeetUp = () => {
  const {currentUser } = useContext(AuthContext);
  const [meetups, setMeetups] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [meetupRequests, setMeetupRequests] = useState([]);
  const [friends, setFriends] = useState([]); // Store the friend list
  const [selectedFriends, setSelectedFriends] = useState([]); // Track selected friends
  const [error, setError] = useState(null);
  const [view, setView] = useState('all');
  const [loading, setLoading] = useState(true); 
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingMeetup, setEditingMeetup] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false); // Control Invite Modal visibility
  const [invitingMeetup, setInvitingMeetup] = useState(null); // Track the meetup being shared
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const handleSnackbarOpen = () => setSnackbarOpen(true); // Open Snackbar
  const handleSnackbarClose = () => setSnackbarOpen(false); // Close Snackbar
  const [meetuprequestSent, setMeetUpRequestSent] = useState([]);
  const [meetupId, setSelectedMeetUp] = useState(null);
  const [request, setRequest] = useState([])
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // T&C modal visibility
  const [modalContent, setModalContent] = useState(""); // T&C modal content
  const [openUpgrade, setOpenUpgrade] = useState(false); // Upgrade modal visibility
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // User modal visibility
  const [joinedUsers, setJoinedUsers] = useState([]); // Track users joined an event
  const navigate = useNavigate();

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

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setJoinedUsers([]); // Clear the user list when closing
  };

  const openModal = (content) => {
    setModalContent(content); // Set modal content
    setIsModalOpen(true); // Show modal
  };

  
  const fetchMeetups = async () => {
    try {
      // setLoading(true);
      let response;
      if (view === 'all') {
        response = await makeRequest.get('/meetups');
      } else if (view === 'my') {
        response = await makeRequest.get(`/meetups?userId=${currentUser.id}`);
      } else if (view === 'requests') {
        response = await makeRequest.get(`/meetups/meetupRequests?recipientId=${currentUser.id}`);
      } else if (view === 'joined') { 
        response = await makeRequest.get(`/events/user-events?userId=${currentUser.id}`);
        setJoinedEvents(response.data);
      }
      view === 'requests' ? setMeetupRequests(response.data) : setMeetups(response.data);
    } catch (err) {
      setError('Failed to load meetups');
      console.log(err.meessage);
      handleSnackbarOpen();
    }
    finally {
      setLoading(false); // Set loading to false at the end of fetch
    }
  };
  

  const fetchNotificationRequests = async () => {
    try {
      const requests = await makeRequest.get(`/meetups/getrequest`);
      setRequest(requests.data);
    } catch (err) {
      console.error('Failed to load meetup requests for notifications');
    }
  };


  const fetchFriends = async () => {
    try {
      const response = await makeRequest.get(`/friendRequest/withoutMeetupRequest`, {
        params: {
          userId: currentUser.id,
          meetupId: invitingMeetup ? invitingMeetup.meetup_id : null,
        },
      });
  
      if(response.data.message == "No friends available to invite. Please add more friends."){
        setFriends([]);
        console.log("friends",friends);
      }else{
        setFriends(response.data.friendsWithoutRequest);
        console.log("friends",friends);
      }      
    } catch (err) {
      setError('Failed to load friends list');
      handleSnackbarOpen();
    }
  };
  

  const openInviteDialog = (meetup) => {
    setError("");
    setInvitingMeetup(meetup);
    setShowInviteDialog(true);
    setSelectedMeetUp(meetup.meetup_id);
  };

  useEffect(() => {
    // Only fetch friends if invitingMeetup is set
    if (invitingMeetup) {
      fetchFriends();
    }
  }, [openInviteDialog]);

  const closeInviteDialog = () => {
    setError("");
    setShowInviteDialog(false);
    setSelectedFriends([]);
  };

  const closeModal = () => {
    setShowCreateForm(false);
    setShowUpdateForm(false);
    fetchMeetups();
    setModalContent("");
    setIsModalOpen(false); // Hide modal
  };

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchMeetups();
    }
  }, [view, currentUser, closeModal]);

  useEffect(() => {
    fetchNotificationRequests();
    setError("");
    setSuccessMessage('');
    setMeetupRequests([]);
    setMeetups([]);
    fetchMeetups();
  }, [view]);

  useEffect(() => {
    // If the user is an expert, default to 'joined'
    if (currentUser.type === 'expert') {
      setView('joined');
    }
  }, [currentUser.type]);  

  const fetchMeetuprequestByMeetupId = async() => {
    try{
          const response = await makeRequest.get(`/meetups/meetupRequests?meetupId=${meetupId}`);   
          setMeetUpRequestSent(response.data);
          const recipientIds = response.data.map((request) => request.recipient_id);
          setSelectedFriends(recipientIds); // Update selectedFriends with recipient IDs
        }catch(err){
          setError('Failed to check meetup request sent');
          handleSnackbarOpen();
        }
      }
  useEffect(() => {
    fetchMeetuprequestByMeetupId();
  }, [view])
  //////
  const handleCreateSuccess = (message) => {
    setSuccessMessage(message);
    setSnackbarOpen(true); // Open the Snackbar with the success message
    setShowCreateForm(false); // Close the create form
  };

  const handleFriendSelect = (friendId) => {
    setSelectedFriends((prevSelectedFriends) => {
      // Toggle selection: add if not present, remove if already selected
      // console.log("Friend previously selected:", prevSelectedFriends.includes(friendId));
      const updatedFriends = prevSelectedFriends.includes(friendId)
        ? prevSelectedFriends.filter((id) => id !== friendId) // Deselect if already selected
        : [...prevSelectedFriends, friendId]; // Select if not selected
  
      // console.log("Updated selected friends:", updatedFriends); // Log the new selected list
      return updatedFriends;
    });
  };
  
  // Use useEffect to log `selectedFriends` after it updates
  useEffect(() => {
    console.log("Current selectedFriends state:", selectedFriends);
  }, [selectedFriends]);
  

  const handleShareMeetup = async () => {
    try {
      setError("");
        // Identify stale invitations to be removed (previously invited friends who are no longer selected)
        const staleInvitations = meetuprequestSent.filter(
          (request) => !selectedFriends.includes(request.recipient_id)
        );

    // Remove stale invitations from the backend
    await Promise.all(
      staleInvitations.map((stale) =>
        makeRequest.delete(`/meetups/reject?requestId=${stale.request_id}`)
      )
    );
      // add
      await Promise.all(
        selectedFriends.map((friendId) =>
          makeRequest.post('/meetups/meetupRequests', {
            meetup_id: invitingMeetup.meetup_id,
            sender_id: currentUser.id,
            recipient_id: friendId,
            status_id: 4, // Pending status
          })
        )
      );

      setSuccessMessage('Meetup request sent!');
      handleSnackbarOpen();
      closeInviteDialog();
    } catch (err) {
      setError('Failed to share meetup' + err);
      handleSnackbarOpen();
    }
  };

  const handleEditClick = (meetup) => {
    setEditingMeetup(meetup);
    setShowUpdateForm(true);
  };


  const handleDeleteClick = async (meetupId) => {
    const confirmDelete = window.confirm(`Are you sure you want to disband?`);
    if(confirmDelete){
      try {
        await makeRequest.delete('/meetups?meetup_id=' + meetupId);
        setSuccessMessage("Delete successful")
        handleSnackbarOpen();
        fetchMeetups();
      } catch (err) {
        setError('Failed to delete meetup');
        handleSnackbarOpen();
      }
    }
  };

  const handleAcceptRequest = async (requestId, meetupId) => {
    try {
      // Send the accept request to the backend
      await makeRequest.post(`/meetups/accept?requestId=${requestId}&meetupId=${meetupId}`);
  
      // Update the `meetupRequests` state to remove the accepted request
      setMeetupRequests((prevRequests) =>
        prevRequests.filter((request) => request.request_id !== requestId)
      );
  
      // Optionally update `request` state to keep track of overall requests if needed
      setRequest((prevRequests) =>
        prevRequests.filter((req) => req.request_id !== requestId)
      );
  
      // Show success message
      setSuccessMessage("Meetup request accepted!");
      handleSnackbarOpen();
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept the meetup request');
      handleSnackbarOpen();
    }
  };
  

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleRejectRequest = async (requestId) => {
    const confirmReject = window.confirm(`Are you sure you want to reject?`);
    if(confirmReject){
      try {
        await makeRequest.delete(`/meetups/reject?requestId=${requestId}`); // API to reject the request
        setSuccessMessage('Meetup rejected/withdrawn!');
        handleSnackbarOpen();
        setRequest((prevRequests) => {
          const updatedRequests = prevRequests.filter((req) => req.request_id !== requestId);
          return updatedRequests;
        });
  
        // Update meetupRequests to remove the rejected request
        setMeetupRequests((prev) =>
          prev.filter((request) => request.request_id !== requestId)
        );
  
        // If no requests are left, set the request state to an empty array
        if (request.length === 1) {
          setRequest([]);
        }
        console.log("request", request);
        setMeetupRequests((prev) =>
          prev.filter((request) => request.request_id !== requestId)
        ); // Remove rejected request from the list
        fetchMeetups();
      } catch (err) {
        console.error('Error rejecting request:', err);
        setError('Failed to reject the request.');
        handleSnackbarOpen();
      }
    }
  };



  return (
    <div className="meetup-page">
      <div className="meetup-header">
          {currentUser.type === 'regular' && (
            <>
              <IconButton className="create-meetup-button" onClick={handleCreateClick}>
                <AddIcon />
              </IconButton>
              <div className="meetup-toggle">
                <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>
                  All Meetups
                </button>
                <button className={view === 'my' ? 'active' : ''} onClick={() => setView('my')}>
                  My Meetups
                </button>
                <button className={view === 'requests' ? 'active' : ''} onClick={() => setView('requests')}>
                  Meetup Requests {request.length > 0 && <span className="notification-dot"></span>}
                </button>
              </div>
            </>
          )}
          <div className="meetup-toggle">
            <button className={view === 'joined' ? 'active' : ''} onClick={() => setView('joined')}>
              Joined Events
            </button>
          </div>
        </div>


      {error && <div className="error">{error}</div>}

      <Grid
        className="meetup-list"
        justifyContent="center"
        alignItems="flex-start"
        spacing={4} // Adds space between grid items
        sx={{
          maxWidth: { xs: "100%", sm: "90%", md: "80%", lg: "1200px" }, // Responsive width
          margin: "0 auto",  // Centers the grid container horizontally
          paddingX: { xs: 2, sm: 4, md: 30 }, // Responsive horizontal padding
          paddingY: { xs: 2, sm: 4, md: 0 }, // Responsive vertical padding
        }}
      >
        {view === 'requests' ? (
          meetupRequests.length > 0 ? (
            meetupRequests.map((request) => (
              <Grid item xs={12} sm={6} md={4} key={request.request_id} >
              <Card key={request.request_id} className="meetup-card" sx={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s, box-shadow 0.3s",
          "&:hover": { transform: "scale(1.005)", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)" } }}>
                <CardContent sx={{ padding: "16px" }}>
                <Typography variant="h6" component="div" gutterBottom>
              {request.meetup_title}
                </Typography>

                <Divider sx={{ marginBottom: "12px" }} />

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Description:</strong> {request.description}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Shop:</strong> {request.shop_name || 'N/A'}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Event:</strong> {request.event_title || 'No Event'}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Start Time:</strong> {new Date(request.startDate_Time).toLocaleString()}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>End Time:</strong> {new Date(request.endDate_Time).toLocaleString()}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Sent by:</strong> {request.sender_name} ({request.sender_email})
                </Typography>

                <Typography variant="body2">
                  <strong>Sent time:</strong> {new Date(request.sent_at).toLocaleString()}
                </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", padding: "8px 16px" }}>
                  {request.status_name !== "accepted" && (
                    <IconButton
                      onClick={() => handleAcceptRequest(request.request_id, request.meetup_id)}
                      sx={{
                        color: "#6b4605",
                        "&:hover": { color: "#543405" },
                      }}
                    >
                      <CheckCircleIcon fontSize="medium" />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => handleRejectRequest(request.request_id)}
                    sx={{
                      color: "#6b4605",
                      "&:hover": { color: "#543405" },
                    }}
                  >
                    <CancelIcon fontSize="medium" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>

            ))
          ) : (
            <div className="centered-message">
              <p>No meetup requests</p>
            </div>
          )
        ) : view === 'joined' ? ( // Display joined events
          joinedEvents.length > 0 ? (
            <div className="event-container">
              {joinedEvents.map((event) => (
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
            <div className="centered-message">No joined events found.</div>
          )
        ) : meetups.length > 0 ? (
          meetups.map((meetup) => (
            <Grid item xs={12} sm={6} md={4} key={meetup.meetup_id}>
              <Card
                className="meetup-card"
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s, box-shadow 0.3s",
                  "&:hover": { transform: "scale(1.005)", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)" }
                }}
              >
                <CardContent sx={{ padding: "16px" }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {meetup.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {meetup.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Shop:</strong> {meetup.shop_name}
                  </Typography>
                  {meetup.event_title && <Typography variant="body2">
                    <strong>Event:</strong> {meetup.event_title || 'None'}
                  </Typography>}
                  <Typography variant="body2">
                    <strong>Start:</strong> {new Date(meetup.startDate_Time).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>End:</strong> {new Date(meetup.endDate_Time).toLocaleString()}
                  </Typography>
                  {view === 'all' && !meetup.isOwnMeetup && (
                    <IconButton
                      onClick={() => handleRejectRequest(meetup.request_id)}
                      sx={{
                        color: "#6b4605",
                        "&:hover": { color: "#543405" },
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        zIndex: 1, // Ensure it appears above other elements
                      }}
                    >
                      <CancelIcon fontSize="medium" />
                    </IconButton>
                  )}
                </CardContent>

                {view === 'my' && (
                  <CardActions sx={{ justifyContent: "flex-end", padding: "8px 16px" }}>
                    <IconButton
                      onClick={() => handleEditClick(meetup)}
                      sx={{
                        color: "#6b4605",
                        "&:hover": { color: "#543405" },
                      }}
                    >
                      <EditIcon fontSize="medium" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(meetup.meetup_id)}
                      sx={{
                        color: "#6b4605",
                        "&:hover": { color: "#543405" },
                      }}
                    >
                      <DeleteIcon fontSize="medium" />
                    </IconButton>
                    <IconButton
                      onClick={() => openInviteDialog(meetup)}
                      sx={{
                        color: "#543405",
                        "&:hover": { color: "#3a2e24" },
                      }}
                    >
                      <GroupAddIcon fontSize="medium" />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))
        ) : (
          currentUser.type === 'regular' && (
            <div className="centered-message">
              <p>
                {view === 'all'
                  ? "No meetups found. Start by creating a new meetup or add friends."
                  : "You haven't created any meetups yet. Click 'Create Meetup' to get started."}
              </p>
            </div>
          )
        )}
      </Grid>

    <Dialog open={showInviteDialog} onClose={closeInviteDialog} fullWidth maxWidth="sm">
        <DialogTitle>Select Friends to Invite</DialogTitle>
        <DialogContent 
        sx={{
          minHeight: "400px", // Adjust this value to make the content area larger
          overflowY: "auto", // Adds scroll if the content overflows
          width: "91%",
        }}>
          <List
          sx={{
            maxHeight: "350px", // Set a maximum height for the list
            overflowY: "auto", // Enable scrolling when the list overflows
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: friends.length === 0 ? "center" : "flex-start",
          }}
        >
          {friends.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: "center", fontSize: 18, marginTop: "190px"}}>
              All your friends have been invited.
            </Typography>
          ) : (
            friends.map((friend) => (
              <ListItem
                button
                key={friend.id}
                onClick={() => handleFriendSelect(friend.id)}
                sx={{
                  backgroundColor: selectedFriends.includes(friend.id) ? "#f5ebe1" : "transparent",
                  boxShadow: selectedFriends.includes(friend.id) ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "none",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": { backgroundColor: "#e1c7ad" },
                  borderRadius: "8px",
                  marginBottom: "8px",
                  width: "100%", // Ensure full width for list items
                }}
              >
                <Avatar
                  src={friend.profilePic}
                  alt={friend.name}
                  sx={{ marginRight: "10px" }}
                />
                <ListItemText primary={friend.name} />
              </ListItem>
            ))
          )}
        </List>

        </DialogContent>
        <div style={{ padding: "16px", textAlign: "right" }}>
          <Button
            onClick={handleShareMeetup}
            variant="contained"
            sx={{
              backgroundColor: "#27ae60",
              color: "#ffffff",
              marginRight: "50px",
              "&:hover": { backgroundColor: "#1e8449" },
            }}
          >
            Invite
          </Button>
          <Button
            onClick={closeInviteDialog}
            variant="outlined"
            sx={{
              color: "#27ae60",
              borderColor: "#27ae60",
              "&:hover": { borderColor: "#1e8449", color: "#1e8449" },
            }}
          >
            Cancel
          </Button>
        </div>
      </Dialog>

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <CreateMeetupForm onClose={closeModal} onSuccess={handleCreateSuccess}/>
          </div>
        </div>
      )}

      {showUpdateForm && editingMeetup && (
        <div className="modal">
          <div className="modal-content">
            <UpdateMeetupForm meetup={editingMeetup} onClose={closeModal} />
          </div>
        </div>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? 'error' : 'success'}
          sx={{
            width: '100%',
            backgroundColor: error ? '#ff7961' : '#4caf50', // Example custom colors
            color: '#ffffff' // Text color
          }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserMeetUp;