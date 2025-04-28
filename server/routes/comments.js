import express from "express";
import { getComments, addComment
    , getArticleComments, addArticleComment
 } from "../controllers/comment.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", addComment);

router.get("/getArticleComments", getArticleComments);
router.post("/addArticleComment", addArticleComment);
export default router;
