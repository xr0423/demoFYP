import express from "express";
import {
  getArticleTopics,
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addArticleCollab,
  getArticleCollabs,
  removeArticleCollab,
  getCollaborators,
  getCollaboratorArticles,
  removeCollaborator,
  shareArticle,
} from "../controllers/articles.js";

const router = express.Router();

router.post("/sharearticle", shareArticle);

router.get("/getTopics", getArticleTopics);

// Route to create a new article
router.post("/", createArticle);
// Route to get all articles
router.get("/", getArticles);
// Get a single article by its ID
router.get("/details/:articleId", getArticleById);
// Route to update an article (by ID)
router.put("/:id", updateArticle);
// Route to delete an article (by ID)
router.delete("/:id", deleteArticle);

// add a new collaborator to an article
router.post("/addCollab", addArticleCollab);
// get all collaborators for a specific article
router.get("/getCollabs/:articleId", getArticleCollabs);
// remove a collaborator from an article
router.delete("/removeCollab/:articleId/:collaboratorId", removeArticleCollab);
//remove the collaborator
router.delete("/removeCollaborator/:collaboratorId", removeCollaborator);
// get all collaborators for the current user
router.get("/getAllCollaborators/:userId", getCollaborators);
// get articles with a specific collaborator
router.get("/getCollabsArticles/:collaboratorId", getCollaboratorArticles);
export default router;
