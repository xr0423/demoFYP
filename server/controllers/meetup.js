import moment from "moment/moment.js";
import { db } from "../connect.js"; // Assuming your db connection file is named connect.js
import jwt from "jsonwebtoken";
import { DataTypes } from "sequelize";

// Create Meetup
export const createMeetup = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  const queries = {
    insertMeetup:
      "INSERT INTO meetup (user_id, title, description, startDate_Time, endDate_Time, shop_id) VALUES (?, ?, ?, ?, ?, ?)",
    checkTimeRange:
      "SELECT * FROM meetup WHERE user_id = ? AND ((startDate_Time <= ? AND endDate_Time >= ?) OR (startDate_Time <= ? AND endDate_Time >= ?))",
    getShopId: "SELECT shop_id FROM shoplistings WHERE name = ?",
    getActivityType: "SELECT id FROM activitytype WHERE type_name = ?",
    insertActivity: "INSERT INTO activity (user_id, type_id) VALUES (?, ?)",
  };

  try {
    console.log("Request body:", req.body);
    const userInfo = jwt.verify(token, "secretkey");
    const { title, description, startDate_Time, endDate_Time, shop_id } =
      req.body;

    let shopId = parseInt(shop_id, 10);

    // Validate shop ID if not an integer
    if (!Number.isInteger(shopId)) {
      const [shopResult] = await db.query(queries.getShopId, [shop_id]);
      shopId = shopResult[0]?.shop_id;
      if (!shopId) throw new Error("Shop ID not found.");
    }
    console.log("Shop ID:", shopId);

    // Check for overlapping meetups
    const [timeConflict] = await db.query(queries.checkTimeRange, [
      userInfo.id,
      startDate_Time,
      startDate_Time,
      endDate_Time,
      endDate_Time,
    ]);
    if (timeConflict.length > 0) {
      return res
        .status(409)
        .json("Meetup time range conflicts with another meetup.");
    }

    // Insert meetup
    await db.query(queries.insertMeetup, [
      userInfo.id,
      title,
      description,
      startDate_Time,
      endDate_Time,
      shopId,
    ]);

    // Log activity
    const [activityTypeResult] = await db.query(queries.getActivityType, [
      "meetup creation",
    ]);
    const activityTypeId = activityTypeResult[0]?.id;
    if (activityTypeId) {
      await db.query(queries.insertActivity, [userInfo.id, activityTypeId]);
    }

    return res.status(200).json("Meetup has been created");
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res
      .status(500)
      .json({ error: "Database error", details: err.message });
  }
};

export const getMeetUp = async (req, res) => {
  // Query for meetups created and accepted by the user with status_id = 5
  const getAllMeetUpQuery = `
  SELECT m.*, s.name AS shop_name, e.title AS event_title, u.username, mr.sender_id, mr.request_id,
  CASE WHEN m.user_id = ? THEN 1 ELSE 0 END AS isOwnMeetup
    FROM meetup m
    LEFT JOIN shoplistings s ON m.shop_id = s.shop_id
    LEFT JOIN event e ON m.event_id = e.id
    LEFT JOIN users u ON m.user_id = u.id
    LEFT JOIN meetuprequest mr ON (mr.meetup_id = m.meetup_id AND mr.recipient_Id = ?)
    WHERE m.user_id = ? OR  mr.status_id = 5
    ORDER BY m.startDate_Time ASC;
  `;

  // Query to get meetups created only by the user
  const getOwnMeetUpQuery = `
    SELECT m.*, s.name AS shop_name, e.title AS event_title
    FROM meetup m
    LEFT JOIN shoplistings s ON m.shop_id = s.shop_id
    LEFT JOIN event e ON m.event_id = e.id
    WHERE m.user_id = ?;
  `;

  const token = req.cookies.accessToken;

  // Check if the user is logged in
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the token
    const userInfo = jwt.verify(token, "secretkey");
    const { userId } = req.query;

    if (userId) {
      // If `userId` is provided, get the user's own meetups
      const [data] = await db.query(getOwnMeetUpQuery, [userId]);
      return res.status(200).json(data);
    } else {
      // Get all meetups created and accepted by the current user (status_id = 5)
      const [data] = await db.query(getAllMeetUpQuery, [
        userInfo.id,
        userInfo.id,
        userInfo.id,
      ]);
      return res.status(200).json(data);
    }
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res
      .status(500)
      .json({ error: "Database error", details: err.message });
  }
};

