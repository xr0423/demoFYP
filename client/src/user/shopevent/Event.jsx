import React, { useContext } from "react";
import { makeRequest } from "../../axios";
import {
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  EventAvailable as EventAvailableIcon,
  People as PeopleIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
} from "@mui/icons-material";
import "./event.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const Event = ({ event, onOpenModal, onUpgradePlan, onFetchJoinedUsers }) => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Fetch joined events and check if the current user has joined
  const { data: joinedEvents = [] } = useQuery({
    queryKey: ["joinedEvents", event.id],
    queryFn: () =>
      makeRequest
        .get(`/events/joined-events?event_id=${event.id}`)
        .then((res) => res.data),
  });

  const isJoined = joinedEvents.some((user) => user.user_id === currentUser.id);

  const mutation = useMutation({
    mutationFn: (joining) =>
      joining
        ? makeRequest.delete(`/events/quit?event_id=${event.id}`)
        : makeRequest.post(`/events/join?event_id=${event.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["joinedEvents", event.id]);
    },
  });

  const handleJoin = () => mutation.mutate(isJoined);

  return (
    <div className="event-item">
      <div className="event-detail">
        {event.img && (
          <img
            src={
              event.img ? `/upload/${event.img}` : "/upload/default-empty.jpg"
            }
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
          <strong>Start Date & Time:</strong>{" "}
          {new Date(event.start).toLocaleDateString()} -{" "}
          {new Date(event.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
          <br />
          <strong>End Date & Time:</strong>{" "}
          {new Date(event.end).toLocaleDateString()} -{" "}
          {new Date(event.end).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      </div>
      <div className="event-detail">
        <PeopleIcon />
        <div>
          <strong>Capacity: </strong> {event.occupied}/{event.capacity}
          <IconButton
            onClick={() => onFetchJoinedUsers(event.id)} // Fetch and display joined users
          >
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

      {/* Pass T&C data to the parent component */}
      <div className="event-detail">
        <Button
          variant="text"
          onClick={() => onOpenModal(event.tnc)} // Call the parent function to open T&C modal
          className="tnc-button"
        >
          Terms and Conditions
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="action-btn">
        {/* Show Join/Quit Button if the user has a subscriptionId of 2 */}
        {((currentUser?.type === "regular" && event.exclusive === "public") ||
          currentUser?.type === "expert" ||
          currentUser?.subscriptionId === 2) && (
          <Button
            variant={isJoined ? "outlined" : "contained"}
            className={isJoined ? "quitBtn" : "joinBtn"}
            onClick={handleJoin}
          >
            {isJoined ? "Quit" : "Join"}
          </Button>
        )}

        {/* Show Upgrade Plan button for regular users with subscriptionId of 1 */}
        {currentUser?.type === "regular" &&
          currentUser?.subscriptionId === 1 &&
          event.exclusive === "exclusive" && (
            <button
              className="upgrade-plan-btn"
              onClick={onUpgradePlan} // Call the parent upgrade plan handler
              style={{
                position: "absolute",
                right: "10px",
                bottom: "10px",
                backgroundColor: "#5C4033",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              }}
            >
              Upgrade Plan
            </button>
          )}
      </div>
    </div>
  );
};

export default Event;
