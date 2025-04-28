import { db } from "../connect.js"; // Assuming db is your database connection
import jwt from "jsonwebtoken"; // If you need token verification

// Fetch inquiry types from the database
export const getRelatedData = async (req, res) => {
  try {
    const [relatedData] = await db.query(`SELECT 
                                        s.id AS subject_id, 
                                        s.subject_name,
                                        GROUP_CONCAT(DISTINCT o.option_name) AS subOption
                                        FROM contactus_subjects s
                                        LEFT JOIN contactus_subjects_options o ON (o.subject_id = s.id)
                                        GROUP BY s.id;`
                                   );
    return res.status(200).json(relatedData);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch inquiry types", details: err });
  }
};

export const addFeedback = async (req, res) => {
  console.log("Add Feedback");
  console.log(req.body);
  const { name, email, subject, option, message } = req.body;

  try {
    // Fetch the subject_id based on the subject name
    const [subjectResult] = await db.query(`
      SELECT id FROM contactus_subjects WHERE subject_name = ?;
    `, [subject]);

    // Check if the subject exists
    if (subjectResult.length === 0) {
      return res.status(400).json({ error: "Invalid subject provided." });
    }
    const subjectId = subjectResult[0].id;

    // Fetch the option_id based on the option name if an option is provided
    let optionId = null;
    if (option) {
      const [optionResult] = await db.query(`
        SELECT id FROM contactus_subjects_options WHERE option_name = ? AND subject_id = ?;
      `, [option, subjectId]);

      // Check if the option exists
      if (optionResult.length > 0) {
        optionId = optionResult[0].id;
      } else {
        return res.status(400).json({ error: "Invalid option provided." });
      }
    }

    // SQL query to insert the contact us submission into the database
    const insertQuery = `
      INSERT INTO contactus_submission (name, email, subject_id, option_id, message)
      VALUES (?, ?, ?, ?, ?);
    `;

    // Values to be inserted
    const values = [name, email, subjectId, optionId, message];

    // Execute the insert query
    await db.query(insertQuery, values);

    res.status(200).json({ message: "Feedback submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit feedback", details: err.message });
  }
};
