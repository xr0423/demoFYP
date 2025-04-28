import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import LabelIcon from "@mui/icons-material/Label";
import CreateMeetupForm from "../../components/createMeetupForm/CreateMeetupForm"; // Import the form component
import "./events.scss";

const Events = ({ shopId }) => {
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [showCreateMeetupModal, setShowCreateMeetupModal] = useState(false); // State to show/hide modal
  const [selectedEvent, setSelectedEvent] = useState(null); // Store the event for which the form is opened
  const queryClient = useQueryClient();

  // Fetch events based on shopId
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ["events", shopId],
    queryFn: () =>
      makeRequest.get(`/events?shopId=${shopId}`).then((res) => res.data),
    enabled: !!shopId,
  });

  // Mutation to handle join/quit requests
  const joinOrQuitEvent = useMutation({
    mutationFn: ({ eventId, isJoining }) =>
      isJoining
        ? makeRequest.post(`/events/join?event_id=${eventId}`)
        : makeRequest.delete(`/events/quit?event_id=${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["events", shopId]);
    },
  });

  // Handle join button click
  const handleJoin = (event) => {
    const isJoined = joinedEvents.includes(event.id);

    // Update the capacity locally to reflect the user's action
    const updatedEventsData = eventsData.map((e) => {
      if (e.id === event.id) {
        return {
          ...e,
          occupied: isJoined ? e.occupied - 1 : e.occupied + 1,
        };
      }
      return e;
    });

    // Update local state for the joined event
    if (isJoined) {
      setJoinedEvents((prev) => prev.filter((id) => id !== event.id));
    } else {
      setJoinedEvents((prev) => [...prev, event.id]);
    }

    // Make the backend request to join or quit
    joinOrQuitEvent.mutate({ eventId: event.id, isJoining: !isJoined });
  };

  // Handle "Create Meet Up" button click
  const handleCreateMeetupClick = (event) => {
    setSelectedEvent(event);
    setShowCreateMeetupModal(true);
  };

  // Close modal handler
  const closeModal = () => {
    setShowCreateMeetupModal(false);
    setSelectedEvent(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching events: {error.message}</div>;

  return (
    <div className="user-event-page">
      <h2>Coffee Events</h2>
      {eventsData && eventsData.length > 0 ? (
        <ul className="event-list">
          {eventsData.map((event) => (
            <li className="event-card" key={event.id}>
              <div className="event-header">
                <h3>{event.title}</h3>
                <div className="event-type">
                  <LabelIcon className="icon" />
                  <span>{event.type_name}</span>
                </div>
              </div>

              <div className="event-details">
                <div className="event-detail">
                  <LocationOnIcon className="icon" />
                  <strong>Shop Name:</strong>
                  <span>{event.shop_name}</span>
                </div>
                <div className="event-detail">
                  <AttachMoneyIcon className="icon" />
                  <strong>Price:</strong>
                  <span>${parseFloat(event.price).toFixed(2)}</span>
                </div>
                <div className="event-detail">
                  <EventIcon className="icon" />
                  <div className="info">
                    <div>
                      <strong>Date:</strong>
                      <span>{new Date(event.start).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <strong>Time:</strong>
                      <span>
                        {new Date(event.start).toLocaleTimeString()} -{" "}
                        {new Date(event.end).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="event-detail">
                  <PeopleIcon className="icon" />
                  <strong>Capacity:</strong>
                  <span>
                    {event.occupied}/{event.capacity}
                  </span>
                </div>
              </div>

              <div className="event-actions">
                <button
                  className={`join-btn ${joinedEvents.includes(event.id) ? "quit" : ""}`}
                  onClick={() => handleJoin(event)}
                >
                  {joinedEvents.includes(event.id) ? "QUIT" : "JOIN"}
                </button>
                <button
                  className="create-meetup-btn"
                  onClick={() => handleCreateMeetupClick(event)}
                >
                  CREATE MEET UP
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available</p>
      )}

      {/* Conditionally render the CreateMeetupForm modal */}
      {showCreateMeetupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateMeetupForm
              onClose={closeModal}
              event={selectedEvent.title}
              shop={selectedEvent.shop_name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
