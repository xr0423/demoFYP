import express from "express";
import { validateUser, searchUserOnly, searchAll, searchPostsOnly,
     searchShoplistingsOnly, searchEventsOnly, searchExpertOnly } from "../controllers/search.js";

const router = express.Router();

router.get('/', validateUser, searchAll)
router.get('/user', validateUser, searchUserOnly);
router.get('/expert', validateUser, searchExpertOnly);
router.get('/post', validateUser, searchPostsOnly);
router.get('/shoplisting', validateUser, searchShoplistingsOnly);
router.get('/event', validateUser, searchEventsOnly);

export default router;