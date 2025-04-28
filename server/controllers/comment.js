import { db } from "../connect.js";
import jwt from 'jsonwebtoken';
import moment from "moment";

export const getComments = async (req, res) => {
    try {
        const { postId } = req.query;

        const query = `
            SELECT 
                c.*, 
                u.id AS userid, 
                u.name, 
                u.profilePic,
                (SELECT COUNT(*) FROM comments WHERE postid = ?) AS totalComments
            FROM comments AS c
            JOIN users AS u ON u.id = c.userid
            WHERE c.postid = ?
            ORDER BY c.createdAt DESC
        `;

        const [data] = await db.query(query, [postId, postId]);
        const totalComments = data.length > 0 ? data[0].totalComments : 0;

        return res.status(200).json({ totalComments, comments: data });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

// Add a New Comment to a Post
export const addComment = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json("Not Logged IN!");

        const userInfo = jwt.verify(token, "secretkey");

        const query = `
            INSERT INTO comments (\`desc\`, \`createdAt\`, \`userid\`, \`postid\`) 
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            req.body.desc,
            moment().format("YYYY-MM-DD HH:mm:ss"),
            userInfo.id,
            req.body.postId
        ];

        await db.query(query, values);
        return res.status(200).json("Comment has been created");

    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json("Token is not valid!");
        }
        console.error(err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

// Get Comments for an Article
export const getArticleComments = async (req, res) => {
    try {
        const { articleId } = req.query;

        const query = `
            SELECT 
                c.*, 
                u.id AS userid, 
                u.name, 
                u.profilePic,
                (SELECT COUNT(*) FROM comments WHERE articleid = ?) AS totalComments
            FROM comments AS c
            JOIN users AS u ON u.id = c.userid
            WHERE c.articleid = ?
            ORDER BY c.createdAt DESC
        `;

        const [data] = await db.query(query, [articleId, articleId]);

        // Log the fetched data to check profilePic field for each comment
        console.log("Fetched Comments Data:", data);

        // Verify if profilePic is present for each comment
        data.forEach(comment => {
            console.log(`Comment ID: ${comment.id}, Profile Pic: ${comment.profilePic}`);
        });
        
        const totalComments = data.length > 0 ? data[0].totalComments : 0;

        return res.status(200).json({ totalComments, comments: data });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

// Add a New Comment to an Article
export const addArticleComment = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json("Not Logged IN!");

        const userInfo = jwt.verify(token, "secretkey");

        const query = `
            INSERT INTO comments (\`desc\`, \`createdAt\`, \`userid\`, \`articleid\`) 
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            req.body.desc,
            moment().format("YYYY-MM-DD HH:mm:ss"),
            userInfo.id,
            req.body.articleId
        ];

        await db.query(query, values);
        return res.status(200).json("Article comment has been created");

    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json("Token is not valid!");
        }
        console.error(err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};
