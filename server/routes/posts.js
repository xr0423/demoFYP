import express from "express";
import { 
  getPosts, 
  addPosts, 
  deletePost, 
  updatePost, 
  getPostById, 
  getCategories,
  getAllPostsWithImage,
  getPostsByShop,
  sharePost,
} from "../controllers/post.js";
import { 
  addFavorite, 
  getFavorites, 
  deleteFavorites, 
  isPostSaved 
} from "../controllers/favorite.js";

const router = express.Router();


router.post("/sharepost", sharePost);

router.post("/favorites", addFavorite);
router.get("/favorites", getFavorites);
router.delete("/favorites", deleteFavorites);
router.get('/favorites/:id', isPostSaved);

router.get('/getcategory', getCategories);

// Existing routes
router.get("/postsByShop", getPostsByShop)
router.get("/with-images", getAllPostsWithImage);  // must be above the "/" !!!!!!!!!!!!!!!!!!!!!!!
router.get("/", getPosts);

router.get("/:id", getPostById);
router.delete("/:id", deletePost);
router.put("/:postId", updatePost); 
router.post("/", addPosts);

export default router;
