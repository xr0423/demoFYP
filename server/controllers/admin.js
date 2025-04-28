import { pool, db } from "../connect.js";
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer"; // For sending emails

const TableNameKey = [
     // Users related variables
     {
          variable: "User Types",
          tableName: "usertype",
          pk: "id",
          properties: "update only",
          restriction: "type_name"
     },
     {
          variable: "Gender",
          tableName: "gender",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Status",
          tableName: "status",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Subscription",
          tableName: "subscription",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Coffee Beans",
          tableName: "coffeebeans",
          pk: "bean_id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Brewing Methods",
          tableName: "brewingmethods",
          pk: "method_id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Coffee Types",
          tableName: "coffeetypes",
          pk: "type_id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Allergies",
          tableName: "allergies",
          pk: "allergy_id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Tags",
          tableName: "tags",
          pk: "tag_id",
          properties: "full access",
          restriction: null
     },

     // Cities related variables
     {
          variable: "City",
          tableName: "city",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Post Category",
          tableName: "postcategory",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Activity related variables
     {
          variable: "Activity Type",
          tableName: "activitytype",
          pk: "id",
          properties: "update only",
          restriction: "type_name"
     },

     // Shop Owner related variables
     {
          variable: "Job Title",
          tableName: "jobtitle",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     // Note: "Subscription" is already included above under 'users' category

     // Shop Listing related variables
     {
          variable: "Shop Type",
          tableName: "shoptype",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Service Offered",
          tableName: "serviceoffered",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Social Media",
          tableName: "socialmedia",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Delivery Option",
          tableName: "deliveryoption",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Day Of Week",
          tableName: "dayofweek",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Event related variables
     {
          variable: "Event Type",
          tableName: "eventtype",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Menu Item related variables
     {
          variable: "Menu Item Category",
          tableName: "menuitemcategory",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Dietary Restriction",
          tableName: "dietaryrestriction",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Expert related variables
     {
          variable: "Specialization",
          tableName: "specialization",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Contact Us related variables
     {
          variable: "Contact Subjects",
          tableName: "contactus_subjects",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Contact Subjects Options",
          tableName: "contactus_subjects_options",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Platform Features related variables
     {
          variable: "Platform Features",
          tableName: "platformfeatures",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Platform Features Options",
          tableName: "platformfeatures",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "Role Feature",
          tableName: "rolefeature",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Articles related variables
     {
          variable: "Article Topic",
          tableName: "articletopic",
          pk: "id",
          properties: "full access",
          restriction: null
     },

     // Reviews related variables
     {
          variable: "Review Category",
          tableName: "reviewcategory",
          pk: "id",
          properties: "full access",
          restriction: null
     },
     {
          variable: "",
          tableName: "subscription",
          pk: "id",
          properties: "full access",
          restriction: null
     },
];

// Convert TableNameKey array to a Map for efficient lookup
const tableNameKeyMap = new Map();
TableNameKey.forEach(({ variable, tableName, pk, properties, restriction }) => {
     tableNameKeyMap.set(variable.toLowerCase(), { tableName, pk, properties, restriction });
});


// Middleware for authentication and authorization
export const authenticateAdmin = async (req, res, next) => {
     try {
          const token = req.cookies.accessToken;

          if (!token) {
               return res.status(401).json({ message: "Not Logged In!" });
          }

          // Verify token using the secret key from environment variables
          const userInfo = jwt.verify(token, "secretkey");

          // Check if user has admin privileges
          const [rows] = await db.query(
               `SELECT t.type_name 
       FROM usertype t 
       JOIN users u ON t.id = u.user_type_id 
       WHERE u.id = ?`,
               [userInfo.id]
          );

          if (!rows.length) {
               return res.status(401).json({ message: "User not found!" });
          }

          if (rows[0].type_name !== 'admin') {
               return res.status(403).json({ message: "Unauthorized!" });
          }

          // Attach user info to the request object for further use
          req.user = userInfo;
          next();

     } catch (err) {
          if (err.name === "JsonWebTokenError") {
               return res.status(403).json({ message: "Invalid Token!" });
          }
          console.error("Authentication Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
};

export const getAdminProfile = async (req, res) => {
     const { id } = req.query;
     if (!id) return res.status(403).json({ message: "Id required!" });
     try {
          const query = `SELECT 
                              u.id,
                              u.username,
                              u.email,
                              u.name,
                              u.coverPic,
                              u.profilePic,
                              g.gender_name AS gender,
                              ut.type_full_name AS role,
                              s.status_name AS status,
                              u.dob,
                              u.phone,
                              u.created_on,
                              u.verified
                         FROM users u
                         JOIN usertype ut ON u.user_type_id = ut.id
                         LEFT JOIN gender g ON u.gender_id = g.id
                         LEFT JOIN status s ON u.status_id = s.id
                         WHERE u.id = ?`;

          const [result] = await db.query(query, [id]);

          return res.status(200).json(result[0]);
     } catch (error) {
          console.error("Authentication Error:", error);
          return res.status(500).json({ error: "Server error", details: error.message });
     }
}

export const getAdminRelatedData = async (req, res) => {
     try {
          const queries = {
               genderOptions: `SELECT * FROM gender`,
          }

          const [genderOptionsResult] = await Promise.all([
               db.query(queries.genderOptions),
          ])

          const gender = genderOptionsResult[0];

          const result = {
               gender,
          }

          return res.status(200).json(result);
     } catch (err) {
          console.error("getAdminRelatedData Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
}

export const updateAdminProfile = async (req, res) => {
     try {
          const { id, name, email, gender, dob, phone, coverPic, profilePic } = req.body;
          const query = `UPDATE users SET name = ?, email = ?, gender_id = (SELECT id FROM gender WHERE gender_name = ?), dob = ?, phone = ?, coverPic = ?, profilePic = ? WHERE id = ?`;
          const values = [
               name,
               email,
               gender,
               dob,
               phone,
               coverPic,
               profilePic,
               id
          ]

          await db.query(query, values);
          return res.status(200).json({ message: "profile updated successfully" });
     } catch (err) {
          console.error("updateAdminProfile Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
}

// The actual getUserStats controller
export const getUserStats = async (req, res) => {
     try {
          // Define all the queries you need
          const queries = {
               totalUsers: `SELECT COUNT(*) AS total FROM users`,
               activeUsers: `SELECT COUNT(*) AS active FROM users u JOIN status s ON u.status_id = s.id WHERE s.status_name = 'active'`,
               inactiveUsers: `SELECT COUNT(*) AS inactive FROM users u JOIN status s ON u.status_id = s.id WHERE s.status_name = 'inactive'`,
               suspendedUsers: `SELECT COUNT(*) AS suspended FROM users u JOIN status s ON u.status_id = s.id WHERE s.status_name = 'suspended'`,
               newUsers: `SELECT COUNT(*) AS newUsers FROM users WHERE created_on >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
               pendingUsers: `SELECT COUNT(*) AS pending FROM users u JOIN status s ON u.status_id = s.id WHERE s.status_name = 'pending'`,
          };

          // Execute all queries in parallel for better performance
          const [totalUsersResult, activeUsersResult, inactiveUsersResult, suspendedUsersResult, newUsersResult, pendingUsersResult] = await Promise.all([
               db.query(queries.totalUsers),
               db.query(queries.activeUsers),
               db.query(queries.inactiveUsers),
               db.query(queries.suspendedUsers),
               db.query(queries.newUsers),
               db.query(queries.pendingUsers),
          ]);

          // Extract the counts from the results
          const totalUsers = totalUsersResult[0][0].total;
          const activeUsers = activeUsersResult[0][0].active;
          const inactiveUsers = inactiveUsersResult[0][0].inactive;
          const suspendedUsers = suspendedUsersResult[0][0].suspended;
          const newUsers = newUsersResult[0][0].newUsers;
          const pendingUsers = pendingUsersResult[0][0].pending;


          // Construct the stats object
          const stats = {
               totalUsers,
               activeUsers,
               inactiveUsers,
               suspendedUsers,
               pendingUsers,
               newUsers,
               // Add more stats here
          };

          return res.status(200).json(stats);
     } catch (err) {
          console.error("getUserStats Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
};

export const getShopListingStats = async (req, res) => {
     try {
          const queries = {
               totalShops: `SELECT COUNT(*) AS total FROM shoplistings`,
               activeShops: `
           SELECT COUNT(*) AS active 
           FROM shoplistings s 
           JOIN status st ON s.status_id = st.id 
           WHERE st.status_name = 'active'
         `,
               suspendedShops: `
           SELECT COUNT(*) AS suspended 
           FROM shoplistings s 
           JOIN status st ON s.status_id = st.id 
           WHERE st.status_name = 'suspended'
         `,
               pendingShops: `
           SELECT COUNT(*) AS pending 
           FROM shoplistings s 
           JOIN status st ON s.status_id = st.id 
           WHERE st.status_name = 'pending'
         `,
               newShops: `
           SELECT COUNT(*) AS newShops 
           FROM shoplistings 
           WHERE created_on >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         `,
          };

          // Execute all queries in parallel
          const [
               totalShopsResult,
               activeShopsResult,
               suspendedShopsResult,
               pendingShopsResult,
               newShopsResult,
          ] = await Promise.all([
               db.query(queries.totalShops),
               db.query(queries.activeShops),
               db.query(queries.suspendedShops),
               db.query(queries.pendingShops),
               db.query(queries.newShops),
          ]);

          // Extract counts from the results
          const totalShops = totalShopsResult[0][0].total;
          const activeShops = activeShopsResult[0][0].active;
          const suspendedShops = suspendedShopsResult[0][0].suspended;
          const pendingShops = pendingShopsResult[0][0].pending;
          const newShops = newShopsResult[0][0].newShops;

          // Construct the statistics object
          const stats = {
               totalShops,
               activeShops,
               suspendedShops,
               pendingShops,
               newShops,
          };

          return res.status(200).json(stats);
     } catch (err) {
          console.error("getShopListingStats Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
};

export const getShopListings = async (req, res) => {
     try {
          const query = `SELECT 
                              s.shop_id, 
                              s.name, 
                              t.type_name AS type, 
                              s.location, 
                              u.name AS owner_name, 
                              st.status_name AS status,
                              GROUP_CONCAT(d.name) AS Documents
                         FROM shoplistings s 
                         JOIN shoptype t ON s.type_id = t.id
                         JOIN users u ON s.owner_id = u.id
                         JOIN status st ON s.status_id = st.id
                         LEFT JOIN document d ON s.shop_id = d.shoplisting_id
                         GROUP BY s.shop_id`;


          const [shoplistings] = await db.query(query);

          return res.status(200).json(shoplistings);
     } catch (err) {
          console.error("getUserStats Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
}

export const updateShopListingStatus = async (req, res) => {
     // Destructure shopId and status from query parameters
     const { shopId, status } = req.query;

     // Input Validation
     if (!shopId) {
          return res.status(400).json({ message: "Missing required parameter: shopId" });
     }

     if (!status) {
          return res.status(400).json({ message: "Missing required parameter: status" });
     }

     // Validate the 'status' value against allowed statuses
     const allowedStatuses = ['active', 'inactive', 'pending', 'suspended']; // Example statuses
     if (!allowedStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}` });
     }

     try {

          const [statusId] = await db.query(`SELECT id FROM status WHERE status_name = ?`, [status]);

          await db.query(`UPDATE shoplistings SET status_id = ? WHERE shop_id = ?`, [statusId[0].id, shopId]);

          

          // Step 2: Remove `userjoinedevent` records and notify participants
          const [eventParticipants] = await db.query(
               `SELECT uje.user_id AS toNotify, e.owner_id AS owner_id, uje.id AS eventParticipantsToDelete, e.price AS refund
               FROM userjoinedevent AS uje
               JOIN event e ON e.id = uje.event_id
               WHERE e.shop_id = ?;`,
               [shopId]
          );
          
          for (const participant of eventParticipants) {
               await db.query(
               `INSERT INTO allnotification (receiver, from_id, type, shop_id, refund)
               VALUES (?, ?, ?, ?, ?);`,
               [participant.toNotify, participant.owner_id, 'suspend shop event', shopId, participant.refund]
               );
          }
          
          const eventIdsToDelete = eventParticipants.map((p) => p.eventParticipantsToDelete);
          if (eventIdsToDelete.length > 0) {
               await db.query(
               `DELETE FROM userjoinedevent 
               WHERE id IN (?);`,
               [eventIdsToDelete]
               );
          }
   
         
             // Step 3: Remove `meetuprequest` records and notify participants
             const [meetupParticipants] = await db.query(
               `SELECT 
                  mr.recipient_id AS toNotifyRecipient, 
                  mu.user_id AS notifyCreator, 
                  mu.shop_id AS shopId, 
                  mr.request_id AS meetupParticipantsToDelete, 
                  mr.status_id AS meetupStatus,
                  s.owner_id AS owner_id
                FROM meetuprequest AS mr
                JOIN meetup AS mu ON mr.meetup_id = mu.meetup_id
                JOIN shoplistings as s on s.shop_id = mu.shop_id
                WHERE mu.shop_id = ?;`,
               [shopId]
             );
         
             // Notify participants based on meetup status
             for (const participant of meetupParticipants) {
               if (participant.meetupStatus === 5) {
                 // Notify only recipient if status_id is 5
                 await db.query(
                   `INSERT INTO allnotification (receiver, from_id, type, shop_id)
                    VALUES (?, ?, 'suspend shop meetup receiver', ?);`,
                   [participant.toNotifyRecipient, participant.owner_id, shopId]
                 );
               }
             }
         

             // Notify all meetup creators
               const creatorsToNotify = new Set(meetupParticipants.map((p) => p.notifyCreator));
               for (const creatorId of creatorsToNotify) {
               await db.query(
               `INSERT INTO allnotification (receiver, from_id, type, shop_id)
                    VALUES (?, ?, 'suspend shop meetup creator', ?);`,
               [creatorId, meetupParticipants[0]?.owner_id, shopId] // Use owner_id for from_id
               );
               }

         
             // Delete all meetup requests based on request IDs
             const requestIdsToDelete = meetupParticipants.map((p) => p.meetupParticipantsToDelete);
             if (requestIdsToDelete.length > 0) {
               await db.query(
                 `DELETE FROM meetuprequest 
                  WHERE request_id IN (?);`,
                 [requestIdsToDelete]
               );
             }
         
             // Step 4: Delete associated meetups
             await db.query(
               `DELETE FROM meetup 
                WHERE shop_id = ?;`,
               [shopId]
             );
         


          console.log(`Update successful ${shopId} ${status}`);
          return res.status(200).json({ message: "Shop status updated successfully." });

     } catch (error) {
          console.error("updateShopListingStatus Error:", error);
          return res.status(500).json({ error: "Server error", details: error.message });
     }
};


export const getUserAccounts = async (req, res) => {
     try {
          const query = `SELECT 
                              u.id,
                              u.username,
                              u.email,
                              u.password,
                              u.name,
                              u.coverPic,
                              u.profilePic,
                              g.gender_name AS gender,
                              ut.type_full_name AS role,
                              s.status_name AS status,
                              u.dob,
                              u.phone,
                              u.created_on,
                              u.verified,
                              GROUP_CONCAT(d.name) AS Documents
                         FROM
                              users u
                              JOIN usertype ut ON u.user_type_id = ut.id
                              LEFT JOIN gender g ON u.gender_id = g.id
							LEFT JOIN status s ON u.status_id = s.id
                              LEFT JOIN document d ON u.id = d.user_id
                              WHERE ut.type_name != 'admin'
                              GROUP BY u.id`;;
          const [users] = await db.query(query);
          return res.status(200).json(users);
     } catch (err) {
          console.error("getUserStats Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
};


export const updateUserAccountStatus = async (req, res) => {
     const { userId, status } = req.query;
   
     // Input validation
     if (!userId) {
       return res.status(400).json({ message: "Missing required parameter: userId" });
     }
     if (!status) {
       return res.status(400).json({ message: "Missing required parameter: status" });
     }
   
     // Validate the 'status' value against allowed statuses
     const allowedStatuses = ["active", "inactive", "pending", "suspended"];
     if (!allowedStatuses.includes(status.toLowerCase())) {
       return res
         .status(400)
         .json({
           message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`,
         });
     }
   
     try {
       // Get status ID
       const [statusIdResult] = await db.query(`SELECT id FROM status WHERE status_name = ?`, [status]);
       const statusId = statusIdResult[0]?.id;
   
       if (!statusId) {
         return res.status(400).json({ message: "Invalid status provided." });
       }
   
       // Update the user's status
       await db.query(`UPDATE users SET status_id = ? WHERE id = ?`, [statusId, userId]);
   
       if (status.toLowerCase() === "suspended") {
         // Suspension logic
   
         // 1. Remove userjoinedevent records and notify participants
         const [eventParticipants] = await db.query(
           `SELECT uje.user_id AS toNotify, uje.id AS eventParticipantsToDelete, e.price AS refund\
           FROM userjoinedevent AS uje
           JOIN event e ON e.id = uje.event_id
           WHERE e.owner_id = ?;`,
           [userId]
         );
   
         for (const participant of eventParticipants) {
           // Insert notifications for suspended events
           await db.query(
             `INSERT INTO allnotification (receiver, from_id, type, refund)
             VALUES (?, ?, 'suspend account event', ?);`,
             [participant.toNotify, userId, participant.refund]
           );
         }
   
         const eventIdsToDelete = eventParticipants.map((p) => p.eventParticipantsToDelete);
         if (eventIdsToDelete.length > 0) {
           await db.query(
             `DELETE FROM userjoinedevent 
             WHERE event_id IN (?);`,
             [eventIdsToDelete]
           );
         }
   
         // 2. Remove meetuprequest records and notify participants
         const [meetupParticipants] = await db.query(
          `SELECT 
             mr.recipient_id AS toNotifyRecipient, 
             mu.user_id AS notifyCreator, 
             mu.shop_id AS shopId, 
             mr.request_id AS meetupParticipantsToDelete, 
             mr.status_id AS meetupStatus 
           FROM meetuprequest AS mr
           JOIN meetup AS mu ON mr.meetup_id = mu.meetup_id
           JOIN shoplistings AS s ON mu.shop_id = s.shop_id
           JOIN users AS u ON s.owner_id = u.id
           WHERE u.id = ?;`,
          [userId]
        );
        
        // Notify participants based on meetup status
        for (const participant of meetupParticipants) {
          if (participant.meetupStatus === 5) {
            // Notify only recipient if status_id is 5
            await db.query(
              `INSERT INTO allnotification (receiver, from_id, type)
               VALUES (?, ?, 'suspend account meetup receiver');`,
              [participant.toNotifyRecipient, userId]
            );
          }
        }
        
        // Notify all meetup creators
        const creatorsToNotify = new Set(meetupParticipants.map((p) => p.notifyCreator));
        for (const creatorId of creatorsToNotify) {
          await db.query(
            `INSERT INTO allnotification (receiver, from_id, type)
             VALUES (?, ?, 'suspend account meetup creator');`,
            [creatorId, userId]
          );
        }
        
        // Delete all meetup requests based on request IDs
        const requestIdsToDelete = meetupParticipants.map((p) => p.meetupParticipantsToDelete);
        if (requestIdsToDelete.length > 0) {
          await db.query(
            `DELETE FROM meetuprequest 
             WHERE request_id IN (?);`,
            [requestIdsToDelete]
          );
        }
        
        // Delete all meetups based on shop IDs
        const shopIdsToDelete = new Set(meetupParticipants.map((p) => p.shopId));
        if (shopIdsToDelete.size > 0) {
          await db.query(
            `DELETE FROM meetup 
             WHERE shop_id IN (?);`,
            [[...shopIdsToDelete]]
          );
        }        
       }
   
       // Verify user and update voucher if needed
       const [verifyStatus] = await db.query(
         `SELECT u.verified, t.type_name 
         FROM users u 
         LEFT JOIN usertype t ON u.user_type_id = t.id 
         WHERE u.id = ?`,
         [userId]
       );
   
       if (verifyStatus[0]?.verified === false || verifyStatus[0]?.verified === 0) {
         await db.query(`UPDATE users SET verified = 1 WHERE id = ?`, [userId]);
   
         if (verifyStatus[0]?.type_name === "regular") {
           // Add voucher logic (if applicable)
           await db.query(
             `INSERT INTO vouchers (user_id, voucher_code, created_by, created_on)
             VALUES (?, ?, ?, NOW())`,
             [userId, "SUSPENSION-VOUCHER", req.user.id]
           );
         }
       }
   
       return res.status(200).json({ message: "User account status updated successfully." });
     } catch (err) {
       console.error("updateUserAccountStatus Error:", err);
       return res.status(500).json({ error: "Server error", details: err.message });
     }
   };
   

export const getContactUsDetails = async (req, res) => {
     try {
          const query = `SELECT 
                              cus.id, 
                              cus.name, 
                              cus.email, 
                              cus.message, 
                              cus.created_at, 
                              cus.replied, 
                              cus.subject_id,
                              cus.option_id,
                              cs.subject_name, 
                              cso.option_name
                         FROM contactus_submission cus
                         JOIN contactus_subjects cs ON cus.subject_id = cs.id
                         LEFT JOIN contactus_subjects_options cso ON cus.option_id = cso.id`;

          const [contactusresult] = await db.query(query);
          return res.status(200).json(contactusresult);
     } catch (err) {
          console.error("getContactUsDetails Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
}

export const getContactUsSubjects = async (req, res) => {
     try {
          const query = `SELECT * FROM contactus_subjects`;

          const [result] = await db.query(query);
          return res.status(200).json(result);
     } catch (err) {
          console.error("getContactUsOptions Error:", err);
          return res.status(500).json({ error: "Server error", details: err.message });
     }
}

export const getContactUsSubOptions = async (req, res) => {
     try {
          const { target } = req.params;
          const [result] = await db.query(`SELECT * FROM contactus_subjects_options WHERE subject_id = ?`, [target])

          return res.status(200).json(result);
     } catch (err) {
          console.error("getContactUsSubOptions Error:", err);
          return res.status(500).json({ error: "ServerError", details: err.message });
     }
}

export const replyToContactUs = async (req, res) => {
     const { target } = req.params;
     const { subject, message } = req.body;
     try {
          const [contactus_submission] = await db.query(`SELECT * FROM contactus_submission WHERE id = ?`, [target]);
          if (!contactus_submission) {
               return res.status(404).json({ error: "Submission not found" });
          }

          const submission = contactus_submission[0];

          const transporter = nodemailer.createTransport({
               service: "gmail",
               auth: {
                    user: "ilikecoffeeapp@gmail.com",
                    pass: "otmc ksit vhvb hkyw",
               },
          });

          const htmlMessage = `
               <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #d2a679;">Hello from I Like That Coffee!</h2>
                    <p>Thank you for reaching out to us. We appreciate you taking the time to get in touch!</p>
                    <p>${message}</p>
                    <p>If you have any more questions or need further assistance, feel free to reply to this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                    <footer style="font-size: 0.9em; color: #555;">
                         <p>Thank you for connecting with us!</p>
                         <p>
                              <strong>I Like That Coffee Team</strong>
                         </p>
                         <p style="font-size: 0.8em; color: #777;">
                              If you need more assistance, please contact us at 
                              <a href="mailto:ilikecoffeeapp@gmail.com" style="color: #d2a679; text-decoration: none;">
                                   ilikecoffeeapp@gmail.com
                              </a>.
                         </p>
                         <p style="font-size: 0.8em; color: #777;">
                              © 2024 I Like That Coffee. All rights reserved.
                         </p>
                    </footer>
               </div>
          `;

          const mailOptions = {
               from: "ilikecoffeeapp@gmail.com", // Replace with your email
               to: submission.email,
               subject: subject,
               html: htmlMessage,
          };

          transporter.sendMail(mailOptions, async (error, info) => {
               if (error) {
                    console.log("Error sending email:" + error);
                    return res.status(500).json({ error: "Failed to send email." });
               } else {
                    console.log("Email sent: " + info.response);
                    // Update the submission's replied status

                    await db.query(`UPDATE contactus_submission SET replied = 1 WHERE id = ?`, [submission.id]);
                    return res.json({ message: "Reply sent successfully.", submission });
               }
          });

     } catch (err) {
          console.error("Error replying to submission:" + err.message);
          res.status(500).json({ error: "Internal Server Error" });
     }
}


export const getVariables = async (req, res) => {
     try {
          // Define all queries with their respective categories, keys, and additional metadata
          const queries = [
               // User related variables
               {
                    category: 'users',
                    key: 'User Types',
                    query: 'SELECT * FROM usertype',
               },
               {
                    category: 'cities',
                    key: 'City',
                    query: 'SELECT * FROM city',
               },
               {
                    category: 'users',
                    key: 'Gender',
                    query: 'SELECT * FROM gender',
               },
               {
                    category: 'users',
                    key: 'Coffee Beans',
                    query: 'SELECT * FROM coffeebeans',
               },
               {
                    category: 'users',
                    key: 'Brewing Methods',
                    query: 'SELECT * FROM brewingmethods',
               },
               {
                    category: 'users',
                    key: 'Coffee Types',
                    query: 'SELECT * FROM coffeetypes',
               },
               {
                    category: 'users',
                    key: 'Allergies',
                    query: 'SELECT * FROM allergies',
               },
               {
                    category: 'users',
                    key: 'Tags',
                    query: 'SELECT * FROM tags',
               },
               // Post
               {
                    category: 'post',
                    key: 'Post Category',
                    query: 'SELECT id, name, type FROM postcategory',
               },

               // Activity
               {
                    category: 'activity',
                    key: 'Activity Type',
                    query: 'SELECT * FROM activitytype',
               },

               // Shop Owner
               {
                    category: 'shopowner',
                    key: 'Job Title',
                    query: 'SELECT * FROM jobtitle',
               },

               // Shop Listing
               {
                    category: 'shoplisting',
                    key: 'Shop Type',
                    query: 'SELECT * FROM shoptype',
               },
               {
                    category: 'shoplisting',
                    key: 'Service Offered',
                    query: 'SELECT * FROM serviceoffered',
               },
               {
                    category: 'shoplisting',
                    key: 'Social Media',
                    query: 'SELECT * FROM socialmedia',
               },
               {
                    category: 'shoplisting',
                    key: 'Delivery Option',
                    query: 'SELECT * FROM deliveryoption',
               },
               {
                    category: 'shoplisting',
                    key: 'Day Of Week',
                    query: 'SELECT * FROM dayofweek',
               },
               {
                    category: 'shoplisting',
                    key: 'Review Category',
                    query: 'SELECT id, category_name FROM reviewcategory',
               },

               // Event
               {
                    category: 'event',
                    key: 'Event Type',
                    query: 'SELECT * FROM eventtype',
               },

               // Menu Item
               {
                    category: 'shoplisting',
                    key: 'Menu Item Category',
                    query: 'SELECT * FROM menuitemcategory',
               },
               {
                    category: 'shoplisting',
                    key: 'Dietary Restriction',
                    query: 'SELECT * FROM dietaryrestriction',
               },

               // Expert
               {
                    category: 'expert',
                    key: 'Specialization',
                    query: 'SELECT * FROM specialization',
               },

               {
                    category: 'expert',
                    key: 'Article Topic',
                    query: 'SELECT * FROM articletopic',
               },

               // Contact Us
               {
                    category: 'contactUs',
                    key: 'Contact Subjects',
                    query: 'SELECT id, subject_name FROM contactus_subjects',
               },
               {
                    category: 'contactUs',
                    key: 'Contact Subjects Options',
                    query: `
                    SELECT 
                         cso.id, 
                         cso.option_name, 
                         cso.subject_id,
                         cs.subject_name
                    FROM contactus_subjects_options cso
                    JOIN contactus_subjects cs ON cso.subject_id = cs.id`,
               },

               // Platform Features
               {
                    category: 'platformFeatures',
                    key: 'Platform Features',
                    query: `SELECT id, feature_name, description, feature_image FROM platformfeatures`,
               },
               {
                    category: 'platformFeatures',
                    key: 'Platform Features Options',
                    query: `SELECT id, feature_name AS name from platformfeatures`,
               },
               {
                    category: 'platformFeatures',
                    key: 'Role Feature',
                    query: `SELECT r.id, r.user_type_id, t.type_full_name, r.feature_id, f.feature_name 
                              FROM rolefeature r 
                              JOIN usertype t on t.id = r.user_type_id
                              JOIN platformfeatures f ON f.id = r.feature_id;`
               },
               {
                    // Subscription
                    category: 'Subscription',
                    key: 'Subscription',
                    query: `SELECT s.id, s.subscription_name, s.user_type_id, t.type_name, s.price, s.features, s.subscription_point FROM subscription s LEFT JOIN usertype t ON s.user_type_id = t.id`
               },

          ];

          // Execute all queries in parallel using connection pooling
          const queryPromises = queries.map((q) => pool.query(q.query));
          const results = await Promise.all(queryPromises);

          // Initialize the response object
          const response = {};

          // Map each query result to its respective category and key, including properties and restriction
          queries.forEach((q, index) => {
               const { category, key } = q;
               const data = results[index][0]; // Assuming pool.query returns [rows, ...] as per mysql2

               // Find the corresponding entry in TableNameKey
               const tableMapping = TableNameKey.find(entry => entry.variable === key);
               if (!tableMapping) {
                    console.warn(`No TableNameKey mapping found for variable: ${key}`);
                    return; // Skip if no mapping is found
               }

               // Initialize the category object if it doesn't exist
               if (!response[category]) {
                    response[category] = {};
               }

               // Assign the data and metadata to the respective key within the category
               response[category][key] = {
                    data: data,
                    properties: tableMapping.properties || 'full access', // Default to 'full access' if not specified
                    restriction: tableMapping.restriction || null, // Null if no restriction
               };
          });

          // Respond with the structured variables including properties and restrictions
          return res.status(200).json(response);
     } catch (err) {
          console.error('Error getting variables:', err.message);
          return res
               .status(500)
               .json({ error: 'Internal Server Error', message: err.message });
     }
};

export const updateVariable = async (req, res) => {
     const connection = await pool.getConnection(); // Get a connection from the pool
     try {
          const { variableType, key } = req.query;

          console.log(req.body)

          if (!variableType || !key) {
               return res.status(400).json({
                    error: "Bad Request",
                    message: "Missing 'variableType' or 'key' in query parameters.",
               });
          }

          // Normalize variableType for case-insensitive matching
          const normalizedVariableType = variableType.toLowerCase();

          // Retrieve tableName and pk from the map
          const tableInfo = tableNameKeyMap.get(normalizedVariableType);

          if (!tableInfo) {
               console.log(`Invalid 'variableType': ${variableType}`)
               return res.status(400).json({
                    error: "Bad Request",
                    message: `Invalid 'variableType': ${variableType}.`,
               });
          }

          const { tableName, pk } = tableInfo;

          // Ensure 'key' is a valid identifier (e.g., integer)
          const parsedKey = parseInt(key, 10);
          if (isNaN(parsedKey)) {
               console.log("Here")
               return res.status(400).json({
                    error: "Bad Request",
                    message: `'key' must be a valid integer. Received: ${key}`,
               });
          }

          // Exclude the primary key from the update payload if present
          const updateData = { ...req.body };
          delete updateData[pk];

          // Validate that there are fields to update
          const fields = Object.keys(updateData);
          if (fields.length === 0) {
               console.log("No fields to update");
               return res.status(400).json({
                    error: "Bad Request",
                    message: "No valid fields provided for update.",
               });
          }

          // Start transaction
          await connection.beginTransaction();

          // Construct the SET clause dynamically
          const setClauses = fields.map((field) => `${field} = ?`);
          const values = fields.map((field) => updateData[field]);

          const setClause = setClauses.join(", ");

          console.log(values);

          // Final SQL query for UPDATE
          const updateQuery = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE ${pk} = ?;
    `;

          // Execute the UPDATE query
          const [updateResult] = await connection.execute(updateQuery, [...values, parsedKey]);

          if (updateResult.affectedRows === 0) {
               await connection.rollback();
               return res.status(404).json({
                    error: "Not Found",
                    message: `${variableType} with ${pk}=${key} not found.`,
               });
          }

          // Perform the SELECT to retrieve the updated row
          const selectQuery = `
      SELECT *
      FROM ${tableName}
      WHERE ${pk} = ?;
    `;

          const [selectRows] = await connection.execute(selectQuery, [parsedKey]);

          if (selectRows.length === 0) {
               // This should not happen as we've just updated the row
               await connection.rollback();
               return res.status(404).json({
                    error: "Not Found",
                    message: `${variableType} with ${pk}=${key} not found after update.`,
               });
          }

          // Commit the transaction
          await connection.commit();

          // Respond with the updated record
          return res.status(200).json({
               message: `${variableType} updated successfully.`,
               data: selectRows[0],
          });
     } catch (err) {
          await connection.rollback();
          console.error("Error updating variable:", err.message);
          return res.status(500).json({
               error: "Internal Server Error",
               message: "An error occurred while updating the variable.",
          });
     } finally {
          connection.release(); // Release the connection back to the pool
     }
};

export const deleteVariables = async (req, res) => {
     try {
          const { variableType, key } = req.query;

          if (!variableType || !key) {
               return res.status(400).json({
                    error: "Bad Request",
                    message: "Missing 'variableType' or 'key' in query parameters.",
               });
          }

          // Normalize variableType for case-insensitive matching
          const normalizedVariableType = variableType.toLowerCase();

          // Retrieve tableName and pk from the map
          const tableInfo = tableNameKeyMap.get(normalizedVariableType);

          if (!tableInfo) {
               console.log(`Invalid 'variableType': ${variableType}`)
               return res.status(400).json({
                    error: "Bad Request",
                    message: `Invalid 'variableType': ${variableType}.`,
               });
          }

          const { tableName, pk } = tableInfo;

          // Ensure 'key' is a valid identifier (e.g., integer)
          const parsedKey = parseInt(key, 10);
          if (isNaN(parsedKey)) {
               return res.status(400).json({
                    error: "Bad Request",
                    message: `'key' must be a valid integer. Received: ${key}`,
               });
          }


          const deleteQuerey = `DELETE FROM ${tableName} WHERE ${pk} = ?`;
          const [deleteResult] = await db.query(deleteQuerey, [key]);
          if (deleteResult.length === 0) {
               return res.status(404).json("Failed to delete")
          }
          return res.status(200).json({ message: "detele Successfully" })
     } catch (err) {
          console.error("Error deleting variables:", err.message);
          return res.status(500).json({ error: "Internal Server Error", message: err.message });
     }
}

export const addVariable = async (req, res) => {
     try {
          const { variableType } = req.query;

          if (!variableType) {
               return res.status(400).json({
                    error: "Bad Request",
                    message: "Missing 'variableType' in query parameters.",
               });
          }

          // Normalize variableType for case-insensitive matching
          const normalizedVariableType = variableType.toLowerCase();

          // Retrieve tableName and pk from the map
          const tableInfo = TableNameKey.find(
               (entry) => entry.variable.toLowerCase() === normalizedVariableType
          );

          if (!tableInfo) {
               console.log(`Invalid 'variableType': ${variableType}`);
               return res.status(400).json({
                    error: "Bad Request",
                    message: `Invalid 'variableType': ${variableType}.`,
               });
          }

          const { tableName, pk } = tableInfo;

          // Extract data from request body
          const data = req.body;

          // Validate required fields based on variableType
          if (variableType === "Contact Subjects Options") {
               const { option_name, subject_id } = data;

               if (!option_name || !subject_id) {
                    return res.status(400).json({
                         error: "Bad Request",
                         message: "'option_name' and 'subject_id' are required for Contact Subjects Options.",
                    });
               }

               // Verify that the subject_id exists in contactus_subjects
               const [subjectRows] = await pool.execute(
                    `SELECT id FROM contactus_subjects WHERE id = ?`,
                    [subject_id]
               );

               if (subjectRows.length === 0) {
                    return res.status(400).json({
                         error: "Bad Request",
                         message: `Invalid 'subject_id': ${subject_id}. Contact Subject does not exist.`,
                    });
               }
          }

          // Additional validations for other variableTypes can be added here

          // Prepare columns and values for the INSERT query
          const columns = Object.keys(data);
          const placeholders = columns.map(() => '?').join(', ');
          const values = Object.values(data);

          // Construct the INSERT query
          const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

          // Execute the INSERT query
          const [result] = await pool.execute(insertQuery, values);

          // Fetch the newly inserted record
          const [newRecord] = await pool.execute(`SELECT * FROM ${tableName} WHERE ${pk} = ?`, [result.insertId]);

          return res.status(201).json({
               message: `${variableType} added successfully.`,
               data: newRecord[0],
          });
     } catch (err) {
          console.error("Error adding variables:", err.message);
          return res.status(500).json({ error: "Internal Server Error", message: err.message });
     }
};


// managing landing page content

// Get Content for Editing API
export const getContent = async (req, res) => {
     const { section_name } = req.query;

     try {
          // Validate section_name
          if (!section_name) {
               return res.status(400).json({ message: "Section name is required." });
          }

          // Fetch content from the SectionContent table ordered by content_order
          const [content] = await db.query(
               `SELECT * FROM sectioncontent WHERE section_name = ? ORDER BY content_order ASC`,
               [section_name]
          );

          res.status(200).json(content);
     } catch (error) {
          console.error("Get Content for Editing Error:", error);
          res.status(500).json({ error: "Internal Server Error", details: error.message });
     }
};
// Create Content API
export const createContent = async (req, res) => {
     const { heading, content, section_name, content_order } = req.body;

     if (!heading || !content || !section_name || !content_order) {
          return res.status(400).json({ message: "All fields are required." });
     }

     try {
          // Check if content_order already exists for the given section_name
          const [existingContent] = await db.query(
               `SELECT * FROM sectioncontent WHERE section_name = ? AND content_order = ?`,
               [section_name, content_order]
          );

          if (existingContent.length > 0) {
               return res.status(400).json({
                    message: `Content order ${content_order} already exists in the ${section_name} section.`,
               });
          }

          // Insert new content
          const [result] = await db.query(
               `INSERT INTO sectioncontent (heading, content, section_name, content_order) VALUES (?, ?, ?, ?)`,
               [heading, content, section_name, content_order]
          );

          res.status(201).json({
               message: "Content created successfully.",
               contentId: result.insertId,
          });
     } catch (error) {
          console.error("Create Content Error:", error);
          res.status(500).json({ error: "Internal Server Error", details: error.message });
     }
};

// Update Content API
export const updateContent = async (req, res) => {
     const { id } = req.params;
     const { heading, content, section_name, content_order } = req.body;

     if (!id || !heading || !content || !section_name || !content_order) {
          return res.status(400).json({ message: "All fields are required." });
     }

     try {
          // Check if the content item exists
          const [existingItem] = await db.query(`SELECT * FROM sectioncontent WHERE id = ?`, [id]);
          if (existingItem.length === 0) {
               return res.status(404).json({ message: "Content item not found." });
          }

          // Check if content_order already exists for the given section_name, excluding the current item
          const [conflictingItem] = await db.query(
               `SELECT * FROM sectioncontent WHERE section_name = ? AND content_order = ? AND id != ?`,
               [section_name, content_order, id]
          );

          if (conflictingItem.length > 0) {
               return res.status(400).json({
                    message: `Content order ${content_order} already exists in the ${section_name} section.`,
               });
          }

          // Update content
          await db.query(
               `UPDATE sectioncontent SET heading = ?, content = ?, section_name = ?, content_order = ? WHERE id = ?`,
               [heading, content, section_name, content_order, id]
          );

          res.status(200).json({ message: "Content updated successfully." });
     } catch (error) {
          console.error("Update Content Error:", error);
          res.status(500).json({ error: "Internal Server Error", details: error.message });
     }
};

export const deleteContent = async (req, res) => {
     const { id } = req.params;
     console.log("Delete Content");

     // Check if 'id' parameter is provided
     if (!id) {
          return res.status(400).json({ message: "Missing id parameter." });
     }

     try {
          // Query to delete the content with the specified id
          const [result] = await pool.query(
               `DELETE FROM sectioncontent WHERE id = ?`,
               [id]
          );

          // Check if any rows were affected (i.e., content was deleted)
          if (result.affectedRows === 0) {
               return res.status(404).json({ message: "Content not found." });
          }

          res.status(200).json({ message: "Content deleted successfully." });
     } catch (error) {
          console.error("Error deleting content:", error);
          res.status(500).json({ message: "Internal Server Error", error: error.message });
     }
};