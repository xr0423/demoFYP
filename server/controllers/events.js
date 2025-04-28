import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getEventRelatedData = async (req, res) => {
  const EventTypeQuery = `SELECT * FROM eventtype ORDER BY id ASC`;
  const ShopListingsQuery = `SELECT shop_id, name FROM shoplistings ORDER BY shop_id ASC`;

  try {
    // Check if the user is logged in by verifying the token
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json("Not Logged In!");
    }

    // Verify the token
    const userInfo = jwt.verify(token, "secretkey");

    // Perform both database queries using async/await
    const [eventTypes] = await db.query(EventTypeQuery);
    const [shops] = await db.query(ShopListingsQuery);

    // Combine the data and return in a single response
    return res.status(200).json({
      eventTypes,
      shops,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }

    // Handle database and server errors
    return res.status(500).json({ error: "Server error", details: err });
  }
};

export const getEvents = async (req, res) => {
  const token = req.cookies.accessToken;

  // Check if the user is logged in
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the token
    const userInfo = jwt.verify(token, "secretkey");

    // Extract query parameters (optional ownerId, eventId, and shopId)
    const { ownerId, id: eventId, shopId, user } = req.query;

    // Initialize the base query
    let q = `
      SELECT 
        e.id, 
        e.title,
        e.img, 
        e.type_id,
        t.type_name,
        e.description,
        e.start_datetime AS start, 
        e.end_datetime AS end, 
        e.capacity,
        (SELECT COUNT(user_id) FROM UserJoinedEvent WHERE event_id = e.id) AS occupied,
        e.price,
        u.username,
        s.name AS shop_name,
        s.shop_id,
        e.created_on,
        e.status,
        e.exclusive,
        e.tnc
      FROM event e 
      JOIN eventtype t ON e.type_id = t.id
      JOIN users u ON e.owner_id = u.id
      JOIN shoplistings s ON e.shop_id = s.shop_id
    `;

    let queryParams = [];

    // Check if a specific event ID is provided (for fetching event by ID)
    if (eventId) {
      q += `WHERE e.id = ? `;
      queryParams.push(eventId);
    } else if (ownerId) {
      // If ownerId is provided (for fetching events by owner)
      q += `WHERE e.owner_id = ? `;
      queryParams.push(ownerId);
    } else if (shopId) {
      // If shopId is provided (for fetching events by shop)
      q += `WHERE e.shop_id = ? `;
      queryParams.push(shopId);
    }

    if (user) {
      if (queryParams.length > 0) {
        q += `AND e.start_datetime > NOW() `;
      } else {
        q += `WHERE e.start_datetime > NOW()  `;
      }
    }

    // Add order by clause (only when fetching multiple events)
    if (!eventId) {
      q += `ORDER BY e.start_datetime ASC`;
    }

    // Execute the query
    const [eventsData] = await db.query(q, queryParams);

    // Handle the response based on the type of request
    if (eventId && eventsData.length === 0) {
      return res.status(200).json([]);
    }

    // console.log(eventsData);

    // Return the data (single event or list of events)
    return res.status(200).json(eventId ? eventsData[0] : eventsData);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json({ error: "Database error", details: err });
  }
};
export const getEventTypes = async (req, res) => {
  const EventTypeQuery = "SELECT * FROM eventtype ORDER BY id ASC";

  try {
    const [eventTypes] = await db.query(EventTypeQuery);
    return res.status(200).json({ eventTypes });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err });
  }
};

