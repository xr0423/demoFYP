import { db } from '../connect.js';
import jwt from 'jsonwebtoken';

// Get relationships (followers)
export const getRelationships = async (req, res) => {
    const q = "SELECT `followerUserId` FROM relationships WHERE `followedUserId` = ?";
    
    try {
        const [data] = await db.query(q, [req.query.followedUserId]);
        return res.status(200).json(data.map(relationship => relationship.followerUserId));
    } catch (err) {
        return res.status(500).json(err);
    }
}

export const getPeopleIFollow = async (req, res) => {
    const q = `
        SELECT u.id, u.username, u.email, u.name, u.profilePic, ut.type_full_name
        FROM relationships AS r
        JOIN users AS u ON r.followedUserId = u.id
        JOIN usertype AS ut ON u.user_type_id = ut.id
        WHERE r.followerUserId = ?
    `;
    try {
        const [data] = await db.query(q, [req.query.followerUserId]);
        console.log(data);
        return res.status(200).json(data); // Returns detailed user information for people the user is following
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Add relationship (follow)
export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      INSERT INTO relationships (\`followerUserId\`, \`followedUserId\`) 
      VALUES (?, ?)
    `;

    const values = [userInfo.id, req.body.userId];

    try {
      // Insert the relationship record
      const [data] = await db.query(q, values);

      // Step 1: Insert a notification for the followed user
      const notificationQuery = `
        INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`) 
        VALUES (?, ?, ?)
      `;
      const notificationValues = [
        req.body.userId, // The user being followed (recipient of the notification)
        userInfo.id, // The user who initiated the follow (sender)
        "follow request", // Notification type
      ];

      await db.query(notificationQuery, notificationValues);

      // Step 2: Respond with success message
      return res.status(200).json("Follow request sent and notification created!");
    } catch (err) {
      console.error("Error in addRelationship:", err);
      return res.status(500).json(err);
    }
  });
};


// Delete relationship (unfollow)
export const deleteRelationship = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    jwt.verify(token, "secretkey", async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q = "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

        try {
            const [data] = await db.query(q, [userInfo.id, req.query.userId]);
            return res.status(200).json("Unfollow");
        } catch (err) {
            return res.status(500).json(err);
        }
    });
}
