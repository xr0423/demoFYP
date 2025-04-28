import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate random verification code
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString("hex"); // Generates a 6-character code
};

// New route for sending verification code
export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email already exists
    const emailQuery = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
    const [emailData] = await db.query(emailQuery, [email]);

    if (emailData.length) {
      return res.status(409).json("Email already in use");
    }
    console.log("Verification code");

    // Generate a new verification code
    const verificationCode = generateVerificationCode();

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ilikecoffeeapp@gmail.com",
        pass: "otmc ksit vhvb hkyw",
      },
    });

    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d2a679;">Welcome to I Like That Coffee!</h2>
      <p>We're excited to have you join our community of coffee enthusiasts, shop owners, and experts.</p>
      <p>Your email verification code is:</p>
      <h3 style="color: #d2a679; background-color: #f9f9f9; padding: 10px; border-radius: 5px; text-align: center;">
        ${verificationCode}
      </h3>
      <p>Please enter this code in the app to verify your email and get started.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <footer style="font-size: 0.9em; color: #555;">
        <p>Thank you for joining us!</p>
        <p>
          <strong>I Like That Coffee Team</strong>
        </p>
        <p style="font-size: 0.8em; color: #777;">
          If you have any questions, feel free to contact us at 
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
      from: "ilikecoffeeapp@gmail.com",
      to: email,
      subject: "Verify Your Email for I Like That Coffee",
      html: htmlMessage,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.log(err);
        console.error("Error sending email: ", err);
        return res.status(500).json("Failed to send verification email.");
      }

      // Update or insert the verification code in the database
      const upsertQuery = `
          INSERT INTO email_verification (email, verification_code, created_at)
          VALUES (?, ?, NOW())
          ON DUPLICATE KEY UPDATE
          verification_code = VALUES(verification_code),
          created_at = VALUES(created_at)
        `;
      await db.query(upsertQuery, [email, verificationCode]);

      res
        .status(200)
        .json({ message: "Verification code sent", code: verificationCode });
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Registration function (after verifying the code)
export const register = async (req, res) => {
  const { email, verificationCode, username, password, name, type, documents } =
    req.body;
  try {
    // Check if the verification code is correct and not expired (within 10 minutes)
    const codeQuery = `
        SELECT * FROM email_verification 
        WHERE TIMESTAMPDIFF(MINUTE, created_at, NOW()) <= 10
      `;
    const [codeData] = await db.query(codeQuery, [email, verificationCode]);

    if (codeData.length === 0) {
      return res.status(400).json("Expired verification code");
    }

    // Check if username already exists
    const usernameQuery =
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?)";
    const [usernameData] = await db.query(usernameQuery, [username]);

    if (usernameData.length) {
      return res.status(409).json("Username already exists");
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const status = type === "regular" ? "active" : "pending";
    const [statusResult] = await db.query(
      `SELECT id FROM status WHERE status_name = ?`,
      [status]
    );
    const status_id = statusResult[0].id;

    // Create new user
    const a =
      "INSERT INTO users (username, email, password, name, user_type_id, status_id) VALUES (?, ?, ?, ?, (SELECT id FROM usertype WHERE type_name = ?), ?)";
    const userValues = [username, email, hashedPassword, name, type, status_id];

    const [result] = await db.query(a, userValues);
    // Delete verification code from email_verification table after successful registration
    const deleteVerificationQuery =
      "DELETE FROM email_verification WHERE email = ?";
    await db.query(deleteVerificationQuery, [email]);

    // Insert a record into the appropriate table based on user type
    let insertQuery;

    switch (req.body.type.toLowerCase()) {
      case "owner":
        insertQuery = "INSERT INTO shopowners (id) VALUES (?)";
        break;
      case "regular":
        insertQuery = "INSERT INTO regularusers (id) VALUES (?)";
        break;
      case "expert":
        insertQuery = "INSERT INTO coffeeexperts (id) VALUES (?)";
        break;
      default:
        return res.status(400).json("Invalid user type");
    }

    // Execute the insert query
    await db.query(insertQuery, [result.insertId]);

    // Insert documents for non-regular users
    if (type.toLowerCase() !== "regular" && documents && documents.length > 0) {
      const documentInsertPromises = documents.map((doc) => {
        const documentQuery = `INSERT INTO document (name, user_id) VALUES (?, ?)`;
        return db.query(documentQuery, [doc, result.insertId]);
      });

      await Promise.all(documentInsertPromises);
    }

    if (type.toLowerCase() === "regular" || "expert") {
      await db.query(`INSERT INTO rewardpoints (user_id) VALUES (?)`, [
        result.insertId,
      ]);
    }

    res.status(200).json("User has been successfully registered");
  } catch (err) {
    console.log("Registration error:", err);
    return res
      .status(500)
      .json({ error: "Registration failed", details: err.message });
  }
};

// tested ok with new database design
export const login = async (req, res) => {
  try {
    const q =
      "SELECT u.id, u.username, u.email, u.password, u.name, u.coverPic, u.profilePic, \
      g.gender_name AS gender, ut.type_name AS type, s.status_name AS status, \
      u.dob, u.phone, u.created_on \
        FROM users u JOIN usertype ut ON u.user_type_id = ut.id\
         LEFT JOIN gender g ON u.gender_id = g.id \
         LEFT JOIN status s ON u.status_id = s.id WHERE username = ?";
    const [data] = await db.query(q, [req.body.username]);

    if (data.length === 0) {
      return res.status(404).json("User not found!");
    }

    const userStatus = data[0].status;

    if (userStatus === "pending") {
      return res.status(401).json({
        error: "Account Pending Verification",
        message:
          "Your account is awaiting admin verification. Please try login in later.",
      });
    } else if (userStatus === "suspended") {
      return res.status(401).json({
        error: "Account Suspended",
        message: `Your account has been suspended. \nTo reactivate your account, please contact support and provide your username`,
      });
    }

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!checkPassword) {
      return res.status(400).json("Wrong password or username");
    }

    // Check if the user type is 'regular'
    let subscriptionId = null;
    let isExpired = true;

    if (data[0].type === "regular") {
      const subscriptionQuery = `
    SELECT subscription_id, subscription_expired_date 
    FROM regularusers 
    WHERE id = ?
  `;

      const [subscriptionData] = await db.query(subscriptionQuery, [data[0].id]);

      if (subscriptionData.length > 0) {
        subscriptionId = subscriptionData[0].subscription_id;

        // Check if subscriptionId exists
        if (subscriptionId) {
          const today = new Date();
          const expirationDate = subscriptionData[0].subscription_expired_date ? new Date(subscriptionData[0].subscription_expired_date) : null;
          console.log(expirationDate)

          // If expirationDate is null, it means no expiration, so isExpired is false
          if (expirationDate === null || expirationDate <= today) {
            isExpired = true;
          } else {
            isExpired = false;
          }
        }
      }
    }

    // Create session token
    const token = jwt.sign({ id: data[0].id }, "secretkey");

    const { password, ...others } = data[0]; // Exclude password

    // If subscriptionId exists, add it to the 'others' object
    if (subscriptionId) {
      others.subscriptionId = subscriptionId;
      others.isExpired = isExpired;
    } else {
      others.subscriptionId = null;
      others.isExpired = isExpired;
    }
    res
      .cookie("accessToken", token, { httpOnly: true })
      .status(200)
      .json(others);
  } catch (err) {
    return res.status(500).json("error" + err);
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("User has been logged out.");
};
