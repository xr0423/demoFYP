import express from "express";
import { getfavPost, getfavShop, getfavArticle
    ,delfavPost, delfavShop, delfavArticle
    ,addfavPost, addfavShop, addfavArticle,
    getPostFavStatus, getShopFavStatus, getArticleFavStatus
} from "../controllers/favorite.js";

const router = express.Router();

router.post('/addfavPost', addfavPost);
router.post('/addfavShop', addfavShop);
router.post('/addfavArticle', addfavArticle);

router.get('/getfavPost', getfavPost);
router.get('/getfavShop', getfavShop);
router.get('/getfavArticle', getfavArticle);

router.delete("/delfavPost", delfavPost);
router.delete("/delfavShop", delfavShop);
router.delete("/delfavArticle", delfavArticle);

router.get("/post/favStatus/:id", getPostFavStatus);
router.get("/shop/favStatus/:id", getShopFavStatus);
router.get("/article/favStatus/:id", getArticleFavStatus);

export default router;

