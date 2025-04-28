import { db } from "../connect.js";

export const getContentBySection = async (req, res) => {
     const { section_name } = req.query;
 
     if (!section_name) {
         return res.status(400).json({ message: "Section name is required." });
     }
 
     try {
         // Query to fetch content for the specific section, ordered by content_order
         const [results] = await db.query(
             `SELECT * FROM sectioncontent WHERE section_name = ? ORDER BY content_order ASC`,
             [section_name]
         );
 
         return res.status(200).json(results);
     } catch (error) {
         console.error("Error retrieving content:", error);
         return res.status(500).json({ message: "Failed to retrieve content.", error: error.message });
     }
 };
 