export const deleteMeetup = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    // Step 1: Fetch the title of the meetup and participants
    const meetupQuery = `
      SELECT title 
      FROM meetup 
      WHERE meetup_id = ? AND user_id = ?
    `;
    const [meetupResult] = await db.query(meetupQuery, [
      req.query.meetup_id,
      userInfo.id,
    ]);

    if (meetupResult.length === 0) {
      return res.status(404).json("Meetup not found or unauthorized");
    }

    const meetupTitle = meetupResult[0].title;

    const participantsQuery = `
      SELECT recipient_id 
      FROM meetuprequest 
      WHERE meetup_id = ?
    `;
    const [participants] = await db.query(participantsQuery, [
      req.query.meetup_id,
    ]);
    const participantIds = participants.map((row) => row.recipient_id);

    // Step 2: Delete the meetup
    const deleteQuery = `
      DELETE FROM meetup 
      WHERE meetup_id = ? AND user_id = ?
    `;
    const [data] = await db.query(deleteQuery, [
      req.query.meetup_id,
      userInfo.id,
    ]);

    if (data.affectedRows === 0) {
      return res.status(404).json("Meetup not found or unauthorized");
    }

    // Step 3: Notify all participants about the deletion
    if (participantIds.length > 0) {
      const notificationQuery = `
        INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`meetup_name\`)
        VALUES (?, ?, ?, ?)
      `;
      const notificationPromises = participantIds.map((recipientId) =>
        db.query(notificationQuery, [
          recipientId, // The recipient of the notification
          userInfo.id, // The user who deleted the meetup
          "meetup deleted", // Notification type
          meetupTitle, // The title of the meetup
        ])
      );
      await Promise.all(notificationPromises);
    }

    return res
      .status(200)
      .json("Meetup deleted and participants notified about the deletion");
  } catch (err) {
    console.error("Error deleting meetup:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const getMeetupRelatedData = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify token
    const userInfo = jwt.verify(token, "secretkey");

    // SQL queries to fetch related data: shop names (active only) and event names
    const shopQuery = `SELECT shop_id, name AS shop_name FROM shoplistings WHERE status_id = 1 ORDER BY name ASC`; // Fetch only active shops
    const eventQuery = `SELECT id AS event_id, start_datetime, end_datetime, title AS event_name, shop_id FROM event ORDER BY title ASC`;

    // Execute both queries concurrently using Promise.all for better performance
    const [shops, events] = await Promise.all([
      db.query(shopQuery),
      db.query(eventQuery),
    ]);

    // Return the related data for active shop listings and events
    return res.status(200).json({
      shops: shops[0], // The first index contains the query results
      events: events[0],
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json({ error: "Server error", details: err });
  }
};

// Update Meetup
export const updateMeetup = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const meetupId = req.params.meetupId;
    const { title, description, startDate_Time, endDate_Time, shop_id } =
      req.body;

    // Queries
    const checkTimeConflictQuery = `
      SELECT * 
      FROM meetup 
      WHERE user_id = ? 
      AND meetup_id != ? 
      AND ((startDate_Time <= ? AND endDate_Time >= ?) OR (startDate_Time <= ? AND endDate_Time >= ?))
    `;

    const updateMeetupQuery = `
      UPDATE meetup
      SET title = ?, description = ?, startDate_Time = ?, endDate_Time = ?, shop_id = ?
      WHERE meetup_id = ? AND user_id = ?
    `;

    const participantsQuery = `
      SELECT recipient_id 
      FROM meetuprequest 
      WHERE meetup_id = ? AND status_id = 5
    `;

    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`meetup_name\`)
      VALUES (?, ?, ?, ?)
    `;

    // Step 1: Check for overlapping meetups
    const [timeConflict] = await db.query(checkTimeConflictQuery, [
      userInfo.id,
      meetupId,
      startDate_Time,
      startDate_Time,
      endDate_Time,
      endDate_Time,
    ]);

    if (timeConflict.length > 0) {
      return res
        .status(409)
        .json("Meetup time range conflicts with another meetup.");
    }

    // Step 2: Execute the update
    const values = [
      title,
      description,
      startDate_Time,
      endDate_Time,
      shop_id,
      meetupId,
      userInfo.id,
    ];

    const [result] = await db.query(updateMeetupQuery, values);

    if (result.affectedRows === 0) {
      return res.status(404).json("Meetup not found or not authorized.");
    }

    // Step 3: Log the activity
    const [activityId] = await db.query(
      `SELECT id FROM activitytype WHERE type_name = ?`,
      ["meetup update"]
    );
    await db.query(`INSERT INTO activity(user_id, type_id) VALUES(?, ?)`, [
      userInfo.id,
      activityId[0].id,
    ]);

    // Step 4: Fetch all participants with status_id = 5
    const [participants] = await db.query(participantsQuery, [meetupId]);
    const participantIds = participants.map((row) => row.recipient_id);

    // Step 5: Notify participants about the update
    if (participantIds.length > 0) {
      const notificationPromises = participantIds.map((recipientId) =>
        db.query(notificationQuery, [
          recipientId, // The recipient of the notification
          userInfo.id, // The user updating the meetup
          "meetup updated", // Notification type
          title,
        ])
      );
      await Promise.all(notificationPromises);
    }

    return res
      .status(200)
      .json("Meetup has been updated and participants notified");
  } catch (err) {
    console.error("Error updating meetup:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }

    // Send the error message to the frontend
    return res.status(500).json({ details: err.message });
  }
};

export const getMeetUpRequests = async (req, res) => {
  const token = req.cookies.accessToken;
  const { recipientId, meetupId } = req.query;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify token
    const userInfo = jwt.verify(token, "secretkey");

    const Query = `
    SELECT 
      mr.request_id, 
      mr.meetup_id, 
      m.title AS meetup_title, 
      m.description, 
      m.startDate_Time, 
      m.endDate_Time, 
      st.status_name,
      s.name AS shop_name, 
      e.title AS event_title, 
      u.name AS sender_name, 
      u.email AS sender_email, 
      mr.sent_at 
    FROM meetuprequest mr
    JOIN meetup m ON mr.meetup_id = m.meetup_id 
    LEFT JOIN shoplistings s ON m.shop_id = s.shop_id 
    LEFT JOIN event e ON m.event_id = e.id 
    JOIN users u ON mr.sender_id = u.id 
    JOIN status st ON mr.status_id = st.id
    WHERE mr.recipient_id = ?
    AND status_name != "accepted"
    ORDER BY mr.sent_at DESC
    `;

    const Query2 = `SELECT request_id, recipient_id, meetup_id FROM meetuprequest WHERE meetup_id = ?`;

    let values = [];
    if (recipientId) {
      values = [recipientId];
      const [result] = await db.query(Query, values);
      return res.status(200).json(result);
    } else if (meetupId) {
      values = [meetupId];
      const [result] = await db.query(Query2, values);
      // console.log(result)
      return res.status(200).json(result);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching meetup requests" });
  }
};

export const addMeetUpRequests = async (req, res) => {
  const { meetup_id, sender_id, recipient_id } = req.body;

  try {
    // Check if the meetup request already exists
    const [response] = await db.query(
      "SELECT * FROM meetuprequest WHERE meetup_id = ? AND sender_id = ? AND recipient_id = ?",
      [meetup_id, sender_id, recipient_id]
    );

    const [data] = await db.query(
      `SELECT id FROM status WHERE status_name = ?`,
      ["pending"]
    );
    const status_id = data[0].id;

    if (response.length > 0) {
      return res.status(201).json("");
    }

    // Insert the meetup request
    await db.query(
      "INSERT INTO meetuprequest (meetup_id, sender_id, recipient_id, status_id) VALUES (?, ?, ?, ?)",
      [meetup_id, sender_id, recipient_id, status_id]
    );

    // Fetch the title of the meetup
    const [meetupResult] = await db.query(
      "SELECT title FROM meetup WHERE meetup_id = ?",
      [meetup_id]
    );

    if (meetupResult.length === 0) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    const meetupName = meetupResult[0].title;

    // Add a notification for the recipient
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`meetup_name\`)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(notificationQuery, [
      recipient_id, // The recipient of the meetup request
      sender_id, // The sender of the meetup request
      "meetup request", // Notification type
      meetupName, // The name (title) of the meetup
    ]);

    res.status(201).json({ message: "Meetup request sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error sending meetup request" });
  }
};

export const rejectMeetUpRequests = async (req, res) => {
  const token = req.cookies.accessToken;
  const { requestId } = req.query;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    await db.query("DELETE FROM meetuprequest WHERE request_id = ?", [
      requestId,
    ]);
    // add activity
    res.status(200).json({ message: "Meetup request rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject meetup request" });
  }
};

export const acceptMeetUpRequests = async (req, res) => {
  const token = req.cookies.accessToken;
  const { requestId, meetupId } = req.query;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify token
    const userInfo = jwt.verify(token, "secretkey");

    // Update the request status to accepted
    await db.query(
      `
      UPDATE meetuprequest 
      SET status_id = 5
      WHERE request_id = ? AND meetup_id = ?
    `,
      [requestId, meetupId]
    );

    // Log the activity
    const [activityId] = await db.query(
      `SELECT id FROM activitytype WHERE type_name = ?`,
      ["meetup invitation accepted"]
    );
    await db.query(`INSERT INTO activity(user_id, type_id) VALUES(?, ?)`, [
      userInfo.id,
      activityId[0].id,
    ]);

    // Fetch the sender of the meetup request
    const [request] = await db.query(
      `SELECT sender_id FROM meetuprequest WHERE request_id = ?`,
      [requestId]
    );

    if (request.length === 0) {
      return res.status(404).json({ message: "Meetup request not found" });
    }

    const sender_id = request[0].sender_id;

    // Fetch the title of the meetup
    const [meetupResult] = await db.query(
      `SELECT title FROM meetup WHERE meetup_id = ?`,
      [meetupId]
    );

    if (meetupResult.length === 0) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    const meetupName = meetupResult[0].title;

    // Add a notification for the sender
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`meetup_name\`)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(notificationQuery, [
      sender_id, // Recipient (sender of the original request)
      userInfo.id, // The user accepting the meetup request
      "meetup accepted", // Notification type
      meetupName, // The name (title) of the meetup
    ]);

    return res
      .status(200)
      .json({ message: "Meetup request accepted, notification sent." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error accepting meetup request" });
  }
};

export const getRequests = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    // Verify the token
    const userInfo = jwt.verify(token, "secretkey");

    // Fetch pending meetup requests
    const [data] = await db.query(
      `SELECT * FROM meetuprequest mr
       JOIN status s ON s.id = mr.status_id
       WHERE s.status_name = ?
       AND recipient_id = ?;`,
      ["pending", userInfo.id]
    );

    // Return the data
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching meetup requests:", err); // Log the error for debugging
    res.status(500).json("Failed to fetch requests");
  }
};
