import { ValidationErrorItem } from "sequelize";
import { db } from "../connect.js";
import moment from "moment";
import jwt from "jsonwebtoken";

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "secretkey", (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  const { userId, friendId } = req.query;

  // Validate input
  if (!userId || !friendId) {
    return res.status(400).json({ error: "User ID and Friend ID are required." });
  }

  try {
    // Check if a friend request already exists
    const [isRequestExists] = await db.query(
      `SELECT s.status_name
       FROM friendrequest fr
       JOIN status s ON fr.status_id = s.id
       WHERE sender_id = ? AND recipient_id = ?`,
      [userId, friendId]
    );

    if (isRequestExists.length > 0) {
      return res.status(409).json({ message: "You have already sent a request to this friend." });
    }

    // Fetch the 'pending' status ID
    const [statusResult] = await db.query(
      `SELECT id FROM status WHERE status_name = ?`,
      ["pending"]
    );

    const statusId = statusResult[0].id;

    // Insert the friend request into the database
    const query = `
      INSERT INTO friendrequest (sender_id, recipient_id, status_id)
      VALUES (?, ?, ?)
    `;
    const values = [userId, friendId, statusId];

    await db.query(query, values); // Execute query with parameters

    // Notify the recipient about the friend request
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`)
      VALUES (?, ?, ?)
    `;
    await db.query(notificationQuery, [
      friendId,      // Recipient of the notification
      userId,        // Sender of the friend request
      "friend request" // Notification type
    ]);

    res.status(200).json({ message: "Friend request sent and notification created." });
  } catch (err) {
    console.error("Database Error:", err.message); // Log error for debugging
    res.status(500).json({ error: err.message });
  }
};

// Accept Friend Request
// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  const { userId, friendId } = req.query;

  try {
    // Get the 'accepted' status ID
    const [statusResult] = await db.query(
      `SELECT id FROM status WHERE status_name = ?`,
      ["accepted"]
    );
    const statusId = statusResult[0].id;

    // Check if the friend request exists and its current status
    const [isRequestExists] = await db.query(
      `SELECT status_id
       FROM friendrequest
       WHERE sender_id = ? AND recipient_id = ?`,
      [friendId, userId]
    );

    if (isRequestExists.length === 0) {
      return res.status(404).json({ message: "Friend request not found" });
    } else if (isRequestExists[0].status_id === statusId) {
      return res.status(400).json({ message: "Friend request already accepted" });
    }

    // Update the friend request status to 'accepted'
    const updateQuery = `
      UPDATE friendrequest
      SET status_id = ?
      WHERE sender_id = ? AND recipient_id = ?
    `;
    await db.query(updateQuery, [statusId, friendId, userId]);

    // Add a notification for the requester
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`)
      VALUES (?, ?, ?)
    `;
    await db.query(notificationQuery, [
      friendId,        // Recipient (requester)
      userId,          // Current user accepting the request
      "friend request accepted" // Notification type
    ]);

    res.status(200).json({ message: "Friend request accepted and notification sent" });
  } catch (err) {
    console.error("Error in acceptFriendRequest:", err);
    res.status(500).json({ error: "Failed to accept friend request", details: err.message });
  }
};


