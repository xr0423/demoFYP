import "./articleCollabs.scss";
import React, { useState, useContext, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Articlecollabs = ({ topicsFilter }) => {
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [collaboratorArticles, setCollaboratorArticles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);

  // click on collab article
  const handleCardClick = (article_id) => {
    navigate(`/expert/articledetails/${article_id}`);
  };

  // Fetch Topics from Database
  const {
    data: topics,
    isLoading: loadingTopics,
    error: topicsError,
  } = useQuery({
    queryKey: ["articleTopics"],
    queryFn: () =>
      makeRequest.get("/articles/getTopics").then((res) => res.data),
    onError: (error) => console.error("Error fetching topics:", error),
  });

  const {
    data: collaborators,
    isLoading: loadingCollaborators,
    error: collaboratorError,
  } = useQuery({
    queryKey: ["collaborators", userId],
    queryFn: () =>
      makeRequest
        .get(`/articles/getAllCollaborators/${userId}`)
        .then((res) => res.data),
    enabled: !!userId,
  });

  useEffect(() => {
    console.log("Collaborators data:", collaborators);
  }, [collaborators]);
  

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      const fileType = file.type;
      return (
        fileType.includes("jpeg") ||
        fileType.includes("jpg") ||
        fileType.includes("pdf")
      );
    });

    if (validFiles.length !== selectedFiles.length) {
      setErrorMsg("Only JPG and PDF files are allowed.");
    } else if (files.length + validFiles.length > 5) {
      setErrorMsg("You can upload a maximum of 5 images.");
    } else {
      setErrorMsg("");
      setFiles([...files, ...validFiles]); // Append new files
    }
  };

  const fetchCollaboratorArticles = async (collaboratorId) => {
    try {
      const articles = await makeRequest.get(
        `/articles/getCollabsArticles/${collaboratorId}`
      );
      const fetchedArticles = articles.data;

      // Filter articles based on topicsFilter
      const filtered = fetchedArticles.filter((article) => {
        const articleTopics = article.topics
          ? article.topics.split(",").map((topic) => topic.trim().toLowerCase())
          : [];
        if (!topicsFilter || topicsFilter.length === 0) return true;
        return topicsFilter.every((filterTopic) =>
          articleTopics.includes(filterTopic.toLowerCase())
        );
      });

      setCollaboratorArticles(filtered); // Update state with the filtered articles
    } catch (error) {
      console.error("Error fetching articles for collaborator:", error);
    }
  };

  useEffect(() => {
    // Re-filter articles whenever topicsFilter changes
    if (selectedCollaborator) {
      fetchCollaboratorArticles(selectedCollaborator.id);
    }
  }, [topicsFilter]);

  console.log(collaboratorArticles);
  console.log(topicsFilter);

  const handleCollaboratorClick = (collaborator) => {
    setSelectedCollaborator(collaborator);
    fetchCollaboratorArticles(collaborator.id);
  };

  const handleEditClick = (article) => {
    setCurrentArticle(article);
    const articleTopics = Array.isArray(article.topics)
      ? article.topics
      : article.topics?.split(",").map((topic) => topic.trim()) || [];
    setSelectedTopics(articleTopics);
    setIsEditModalOpen(true);
    setMenuOpen(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const content = e.target.content.value;

    // Validate title and content length
    if (title.length > 50) {
      setErrorMsg("Title cannot exceed 50 characters.");
      return;
    }
    if (content.length < 200) {
      setErrorMsg("Content must be at least 200 characters.");
      return;
    }

    // Proceed with file upload and submission if validation passes
    const uploadImages = async () => {
      if (files.length === 0) return [];
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const response = await makeRequest.post("/upload-multiple", formData);
        return response.data;
      } catch (err) {
        console.error("Error uploading images:", err);
        return [];
      }
    };

    const imgUrls = await uploadImages();
    const updatedArticle = {
      id: currentArticle.id,
      title: e.target.title.value,
      content: e.target.content.value,
      topics: selectedTopics,
      img: imgUrls,
    };
    editMutation.mutate(updatedArticle);
  };

  const editMutation = useMutation({
    mutationFn: (updatedArticle) =>
      makeRequest.put(`/articles/${updatedArticle.id}`, updatedArticle),
    onSuccess: () => {
      queryClient.invalidateQueries(["collaborators", userId]);
      queryClient.invalidateQueries([
        "collaboratorArticles",
        selectedCollaborator?.id,
      ]);
      fetchCollaboratorArticles(selectedCollaborator?.id);
      setIsEditModalOpen(false);
      setSelectedTopics([]);
    },
    onError: (error) => console.error("Error updating article:", error),
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSelectedTopics((prevTopics) => {
      if (checked) {
        if (prevTopics.length >= 5) {
          alert("You can select a maximum of 5 topics.");
          return prevTopics;
        }
        return [...prevTopics, name];
      } else {
        return prevTopics.filter((topic) => topic !== name);
      }
    });
  };

  const toggleMenu = (e, articleId) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === articleId ? null : articleId);
  };

  const handleRemoveCollabs = (articleId, collaboratorId) => {
    removeCollabsMutation.mutate({ articleId, collaboratorId });
  };

  const removeCollabsMutation = useMutation({
    mutationFn: (data) =>
      makeRequest.delete(
        `/articles/removeCollab/${data.articleId}/${data.collaboratorId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["collaborators", userId]);
      alert("Collaborated article removed successfully!");
      fetchCollaboratorArticles(selectedCollaborator?.id); // Refresh articles after removal
    },
    onError: (error) => console.error("Error removing collaborator:", error),
  });

  const removecollaborator = (e, collaboratorId) => {
    e.stopPropagation();
    removeCollaboratorMutation.mutate({ collaboratorId });
  };

  const removeCollaboratorMutation = useMutation({
    mutationFn: ({ collaboratorId }) =>
      makeRequest.delete(`/articles/removeCollaborator/${collaboratorId}`),
    onSuccess: (data, variables) => {
      const { collaboratorId } = variables; // Destructure collaboratorId from mutation variables

      // Optimistically update state to remove the collaborator from the UI
      setSelectedCollaborator(null);
      setCollaboratorArticles([]);

      // Remove the collaborator from the list immediately
      queryClient.setQueryData(["collaborators", userId], (oldData) =>
        oldData ? oldData.filter((collab) => collab.id !== collaboratorId) : []
      );

      // Refetch to ensure data is consistent with the backend
      queryClient.invalidateQueries(["collaborators", userId]);

      alert("Collaborator and collaborated articles removed successfully!");
    },
    onError: (error) => console.error("Error removing collaborator:", error),
  });

  if (loadingCollaborators) return <div>Loading collaborators...</div>;
  if (collaboratorError)
    return <div>Error loading collaborators: {collaboratorError.message}</div>;
  if (loadingTopics) return <div>Loading topics...</div>;
  if (topicsError)
    return <div>Error loading topics: {topicsError.message}</div>;

console.log(collaboratorArticles);

  return (
    <div className="article-collabs">
      <div className="collabs-left">
        <h3>Collaborators</h3>
        <ul className="collaborator-list">
          {collaborators && collaborators.length > 0 ? (
            collaborators.map((collaborator) => (
              <li
                key={collaborator.id}
                onClick={() => handleCollaboratorClick(collaborator)}
                className={
                  selectedCollaborator?.id === collaborator.id ? "selected" : ""
                }
              >
                <img
                  src={
                    collaborator.profilePic
                      ? `/upload/${collaborator.profilePic}`
                      : "/upload/empty-profile-picture.jpg"
                  }
                  alt=""
                  className="collaborator-pic"
                />
                <span className="collaborator-name">{collaborator.name}</span>
                <div className="removeicon">
                  <RemoveIcon
                    onClick={(e) => removecollaborator(e, collaborator.id)}
                  />
                </div>
              </li>
            ))
          ) : (
            <p>No collaborators found</p>
          )}
        </ul>
      </div>

      <div className="collabs-right">
        <h3>Collaborated Articles</h3>
        {selectedCollaborator && collaboratorArticles.length > 0 ? (
          <div className="article-list">
            {collaboratorArticles.map((article) => (
              <div key={article.id} 
                    className="article-card" onClick={() => handleCardClick(article.id)} 
                    style={{ cursor: "pointer" }} >
                <div className="author-info">
                  <img
                    src={
                      article.author_profile ? `/upload/${article.author_profile}`: "/upload/empty-profile-picture.jpg"
                    }
                    alt="Author"
                    className="author-profile-pic"
                  />
                  <Link
                    to={`/expert/profile/${article.author_id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <span className="author-name" style={{ color: "black" }}>
                      <u>{article.author_name} </u>
                    </span>
                  </Link>
                </div>
                <div 
                    className="card-content" 
                >
                    <h2 className="card-title">{article.title}</h2>
                    <p className="card-topics">
                        <strong>Topics:</strong>{" "}
                        {Array.isArray(article.topics) ? article.topics.join(", ") : article.topics}
                    </p>
                    <p className="card-excerpt">{article.content.substring(0, 100)}...</p>
                </div>

                <div className="moreOptions">
                  <MoreHorizIcon onClick={(e) => toggleMenu(e, article.id)} />
                  {menuOpen === article.id && (
                    <div
                      className="dropdownMenu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span onClick={() => handleEditClick(article)}>Edit</span>
                      {userId === article.author_id && (
                        <span
                          onClick={() =>
                            handleRemoveCollabs(
                              article.id,
                              selectedCollaborator.id
                            )
                          }
                        >
                          Remove Collabs
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Select a collaborator to view collaborated articles</p>
        )}
      </div>

      {isEditModalOpen && currentArticle && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Article</h2>
            <form onSubmit={handleEditSubmit} className="article-form">
              <div className="form-group">
                <label>Article Title</label>
                <input
                  type="text"
                  name="title"
                  maxLength={50}
                  defaultValue={currentArticle.title}
                  required
                />
                <div className="char-count">
                  {currentArticle.title.length}/50
                </div>
              </div>
              <div className="form-group">
                <label>Article Content</label>
                <textarea
                  name="content"
                  defaultValue={currentArticle.content}
                  minLength={200} // Set minimum length to 200 characters
                  maxLength={10000} // Set maximum length to 10000 characters
                  required
                />
                <div className="char-count">
                  {currentArticle.content.length}/10000 (min: 200)
                </div>
              </div>

              <div className="form-group">
                <label>Select Article Topics</label>
                <div className="checkbox-group">
                  {topics.map((topic, index) => (
                    <div key={index} className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={`checkbox-${topic.topic_name}`}
                        name={topic.topic_name}
                        checked={selectedTopics.includes(topic.topic_name)}
                        onChange={handleCheckboxChange}
                        disabled={
                          !selectedTopics.includes(topic.topic_name) &&
                          selectedTopics.length >= 5
                        }
                      />
                      <label htmlFor={`checkbox-${topic.topic_name}`}>
                        {topic.topic_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="img-group">
                <label>Upload Images (max 5)</label>
                <input
                  type="file"
                  name="imgs"
                  accept=".jpg, .jpeg, .pdf"
                  multiple
                  onChange={handleFileChange}
                />
                {errorMsg && <p className="error-msg">{errorMsg}</p>}
                <div className="image-preview-container">
                  {files.map((file, index) => (
                    <div key={index} className="image-preview">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Selected ${index + 1}`}
                        className="file-preview"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="updatebuttons">
                <button type="submit" className="updatebutton">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="updatecancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articlecollabs;
