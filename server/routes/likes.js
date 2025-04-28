import express from "express";
import { getLikes, addLike, deleteLike,
    getArticleLike, addArticleLike, deleteArticleLike
} from "../controllers/like.js";

const router = express.Router();

router.get("/", getLikes);
router.post("/", addLike);
router.delete("/", deleteLike);

router.get("/getArtLike", getArticleLike);
router.post("/addArtLike", addArticleLike);
router.delete("/deleteArtLike", deleteArticleLike);

export default router;