// Get Friend Request Status
export const getFriendRequestStatus = async (req, res) => {
  const { userId, friendId } = req.query;

  const queries = {
    friendRequestStatus: `SELECT s.status_name  FROM friendrequest fr JOIN status s ON fr.status_id = s.id WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)`,
    isSender: `SELECT * FROM friendrequest WHERE (sender_id = ? AND recipient_id = ?)`
  }

  try {
    const [friendRequestStatusResult, isSenderResult] = await Promise.all([
      db.query(queries.friendRequestStatus, [userId, friendId, friendId, userId]),
      db.query(queries.isSender, [userId, friendId]),
    ])



    const status = friendRequestStatusResult[0][0] ? friendRequestStatusResult[0][0].status_name : "not followed";
    const isSender = isSenderResult[0].length;

    res.status(200).json({ status: status, isSender: isSender });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get Friend Request
export const getFriendRequest = async (req, res) => {
  const { userId, status } = req.query;

  if (!userId || !status) {
    return res.status(400).json({ message: 'User ID and status are required.' });
  }

  try {
    // SQL query to get friend requests with the specified status for the given userId
    const query = `
      SELECT u.id, u.name, u.email, u.profilePic, ut.type_full_name
      FROM friendrequest fr
      JOIN users u ON fr.sender_id = u.id
      JOIN usertype ut ON u.user_type_id = ut.id
      WHERE fr.recipient_Id = ? AND fr.status_id = ?;
    `;

    // Execute the query
    const [results] = await db.execute(query, [userId, status]);

    // If no requests found
    if (results.length === 0) {
      return res.status(200).json({ requests: "" });
    }
    // Return the list of friend requests
    return res.status(200).json({ requests: results });
  } catch (err) {
    console.error('Error fetching friend requests:', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Cancel Friend Request
export const cancelFriendRequest = async (req, res) => {

  const { userId, friendId } = req.query;
  try {
    const query = `
      DELETE FROM friendrequest
      WHERE
        (sender_id = ? AND recipient_id = ? )
        OR
        (sender_id = ? AND recipient_id = ?)
    `;

    const [result] = await db.execute(query, [userId, friendId, friendId, userId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Friend request canceled successfully" });
    } else {
      res.status(404).json({ error: "Friend request not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Remove Friend (Unfollow)
export const removeFriend = async (req, res) => {
  const { userId, friendId } = req.query;

  try {
    const validationResult = await db.query(`SELECT * FROM friendrequest WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)`, [userId, friendId, friendId, userId]);

    if(validationResult[0].length === 0) {
      return res.status(400).json({message: "You are not this user's friend"});
    }


  const deleteFriendRequestQuery = `
    DELETE FROM friendrequest
    WHERE (sender_id = ? AND recipient_id = ?)
    OR (sender_id = ? AND recipient_id = ?)
  `;

    // Delete the friend request records with status_id 7 (followed)
    await db.execute(deleteFriendRequestQuery, [userId, friendId, friendId, userId]);

    res.status(200).json({ message: "Friend removed successfully and friend requests deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// getAllFriend
export const getAllFriends = async (req, res) => {
  const { userId } = req.query;

  try {
    const getfriends = await db.query(
      `SELECT u.id, u.name, u.email, u.profilePic, ut.type_full_name
       FROM friendrequest fr
       JOIN users u ON
         (u.id = fr.sender_id AND fr.recipient_id = ?)
         OR
         (u.id = fr.recipient_id AND fr.sender_id = ?)
       JOIN usertype ut ON u.user_type_id = ut.id
       WHERE
         fr.status_id = 5
         AND u.id != ?;`,
      [userId, userId, userId]
    );

    // if(getfriends[0].length === 0) {
    //   return res.status(400).json({ message: "You haven't add any friend" });
    // }

    res.status(200).json({ friendsInfo: getfriends[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFriendsWithoutMeetupRequest = async (req, res) => {
  const { userId, meetupId } = req.query;

  try {
    const [friendsWithoutRequest] = await db.query(
      `SELECT u.id, u.name, u.email, u.profilePic, ut.type_full_name
       FROM friendrequest fr
       JOIN users u ON
         (u.id = fr.sender_id AND fr.recipient_id = ?)
         OR
         (u.id = fr.recipient_id AND fr.sender_id = ?)
       JOIN usertype ut ON u.user_type_id = ut.id
       LEFT JOIN meetuprequest mr ON
         (mr.recipient_id = u.id AND mr.sender_id = ? AND mr.meetup_id = ?)
         OR
         (mr.sender_id = u.id AND mr.recipient_id = ? AND mr.meetup_id = ?)
       WHERE
         fr.status_id = 5
         AND u.id != ?
         AND mr.meetup_id IS NULL;`, // Ensures there is no meetup request for the specified meetup
      [userId, userId, userId, meetupId, userId, meetupId, userId]
    );

    if (friendsWithoutRequest.length === 0) {
      return res.status(200).json({ message: "No friends available to invite. Please add more friends." });
    }

    res.status(200).json({ friendsWithoutRequest });
  } catch (err) {
    console.error("Error fetching friends without meetup request:", err);
    res.status(500).json({ error: "Error fetching friends without meetup request" });
  }
};


export const getRequest = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");
  try {
    const [request] = await db.query(`
    select * from friendrequest fr JOIN status s ON s.id = fr.status_id WHERE status_name = ?;`, ["pending"]);

    res.status(200).json(request);
  } catch (err) {
    res.status(500).json("Failed to fetch requests");
  }
};

export const getApprovedFollows = async (req, res) => {
  // Step 1: Check for the access token in cookies
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    // Step 2: Verify the token
    const userInfo = await verifyToken(token);

    // Extract user ID from the decoded token
    const userId = userInfo.id;

    // Step 3: Get user type
    const [typeresult] = await db.query(
      `SELECT t.type_name FROM usertype t JOIN users u ON u.user_type_id = t.id WHERE u.id = ?`,
      [userId]
    );
    const typename = typeresult[0].type_name;

    let query = "";
    let queryParams = [userId];

    // Step 4: Build the query based on user type
    if (typename === "regular") {
      // For regulars, get followed users (approved relationships with status_id = 5)
      query = `
        SELECT r.followedUserId
        FROM relationships r
        JOIN users u ON u.id = r.followedUserId
        WHERE r.followerUserId = ?
          AND u.user_type_id = 2
      `;
    } else if (typename === "expert") {
      // For experts, merge sender_id and recipient_id into a single column
      query = `
        SELECT
          CASE
            WHEN fr.sender_id = ? THEN fr.recipient_id
            ELSE fr.sender_id
          END AS followedUserId
        FROM friendrequest fr
        JOIN users u
          ON (u.id = CASE
                      WHEN fr.sender_id = ? THEN fr.recipient_id
                      ELSE fr.sender_id
                    END)
        WHERE (fr.sender_id = ? OR fr.recipient_id = ?)
          AND u.user_type_id = 2
          AND fr.status_id = 5;
      `;
      queryParams = [userId, userId, userId, userId];
    } else {
      return res.status(400).json({ error: "Invalid user type." });
    }

    // Step 5: Execute the query
    const [result] = await db.query(query, queryParams);

    // Step 6: Handle case when no follows are found
    if (result.length === 0) {
      return res.status(200).json([]);
    }

    // Step 7: Return the list of followed user IDs
    const followedUserIds = result.map(row => row.followedUserId);
    res.status(200).json(followedUserIds);

  } catch (error) {
    console.error("Error fetching approved follows:", error);
    res.status(500).json({ error: "Failed to fetch approved follows." });
  }
};

export const getExpertFriendlist = async (req, res) => {
  // Step 1: Check for the access token in cookies
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    // Step 2: Verify the token
    const userInfo = await verifyToken(token);

    // Extract user ID from the decoded token
    const userId = userInfo.id;

    // Step 3: Check if user is an expert
    const [userTypeResult] = await db.query(
      `SELECT t.type_name FROM usertype t JOIN users u ON u.user_type_id = t.id WHERE u.id = ?`,
      [userId]
    );
    const userType = userTypeResult[0]?.type_name;

    if (userType !== "expert") {
      return res.status(403).json("Access denied. Only experts can have friends.");
    }

    // Step 4: Fetch the list of approved friends for the expert
    const query = `
      SELECT
        u.id AS userId,
        u.name,
        u.profilePic,
        u.coverPic,
        u.email
      FROM friendrequest fr
      JOIN users u
        ON u.id = CASE
                    WHEN fr.sender_id = ? THEN fr.recipient_id
                    ELSE fr.sender_id
                  END
      WHERE (fr.sender_id = ? OR fr.recipient_id = ?)
        AND fr.status_id = 5;
    `;

    const queryParams = [userId, userId, userId];

    // Step 5: Execute the query to get friends
    const [friends] = await db.query(query, queryParams);

    // Step 6: Return the list of friends
    res.status(200).json(friends);

  } catch (error) {
    console.error("Error fetching expert friend list:", error);
    res.status(500).json({ error: "Failed to fetch expert friend list." });
  }
};






