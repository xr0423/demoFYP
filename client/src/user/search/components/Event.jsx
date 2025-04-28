import React, { useState, useContext } from "react";
import { makeRequest } from "../../../axios";
import {
     LocationOn as LocationOnIcon,
     AttachMoney as AttachMoneyIcon,
     EventAvailable as EventAvailableIcon,
     People as PeopleIcon,
     Label as LabelIcon,
} from "@mui/icons-material";
import "./event.scss";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@mui/material";
import CreateMeetupForm from "../../components/createMeetupForm/CreateMeetupForm";

const Event = ({ key, event }) => {
     const { currentUser } = useContext(AuthContext);
     const [showCreateForm, setShowCreateForm] = useState(false);

     const queryClient = useQueryClient();

     const { data: joinedEvents = [] } = useQuery({
          queryKey: ["joinedEvents", event.id],
          queryFn: () =>
               makeRequest
                    .get(`/events/joined-events?event_id=${event.id}`)
                    .then((res) => res.data),
     });

     const mutation = useMutation({
          mutationFn: (joining) =>
               joining
                    ? makeRequest.delete(`/events/quit?event_id=${event.id}`)
                    : makeRequest.post(`/events/join?event_id=${event.id}`),
          onSuccess: () => queryClient.invalidateQueries(["joinedEvents", event.id]),
     });

     const handleJoin = () => mutation.mutate(joinedEvents.includes(currentUser.id));

     const handleCreateClick = () => setShowCreateForm(true);
     const closeModal = () => setShowCreateForm(false);

     const isJoined = joinedEvents.includes(currentUser.id);

     return (
          <div className="event-item">
               <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="event-type">
                         <LabelIcon />
                         <span>{event.type_name}</span>
                    </div>
               </div>

               <div className="event-detail">
                    <LocationOnIcon />
                    <div>
                         <strong>Shop Name:</strong> {event.shop_name}
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
                         <strong>Date:</strong> {new Date(event.start).toLocaleDateString()}
                         <br />
                         <strong>Time:</strong> {new Date(event.start).toLocaleTimeString()} -{" "}
                         {new Date(event.end).toLocaleTimeString()}
                    </div>
               </div>

               <div className="event-detail">
                    <PeopleIcon />
                    <div>
                         <strong>Capacity:</strong> {event.occupied}/{event.capacity}
                    </div>
               </div>

               <div className="action-btn">
                    <Button
                         variant={isJoined ? "outlined" : "contained"}
                         className={isJoined ? "quitBtn" : "joinBtn"}
                         onClick={handleJoin}
                    >
                         {isJoined ? "Quit" : "Join"}
                    </Button>
                    <Button onClick={handleCreateClick}>Create Meet Up</Button>
               </div>

               {showCreateForm && (
                    <div className="modal">
                         <div className="modal-content">
                              <CreateMeetupForm
                                   onClose={closeModal}
                                   event={event.title}
                                   shop={event.shop_id}
                              />
                         </div>
                    </div>
               )}
          </div>
     );
};

export default Event;