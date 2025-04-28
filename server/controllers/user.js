import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment"; // Import moment.js

export const getRegularUserRelatedData = async (req, res) => {
  // Define queries for each table
  const CoffeeBeansQuery = `SELECT * FROM coffeebeans ORDER BY bean_id ASC`;
  const BrewingMethodsQuery = `SELECT * FROM brewingmethods ORDER BY method_id ASC`;
  const CoffeeTypesQuery = `SELECT * FROM coffeetypes ORDER BY type_id ASC`;
  const AllergiesQuery = `SELECT * FROM allergies ORDER BY allergy_id ASC`;
  const TagsQuery = `SELECT * FROM tags ORDER BY tag_id ASC`;
  const CitiesQuery = `SELECT * FROM city ORDER BY city_name ASC`;
  const GenderQuery = `SELECT * FROM gender ORDER BY id ASC`;
  const SpecializationQuery = `SELECT * FROM specialization ORDER BY id ASC`;

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged In!");

    const userInfo = jwt.verify(token, "secretkey");

    const [coffeeBeans] = await db.query(CoffeeBeansQuery);
    const [brewingMethods] = await db.query(BrewingMethodsQuery);
    const [coffeeTypes] = await db.query(CoffeeTypesQuery);
    const [allergies] = await db.query(AllergiesQuery);
    const [tags] = await db.query(TagsQuery);
    const [cities] = await db.query(CitiesQuery);
    const [gender] = await db.query(GenderQuery);
    const [specialization] = await db.query(SpecializationQuery);

    return res.status(200).json({
      coffeeBeans,
      brewingMethods,
      coffeeTypes,
      allergies,
      tags,
      cities,
      gender,
      specialization,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Server Error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    // First, fetch the user's type
    const userTypeQuery = `
      SELECT ut.type_name AS type 
      FROM users u 
      JOIN usertype ut ON u.user_type_id = ut.id
      WHERE u.id = ?
    `;

    const [userTypeData] = await db.query(userTypeQuery, [userId]);

    if (userTypeData.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userType = userTypeData[0].type.toLowerCase();

    // Common attributes to return for all user types
    let baseQuery = `
      SELECT 
        u.username,
        u.email,
        u.name,
        c.city_name,
        u.coverPic,
        u.profilePic,
        g.gender_name AS gender,
        ut.type_name AS user_type,
        s.status_name AS status,
        u.dob,
        u.phone,
        u.created_on,
        GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
        GROUP_CONCAT(DISTINCT cb.bean_name) AS fav_beans,
        GROUP_CONCAT(DISTINCT bm.method_name) AS fav_brewing_methods,
        GROUP_CONCAT(DISTINCT ct.type_name) AS fav_coffee_type,
        GROUP_CONCAT(DISTINCT al.allergy_name) AS allergies,
    `;

    // Additional attributes based on user type
    let additionalQuery = "";

    switch (userType) {
      case "owner":
        additionalQuery = `
          so.bio,
          so.coins,
          COALESCE((SELECT COUNT(*) FROM shoplistings WHERE owner_id = u.id), 0) AS shoplistings,
          COALESCE((SELECT COUNT(*) FROM relationships WHERE followedUserId = u.id), 0) AS followers
          FROM users u
          JOIN shopowners so ON u.id = so.id
        `;
        break;
      case "regular":
        additionalQuery = `
          ru.bio,
          COALESCE((SELECT COUNT(*) FROM relationships WHERE followedUserId = u.id), 0) AS followers,
          COALESCE((SELECT COUNT(*) FROM posts WHERE userid = u.id), 0) AS posts,
          COALESCE((SELECT COUNT(*) FROM shopreviews WHERE user_id = u.id), 0) AS reviews
          FROM users u
          LEFT JOIN regularusers ru ON u.id = ru.id
        `;
        break;
      case "expert":
        additionalQuery = `
          ce.highest_education,
          ce.bio,
          GROUP_CONCAT(DISTINCT sp.specialization_name) AS specialization,
          COALESCE((SELECT COUNT(*) FROM relationships WHERE followedUserId = u.id), 0) AS followers,
          COALESCE((SELECT COUNT(*) FROM articles WHERE author_id = u.id), 0) AS articles,
          COALESCE((SELECT COUNT(*) FROM shopreviews WHERE user_id = u.id), 0) AS reviews
          FROM users u
          LEFT JOIN coffeeexperts ce ON u.id = ce.id
          LEFT JOIN expertspecialization es ON ce.id = es.user_id
          LEFT JOIN specialization sp ON sp.id = es.specialization_id
        `;
        break;
      default:
        return res.status(400).json("Invalid user type");
    }

    // Complete query with joins common to all user types
    const finalQuery = `
      ${baseQuery}
      ${additionalQuery}
      LEFT JOIN usertags uts ON u.id = uts.user_id
      LEFT JOIN tags t ON uts.tag_id = t.tag_id
      LEFT JOIN usercoffeebeans ub ON u.id = ub.user_id
      LEFT JOIN coffeebeans cb ON ub.bean_id = cb.bean_id
      LEFT JOIN userbrewingmethods ubm ON u.id = ubm.user_id
      LEFT JOIN brewingmethods bm ON bm.method_id = ubm.method_id
      LEFT JOIN usercoffeetypes uft ON u.id = uft.user_id
      LEFT JOIN coffeetypes ct ON uft.type_id = ct.type_id
      LEFT JOIN userallergies ua ON u.id = ua.user_id
      LEFT JOIN allergies al ON ua.allergy_id = al.allergy_id
      JOIN usertype ut ON u.user_type_id = ut.id
      LEFT JOIN gender g ON u.gender_id = g.id
      LEFT JOIN city c ON u.city_id = c.id
      LEFT JOIN status s ON u.status_id = s.id
      WHERE u.id = ?
    `;

    // Execute the query
    const [data] = await db.query(finalQuery, [userId]);

    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude the password and send the rest of the user info
    const { password, ...info } = data[0];
    return res.json(info);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err });
  }
};

