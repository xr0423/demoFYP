import { db } from "../connect.js";
import jwt from 'jsonwebtoken';
import moment from 'moment';

export const getAdvertisePost = async (req, res) => {
     try {
          // Get today's date in the format YYYY-MM-DD
          const todayDate = moment().format('YYYY-MM-DD');

          // Query to retrieve posts that are advertised and have not expired
          const [posts] = await db.query(`
               SELECT 
                    p.id, 
                    p.desc, 
                    p.userid, 
                    u.username,
                    u.profilePic,
                    p.createdAt, 
                    p.advertised, 
                    p.advertise_expire_date, 
                    p.shop_id,
                    s.name AS shop_name, 
                    s.img as shop_img
               FROM posts p
               LEFT JOIN shoplistings s ON p.shop_id = s.shop_id
               LEFT JOIN users u ON u.id = p.userid
               WHERE p.advertised = TRUE AND p.advertise_expire_date >= ?
               ORDER BY p.createdAt DESC
               LIMIT 5;
          `, [todayDate]);

          // If no posts found, return an empty array
          if (!posts.length) {
               return res.status(200).json([]);
          }

          const postIds = posts.map(post => post.id);
          const [images] = await db.query(`
            SELECT pi.post_id, pi.img
            FROM postimage pi
            WHERE pi.post_id IN (?)
        `, [postIds]);

          // Query to get all categories for the retrieved posts
          const [categories] = await db.query(`
          SELECT pc.post_id, c.name AS category_name
          FROM postcategories pc
          JOIN postcategory c ON pc.category_id = c.id
          WHERE pc.post_id IN (?)
      `, [postIds]);

          // Map images and categories to their respective posts with random image selection
          const postsWithDetails = posts.map(post => {
               const postImages = images.filter(image => image.post_id === post.id);
               const selectedImage = postImages.length > 1
                    ? postImages[Math.floor(Math.random() * postImages.length)].img // Select random image if more than one
                    : (postImages[0]?.img || null); // Use the only image or null if none

               return {
                    ...post,
                    image: selectedImage,
                    categories: categories.filter(category => category.post_id === post.id).map(category => category.category_name)
               };
          });

          // Send the detailed posts as the response
          res.status(200).json(postsWithDetails);
     } catch (error) {
          console.error('Error retrieving advertised posts:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
};