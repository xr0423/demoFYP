import React, { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import "./Event.scss";

const Event = ({ shopId }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await makeRequest.get(`/events?shopId=${shopId}`);
        setEvents(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [shopId]);

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="event-listing">
      <h2>Events at this shop</h2>
      {events && events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <h3>{event.title}</h3>
              <p>Date: {new Date(event.start).toLocaleDateString()}</p>
              <p>Time: {new Date(event.start).toLocaleTimeString()}</p>
              <p>Location: {event.shop_name}</p>
              <p>Price: ${event.price}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available for this shop.</p>
      )}
    </div>
  );
};

export default Event;