export const updateRegUser = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    const {
      name,
      email,
      city,
      gender,
      bio,
      fav_beans,
      fav_brewing_methods,
      fav_coffee_type,
      allergies,
      tags,
      dob,
      phone,
      coverPic,
      profilePic,
      highest_education,
      specialization,
    } = req.body;

    console.log(req.body);

    const [[cityResult]] = await db.query(
      `SELECT id FROM city WHERE city_name = ?`,
      [city]
    );
    const [[genderResult]] = await db.query(
      `SELECT id FROM gender WHERE gender_name = ?`,
      [gender]
    );

    const city_id = cityResult?.id || null;
    const gender_id = genderResult?.id || null;

    // Conditional values to prevent updating with empty fields
    const dobValue = dob !== "" ? dob : null;

    const updateQuery = `
     UPDATE users
     SET name = ?, email = ?, city_id = ?, gender_id = ?, 
         dob = COALESCE(?, dob), phone = ?, profilePic = ?, coverPic = ?
     WHERE id = ?;
   `;

    const values = [
      name,
      email,
      city_id,
      gender_id,
      dobValue, // Use COALESCE to retain original value if dob is null
      phone,
      profilePic,
      coverPic,
      userInfo.id,
    ];

    const [response] = await db.query(updateQuery, values);
    const userTypeQuery = `SELECT ut.type_name AS type 
    FROM users u 
    JOIN usertype ut ON u.user_type_id = ut.id
    WHERE u.id = ?`;

    const [userTypeData] = await db.query(userTypeQuery, [userInfo.id]);

    if (userTypeData.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const insertPreferences = async (
      tableName,
      columnId,
      nameColumn,
      values
    ) => {
      const insertPromises = values.map(async (name) => {
        const [result] = await db.query(
          `SELECT ${columnId} FROM ${tableName.replace(
            "user",
            ""
          )} WHERE ${nameColumn} = ?`,
          [name]
        );

        if (result.length > 0) {
          const id = result[0][columnId];
          const query = `
          INSERT INTO ${tableName} (user_id, ${columnId}) 
          VALUES (?, ?)
        `;
          return db.query(query, [userInfo.id, id]);
        }
      });
      await Promise.all(insertPromises);
    };

    // Delete existing preferences
    await db.query("DELETE FROM usercoffeebeans WHERE user_id = ?", [
      userInfo.id,
    ]);
    await db.query("DELETE FROM userbrewingmethods WHERE user_id = ?", [
      userInfo.id,
    ]);
    await db.query("DELETE FROM usercoffeetypes WHERE user_id = ?", [
      userInfo.id,
    ]);
    await db.query("DELETE FROM userallergies WHERE user_id = ?", [
      userInfo.id,
    ]);
    await db.query("DELETE FROM usertags WHERE user_id = ?", [userInfo.id]);

    // Insert new preferences if provided
    if (fav_beans.length > 0) {
      await insertPreferences(
        "usercoffeebeans",
        "bean_id",
        "bean_name",
        fav_beans
      );
    }
    if (fav_brewing_methods.length > 0) {
      await insertPreferences(
        "userbrewingmethods",
        "method_id",
        "method_name",
        fav_brewing_methods
      );
    }
    if (fav_coffee_type.length > 0) {
      await insertPreferences(
        "usercoffeetypes",
        "type_id",
        "type_name",
        fav_coffee_type
      );
    }
    if (allergies.length > 0) {
      await insertPreferences(
        "userallergies",
        "allergy_id",
        "allergy_name",
        allergies
      );
    }
    if (tags.length > 0) {
      await insertPreferences("usertags", "tag_id", "tag_name", tags);
    }

    // return res.status(200).json("Success");

    const userType = userTypeData[0].type.toLowerCase();
    switch (userType) {
      case "regular":
        await db.query(
          `UPDATE regularusers 
      SET bio = ? 
      WHERE id = ?`,
          [bio, userInfo.id]
        );
        break;
      case "owner":
        await db.query(
          `UPDATE shopowners 
        SET bio = ? 
        WHERE id = ?`,
          [bio, userInfo.id]
        );
        break;
      case "expert":
        await db.query(
          `Update coffeeexperts SET bio = ?, highest_education = ? WHERE id = ?`,
          [bio, highest_education, userInfo.id]
        );
        await db.query("DELETE FROM expertspecialization WHERE user_id = ?", [
          userInfo.id,
        ]);
        if (specialization.length > 0) {
          const insertExpertSpecializationPromises = specialization.map(
            async (name) => {
              const [result] = await db.query(
                `SELECT id FROM specialization WHERE specialization_name = ?`,
                [name]
              );
              if (result.length > 0) {
                const id = result[0][columnId];
                const query = `
                     INSERT INTO expertspecialization (user_id, specialization_id) 
                     VALUES (?, ?)
                   `;
                return db.query(query, [userInfo.id, id]);
              }
            }
          );
          await Promise.all(insertExpertSpecializationPromises);
        }
        break;
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const getUserActivities = async (req, res) => {
  const token = req.cookies.accessToken;

  const { id } = req.query;
  if (!token) {
    return res.status(401).json("Not Logged In!");
  }

  try {
    const userInfo = jwt.verify(token, "secretkey"); // Verify the token

    const query = `
    SELECT 
      a.activity_id, 
      at.message AS description, 
      a.create_on AS date, 
      u.username, 
      u.profilePic, 
      at.type_name AS activity_type
    FROM activity a
    JOIN users u ON a.user_id = u.id
    JOIN activitytype at ON a.type_id = at.id
    WHERE u.id = ?
    ORDER BY a.create_on DESC
  `;

    const [activities] = await db.query(query, [id]); // Using mysql2 with .promise()
    // Format the date using moment
    const formattedActivities = activities.map((activity) => ({
      ...activity,
      date: moment(activity.date).format("DD MMM YYYY"), // Format to "30 Nov 2024"
    }));

    return res.status(200).json(formattedActivities);
  } catch (err) {
    console.error("Error fetching activities:", err); // Log the error
    return res.status(500).json("Error fetching activities from the database");
  }
};

export const getUserNotification = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json("Not Logged In!");
  }

  let userInfo;
  try {
    userInfo = jwt.verify(token, "secretkey"); // Verify the token
  } catch (err) {
    return res.status(403).json("Invalid Token!");
  }

  try {
    const userId = userInfo.id; // assuming `userInfo` contains the `id` of the user
    const query = `
      SELECT 
        a.activity_id, 
        at.message AS description, 
        a.create_on AS date, 
        u.username, 
        u.profilePic, 
        at.type_name AS activity_type
      FROM activity a
      JOIN users u ON a.user_id = u.id
      JOIN activitytype at ON a.type_id = at.id
      WHERE u.id = ?
      ORDER BY a.create_on DESC
    `;

    // Pass `userId` as the value for the `?` placeholder
    const [notifications] = await db.query(query, [userId]);

    return res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err); // Log the error
    return res
      .status(500)
      .json("Error fetching notifications from the database");
  }
};

