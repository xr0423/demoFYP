import "./myArticles.scss";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import { useNavigate } from "react-router-dom";

const Myarticles = ({ userId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    isLoading,
    error,
    data: articles,
  } = useQuery({
    queryKey: ["articles", userId],
    queryFn: () =>
      userId
        ? makeRequest.get(`/articles?userId=${userId}`).then((res) => res.data)
        : [],
    enabled: !!userId,
    onError: (error) => console.error("Error fetching articles:", error),
  });

  // Fetch topics from the database
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

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => makeRequest.get(`/friendRequest/getExpertFriendlist`).then((res) => res.data),
    enabled: isInviteModalOpen,
    onError: (error) => console.error("Error fetching users:", error),
  });

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

  const addCollabMutation = useMutation({
    mutationFn: (collabData) =>
      makeRequest.post(`/articles/addCollab`, collabData),
    onSuccess: () => {
      setIsInviteModalOpen(false);
      setSelectedUserId(null);
      alert("Invite successfully sent!");
    },
    onError: (error) => {
      console.error("Error inviting collaborator:", error);
      alert("Failed to send invite.");
    },
  });

  const submitInvites = () => {
    if (!selectedUserId) {
      alert("Please select a user to invite.");
      return;
    }

    const collabData = {
      article_id: currentArticle?.id,
      collaborator_id: selectedUserId,
    };
    addCollabMutation.mutate(collabData);
  };

  const handleInvites = (article) => {
    setCurrentArticle(article);
    setIsInviteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
  };

  const editMutation = useMutation({
    mutationFn: (updatedArticle) =>
      makeRequest.put(`/articles/${updatedArticle.id}`, updatedArticle),
    onSuccess: () => {
      queryClient.invalidateQueries(["articles", userId]);
      setIsEditModalOpen(false);
      setSelectedTopics([]);
      setFiles([]);
    },
    onError: (error) => console.error("Error updating article:", error),
  });

  const deleteMutation = useMutation({
    mutationFn: (articleId) => makeRequest.delete(`/articles/${articleId}`),
    onSuccess: () => queryClient.invalidateQueries(["articles", userId]),
    onError: (error) => console.error("Error deleting article:", error),
  });

  const handleEditClick = (article) => {
    setCurrentArticle(article);
    const articleTopics = Array.isArray(article.topics)
      ? article.topics
      : article.topics?.split(",").map((topic) => topic.trim()) || [];
    setSelectedTopics(articleTopics);
    setIsEditModalOpen(true);
    setMenuOpen(null);
  };

  const handleDelete = (articleId) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      deleteMutation.mutate(articleId);
    }
    setMenuOpen(null);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setSelectedTopics((prevTopics) => {
      if (checked) {
        // If already at max limit, prevent adding more
        if (prevTopics.length >= 5) {
          alert("You can select a maximum of 5 topics.");
          return prevTopics;
        }
        return [...prevTopics, name];
      } else {
        // Remove unchecked topic
        return prevTopics.filter((topic) => topic !== name);
      }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const content = e.target.content.value;

    if (title.length > 50) {
      setErrorMsg("Title must be no more than 50 characters.");
      return;
    }
    if (content.length < 200) {
      setErrorMsg("Content must be at least 200 characters.");
      return;
    }

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

  const handleViewDetails = (articleId) => {
    let path;
  
    switch (currentUser.type) {
      case "expert":
        path = `/expert/articledetails/${articleId}`;
        break;
      case "regular":
        path = `/user/articledetails/${articleId}`;
        break;
      case "admin":
        path = `/admin/articledetails/${articleId}`;
        break;
      case "owner":
        path = `/owner/articledetails/${articleId}`;
        break;
      default:
        path = `/articledetails/${articleId}`; // Default fallback
    }
  
    navigate(path);
  };
  
  const toggleMenu = (e, articleId) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === articleId ? null : articleId);
  };

  const totalLikes = articles
    ? articles.reduce((sum, article) => sum + (article.likes || 0), 0)
    : 0;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching articles: {error.message}</div>;

  console.log(articles);
  
  return (
    <div className="expert-articles">
      <div className="top-section">
        <div className="total-likes">Total Likes: {totalLikes}</div>
        {userId === currentUser.id && (
          <button
            className="create-button"
            onClick={() => navigate("/expert/createarticle")}
          >
            <AddIcon style={{ fontSize: 30 }} />
            <span>Create</span>
          </button>
        )}
      </div>
      <div className="container">
        <div className="article-list">
          {articles && articles.length > 0 ? (
            articles.map((article) => (
              <div
                key={article.id}
                className="article-card"
                onClick={() => handleViewDetails(article.id)}
              >
                <div className="author-info">
                  <img
                    src={ article.author_profile? `/upload/${article.author_profile}` : "/upload/empty-profile-picture.jpg"}
                    alt="/upload/empty-profile-picture.jpg"
                    className="author-profile-pic"
                  />
                  <span className="author-name">{article.author_name}</span>
                </div>
                <div className="card-content">
                  <h2 className="card-title">{article.title}</h2>
                  <p className="card-topics">
                    <strong>Topics:</strong>{" "}
                    {Array.isArray(article.topics)
                      ? article.topics.join(", ")
                      : article.topics}
                  </p>
                  <p className="card-excerpt">
                    {article.content.substring(0, 70)}...
                  </p>
                </div>
                <div className="likenumber">
                  <p>{article.likes + "  Likes" || 0}</p>
                </div>

                <div className="moreOptions">
                {currentUser.type === "expert" && currentUser.id === userId && (
                  <MoreHorizIcon onClick={(e) => toggleMenu(e, article.id)} />
                )}
                  {menuOpen === article.id && (
                    <div
                      className="dropdownMenu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span onClick={() => handleEditClick(article)}>
                        Edit
                        </span>
                      <span onClick={() => handleDelete(article.id)}>
                        Delete
                      </span>
                      <span onClick={() => handleInvites(article)}>
                        Invites
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No articles found</p>
          )}
        </div>
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
                  defaultValue={currentArticle.title}
                  maxLength={50} // Set max length to 50 characters
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
                  {loadingTopics ? (
                    <p>Loading topics...</p>
                  ) : topicsError ? (
                    <p>Error loading topics: {topicsError.message}</p>
                  ) : (
                    topics.map((topic, index) => (
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
                    ))
                  )}
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

      {isInviteModalOpen && (
        <div className="invitemodal">
          <div className="invitemodalcontent">
            <h2>Invite collaborators</h2>
            <div className="searchresult">
            {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user.userId} className="resultcheckbox">
              <input
                type="checkbox"
                id={`user-${user.userId}`}
                checked={selectedUserId === user.userId}
                onChange={() => {
                  setSelectedUserId((prevId) =>
                    prevId === user.userId ? null : user.userId
                  );
                }}
              />
              <label
                htmlFor={`user-${user.userId}`}
                className={`userresult ${selectedUserId === user.userId ? "selected" : ""}`}
              >
                <img
                  src={user.profilePic? `/upload/${user.profilePic}` : "/upload/empty-profile-picture.jpg"}
                  alt="/upload/empty-profile-picture.jpg"
                  className="resultpic"
                />
                <span className="resultname">{user.name}</span>
              </label>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
            </div>

            <div className="invitebuttons">
              <button onClick={submitInvites} className="invitebutton">
                Invite
              </button>
              <button onClick={handleCloseModal} className="closemodal">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Myarticles;