export const addEvent = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the token
    const userInfo = jwt.verify(token, "secretkey");

    // Extract event details from request
    const {
      title,
      type_id,
      img,
      desc,
      start_datetime,
      end_datetime,
      capacity,
      price,
      shop_id,
      exclusive,
      tnc,
    } = req.body;

    // Check for required fields
    if (
      !title ||
      !desc ||
      !start_datetime ||
      !end_datetime ||
      !capacity ||
      !price ||
      !tnc
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "Please fill in all required fields: title, description, start time, end time, capacity, price, and terms & conditions.",
      });
    }

    // Convert dates to standardized format
    const formattedStart = moment(start_datetime).format("YYYY-MM-DD HH:mm:ss");
    const formattedEnd = moment(end_datetime).format("YYYY-MM-DD HH:mm:ss");

    // Check if the new event's times overlap with any existing events for the same shop
    const checkConflictQuery = `
      SELECT id FROM event 
      WHERE shop_id = ? 
      AND (
        (start_datetime < ? AND end_datetime > ?) OR
        (start_datetime < ? AND end_datetime > ?) OR
        (start_datetime >= ? AND end_datetime <= ?)
      )
    `;

    const [conflictingEvents] = await db.query(checkConflictQuery, [
      shop_id,
      formattedEnd,
      formattedStart,
      formattedEnd,
      formattedStart,
      formattedStart,
      formattedEnd,
    ]);

    if (conflictingEvents.length > 0) {
      // If there's a conflict, return a specific error message
      return res.status(409).json({
        error: "Time conflict",
        message: "The selected times conflict with an existing event.",
      });
    }

    // SQL query to insert event data
    const insertQuery = `
      INSERT INTO event (title, type_id, img, description, start_datetime, end_datetime, capacity, price, owner_id, shop_id, exclusive, tnc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      title,
      type_id,
      img,
      desc,
      formattedStart,
      formattedEnd,
      capacity,
      price,
      userInfo.id, // owner_id is the logged-in user
      shop_id,
      exclusive,
      tnc,
    ];

    // Execute the insertion query
    await db.query(insertQuery, values);

    // Return success response if no conflict is detected and the event is created
    return res.status(200).json({ message: "Event has been created" });
  } catch (err) {
    console.error("Database or token verification error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create event", details: err });
  }
};


// delete event
export const deleteEvent = async (req, res) => {
  const token = req.cookies.accessToken;

  // Check if token is provided
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the user's token
    const userInfo = jwt.verify(token, "secretkey");

    // Get the event ID from the query parameters
    const { id } = req.query;
    if (!id) return res.status(400).json("Event ID is required");

    // Check if the event exists and is owned by the user
    const eventQuery = "SELECT shop_id FROM event WHERE `id` = ? AND `owner_id` = ?";
    const [eventResult] = await db.query(eventQuery, [id, userInfo.id]);

    if (eventResult.length === 0) {
      return res.status(404).json("Event not found or you're not authorized to delete it");
    }

    const shop_id = eventResult[0].shop_id;

    // Notify all users who joined the event and include refund
    const joinedUsersQuery = `
      SELECT uje.user_id AS receiver, e.price AS refund 
      FROM userjoinedEvent uje
      JOIN event e ON uje.event_id = e.id
      WHERE uje.event_id = ?;
    `;
    const [joinedUsers] = await db.query(joinedUsersQuery, [id]);

    if (joinedUsers.length > 0) {
      const notificationValues = joinedUsers.map((user) => [
        user.receiver,          // Receiver (user who joined the event)
        userInfo.id,            // Sender (owner who deleted the event)
        "owner delete event",   // Notification type
        shop_id,                // Associated shop ID
        user.refund,            // Refund amount from the Event table's price column
      ]);

      const notificationQuery = `
        INSERT INTO allnotification (receiver, from_id, type, shop_id, refund)
        VALUES ?;
      `;

      await db.query(notificationQuery, [notificationValues]);
    }

    // SQL query to delete the event
    const deleteQuery = "DELETE FROM event WHERE `id` = ? AND `owner_id` = ?";
    const [deleteResult] = await db.query(deleteQuery, [id, userInfo.id]);

    // Check if the event was found and deleted
    if (deleteResult.affectedRows > 0) {
      console.log(`Event ${id} has been deleted by owner ${userInfo.id}`);
      return res.status(200).json("Event has been deleted and notifications sent with refunds.");
    } else {
      return res.status(403).json("No Event found");
    }
  } catch (err) {
    // Handle JWT errors or other exceptions
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    // Handle any other errors (e.g., database errors)
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const updateEvent = async (req, res) => {
  console.log(req.body);
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the user's token
    const userInfo = jwt.verify(token, "secretkey");

    // Event ID from query
    const { id } = req.query; // Event ID from the URL
    if (!id) return res.status(400).json("Event ID is required");

    // Destructure the event details from the request body
    const {
      title,
      img,
      desc,
      price,
      capacity,
      type_id,
      shop_name,
      exclusive,
      tnc,
    } = req.body;

    const start_datetime = moment(req.body.start_datetime).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const end_datetime = moment(req.body.end_datetime).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    // Check for required fields
    if (
      !title ||
      !desc ||
      !start_datetime ||
      !end_datetime ||
      !capacity ||
      !price ||
      !tnc
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "Please fill in all required fields: title, description, start time, end time, capacity, price, and terms & conditions.",
      });
    }

    // First, get the shop_id based on the provided shop_name
    const shopQuery = `SELECT shop_id FROM shoplistings WHERE name = ?`;
    const [shopResult] = await db.query(shopQuery, [shop_name]);

    if (shopResult.length === 0) {
      return res.status(404).json("Shop not found");
    }

    const shop_id = shopResult[0].shop_id;

    // Check for time conflicts with other events at the same shop
    const conflictQuery = `
      SELECT * FROM event
      WHERE shop_id = ? AND id != ? AND (
        (start_datetime < ? AND end_datetime > ?) OR
        (start_datetime < ? AND end_datetime > ?)
      )
    `;
    const [conflictingEvents] = await db.query(conflictQuery, [
      shop_id,
      id,
      end_datetime,
      start_datetime,
      start_datetime,
      end_datetime,
    ]);

    if (conflictingEvents.length > 0) {
      return res.status(409).json({
        error: "Time conflict",
        message: "The updated times conflict with another event at this shop.",
      });
    }

    // SQL query to update the event details
    const updateQuery = `
      UPDATE event
      SET 
        title = ?, 
        img = ?,
        description = ?, 
        start_datetime = ?, 
        end_datetime = ?, 
        price = ?, 
        capacity = ?, 
        type_id = ?, 
        shop_id = ?,
        exclusive = ?,
        tnc = ?
      WHERE id = ? AND owner_id = ?;
    `;

    const values = [
      title,
      img,
      desc,
      start_datetime,
      end_datetime,
      price,
      capacity,
      type_id,
      shop_id,
      exclusive,
      tnc,
      id,
      userInfo.id,
    ];

    // Execute the update query
    const [result] = await db.query(updateQuery, values);

    // Check if the event was found and updated
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json("Event not found or you're not authorized to update it");
    }

    // Notify all users who joined the event
    const joinedUsersQuery = `SELECT user_id AS receiver FROM userjoinedevent WHERE event_id = ?`;
    const [joinedUsers] = await db.query(joinedUsersQuery, [id]);

    if (joinedUsers.length > 0) {
      const notificationValues = joinedUsers.map((user) => [
        user.receiver, // Receiver (user who joined the event)
        userInfo.id, // Sender (owner who updated the event)
        "owner update event", // Notification type
        shop_id, // Associated shop ID
      ]);

      const notificationQuery = `
        INSERT INTO allnotification (receiver, from_id, type, shop_id)
        VALUES ?;
      `;

      await db.query(notificationQuery, [notificationValues]);
    }

    return res.status(200).json("Event updated successfully and notifications sent.");
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const getUserEventStatus = async (req, res) => {
  const { event_id } = req.query;

  // Validate the event_id
  if (!event_id) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  try {
    // Check if the event exists
    const [eventExist] = await db.query(`SELECT * FROM event WHERE id = ?`, [
      event_id,
    ]);
    if (eventExist.length === 0) {
      return res.status(404).json("Event not found.");
    }

    // Query to fetch user details (user_id and username) of those who joined the event
    const query = `
      SELECT u.id AS user_id, u.username
      FROM userjoinedevent AS uj
      JOIN users AS u ON uj.user_id = u.id
      WHERE uj.event_id = ?
    `;
    const [joinedUsers] = await db.query(query, [event_id]);

    // Return an array of user details (user_id and username)
    return res.status(200).json(joinedUsers);
  } catch (err) {
    console.error("Database error:", err);
    return res
      .status(500)
      .json({ error: "Database query failed", details: err });
  }
};

export const getUserEvents = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("Not Logged In!");
  }

  try {
    // Verify the user's token
    const userInfo = jwt.verify(token, "secretkey");

    // SQL query to fetch full details of events the user has joined
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_datetime AS start,
        e.end_datetime AS end,
        e.capacity,
        e.price,
        e.img,
        e.exclusive,
        t.type_name,
        s.name AS shop_name
      FROM event e
      JOIN userjoinedevent uje ON e.id = uje.event_id
      JOIN eventtype t ON e.type_id = t.id
      JOIN shoplistings s ON e.shop_id = s.shop_id
      WHERE uje.user_id = ?
      ORDER BY e.start_datetime ASC;
    `;

    const [joinedEvents] = await db.query(query, [userInfo.id]);

    // Return the joined events with full details
    return res.status(200).json(joinedEvents);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Database error:", err);
    return res
      .status(500)
      .json({ error: "Database query failed", details: err });
  }
};