//get all articles
export const getArticles = async (req, res) => {
  const userId = req.query.userId;

  try {
    let query = `
        SELECT 
          a.id, a.title, a.content, a.img, a.created_at,
          u.name AS authorName, u.profilePic AS authorProfilePic,
          GROUP_CONCAT(at.topic_name SEPARATOR ', ') AS topics
        FROM articles a
        LEFT JOIN article_topics at_rel ON a.id = at_rel.article_id
        LEFT JOIN articletopic at ON at_rel.topic_id = at.id
        LEFT JOIN users u ON a.author_id = u.id
      `;

    const params = [];

    if (userId) {
      query += ` WHERE a.author_id = ?`;
      params.push(userId);
    }

    query += ` GROUP BY a.id ORDER BY a.created_at DESC`;

    const [data] = await db.query(query, params);

    if (userId && data.length === 0) {
      return res.status(404).json("No articles found for this user");
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching articles:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch articles", details: err });
  }
};

export const getUserPlan = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged In!");

    const userInfo = jwt.verify(token, "secretkey");

    const [typeResult] = await db.query(
      `SELECT t.id FROM usertype t JOIN users u ON u.user_type_id = t.id WHERE u.id = ?`,
      [userInfo.id]
    );
    const type_id = typeResult[0].id;
    const getPlanQuery = `SELECT * FROM subscription WHERE user_type_id = ? ORDER BY price ASC;`;
    const [planResult] = await db.query(getPlanQuery, [type_id]);

    return res.status(200).json(planResult);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Server Error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const upgradePlan = async (req, res) => {
  const { plan } = req.query;
  console.log(plan);

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged In!");

    const userInfo = jwt.verify(token, "secretkey");
    const [typeResult] = await db.query(
      `SELECT t.type_name FROM usertype t JOIN users u ON u.user_type_id = t.id WHERE u.id = ?`,
      [userInfo.id]
    );

    if (!typeResult || typeResult.length === 0) {
      return res.status(404).json("User type not found");
    }

    const getPlanQuery = `SELECT * FROM subscription WHERE id = ?`;
    const [planResult] = await db.query(getPlanQuery, [plan]);
    const selectedPlan = planResult[0];

    const userType = typeResult[0].type_name;
    let upgradePlanQuery = "";
    let upgradeResult;

    switch (userType) {
      case "regular":
        // Calculate the expiration date for 30 days from now
        const expirationDate = moment().add(30, "days").format("YYYY-MM-DD");

        upgradePlanQuery = `UPDATE regularusers SET subscription_id = ?, subscription_expired_date = ? WHERE id = ?`;
        [upgradeResult] = await db.query(upgradePlanQuery, [
          selectedPlan.id,
          expirationDate,
          userInfo.id,
        ]);

        if (upgradeResult.affectedRows === 0) {
          return res.status(400).json("No Record Updated");
        } else {
          return res.status(200).json("Upgraded successfully");
        }

      case "owner":
        upgradePlanQuery = `UPDATE shopowners SET coins = coins + ? WHERE id = ?`;
        [upgradeResult] = await db.query(upgradePlanQuery, [
          selectedPlan.subscription_point,
          userInfo.id,
        ]);

        if (upgradeResult.affectedRows === 0) {
          return res.status(400).json("No Record Updated");
        } else {
          return res.status(200).json("Upgraded successfully");
        }

      default:
        return res.status(400).json("Invalid user type");
    }
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Server Error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// search all users
export const searchUsers = async (req, res) => {
  const { query, userId } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID parameter is required" });
  }

  try {
    const [results] = await db.execute(
      `SELECT u.id, u.username, u.email, u.name, u.profilePic, ut.type_full_name, fr.created_at
       FROM users AS u
       LEFT JOIN friendrequest AS fr ON u.id = fr.sender_id OR u.id = fr.recipient_id
       JOIN usertype AS ut ON u.user_type_id = ut.id
       WHERE u.name LIKE ? AND u.id != ?
       ORDER BY fr.created_at IS NULL, fr.created_at DESC`,
      [`${query}%`, userId]
    );

    res.status(200).json({ users: results });
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOwnerCoins = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json("Not Logged In!");
  }

  try {
    const userInfo = jwt.verify(token, "secretkey"); // Verify the token to get the user ID

    // Query to fetch the coin balance for the logged-in shop owner using userInfo.id
    const query = `SELECT coins FROM shopowners WHERE id = ?`;

    const [result] = await db.query(query, [userInfo.id]);

    // Check if the owner was found
    if (result.length === 0) {
      return res.status(404).json({ message: "Shop owner not found" });
    }

    // Send the coin balance in the response
    res.status(200).json({ coins: result[0].coins });
  } catch (err) {
    console.error("Error retrieving owner's coins:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// get all notifications 
export const getNotifications = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const userId = userInfo.id;

    const query = `
      SELECT 
        u.profilePic, u.name as from_name, an.*, u.user_type_id
      FROM allnotification as an
      JOIN users as u on an.from_id = u.id
      WHERE receiver = ?
      ORDER BY created_on DESC;
    `;

    const [notifications] = await db.query(query, [userId]);

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const [result] = await db.execute(
      "UPDATE allnotification SET isread = ? WHERE id = ?",
      ["read", notificationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  // Extract the token from cookies (or Authorization header, depending on your setup)
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json("Not Logged In!"); // Token is missing, user is not authenticated
  }
  
  try {
    // Verify the token and decode it to extract user data
    const decodedToken = jwt.verify(token, "secretkey"); // Replace with your actual secret key
    
    // Extract userId from the decoded token (assuming the userId is stored in the payload)
    const userId = decodedToken.id; 
    
    if (!userId) {
      return res.status(400).json("User ID not found in token");
    }
    
    // Update all notifications to 'read' for the user
    const [result] = await db.execute(
      "UPDATE allnotification SET isread = ? WHERE receiver = ?",
      ["read", userId]
    );

    // Check if any rows were affected (i.e., notifications were updated)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No notifications found to update" });
    }

    // Respond with success message
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};