// Join an Event
export const joinEvent = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the user's token
    const userInfo = jwt.verify(token, "secretkey");
    const { event_id } = req.query;

    if (!event_id) {
      return res.status(400).json("Event ID is required.");
    }

    // Check if the event exists
    const [eventExist] = await db.query(`SELECT * FROM event WHERE id = ?`, [
      event_id,
    ]);
    if (eventExist.length === 0) {
      return res.status(404).json("Event not found.");
    }

    const user_id = userInfo.id;

    // Check if the user has already joined the event
    const [userJoined] = await db.query(
      `SELECT * FROM userjoinedevent WHERE user_id = ? AND event_id = ?`,
      [user_id, event_id]
    );
    if (userJoined.length > 0) {
      return res.status(409).json("User already joined the event.");
    }

    // Insert the record into UserJoinedEvent
    const q = `INSERT INTO userjoinedevent (user_id, event_id) VALUES (?, ?)`;
    const values = [user_id, event_id];
    await db.query(q, values);

    return res.status(200).json("User has successfully joined the event.");
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// Quit an Event
export const quitEvent = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the user's token
    const userInfo = jwt.verify(token, "secretkey");
    const { event_id } = req.query;

    if (!event_id) {
      return res.status(400).json("Event ID is required.");
    }

    // Check if the event exists
    const [eventExist] = await db.query(`SELECT * FROM event WHERE id = ?`, [
      event_id,
    ]);
    if (eventExist.length === 0) {
      return res.status(404).json("Event not found.");
    }

    const user_id = userInfo.id;

    // Check if the user has already joined the event
    const [userJoined] = await db.query(
      `SELECT * FROM userjoinedevent WHERE user_id = ? AND event_id = ?`,
      [user_id, event_id]
    );
    if (userJoined.length === 0) {
      return res.status(404).json("User is not joined in this event.");
    }

    // Delete the record from UserJoinedEvent
    const q = `DELETE FROM userjoinedevent WHERE user_id = ? AND event_id = ?`;
    await db.query(q, [user_id, event_id]);

    return res.status(200).json("User has successfully quit the event.");
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const getJoinedEventsByShop = async (req, res) => {
  const { shop_id } = req.query;
  const token = req.cookies.accessToken;

  if (!shop_id) {
    return res.status(400).json({ error: "Shop ID is required" });
  }

  if (!token) {
    return res.status(401).json("Not Logged In!");
  }

  try {
    // Verify the token and extract user info
    const userInfo = jwt.verify(token, "secretkey");

    // SQL query to fetch event_id and event_name
    const query = `
      SELECT 
          e.id AS event_id,
          e.title AS event_title
      FROM event e
      JOIN usejoinedevent uje ON e.id = uje.event_id
      WHERE e.shop_id = ? AND uje.user_id = ?
      GROUP BY e.id, e.title;
    `;

    const [joinedEvents] = await db.query(query, [shop_id, userInfo.id]);

    // Return the joined events with only event_id and event_name
    return res.status(200).json(joinedEvents);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
};
