import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./articleCard.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";

const ArticleCard = ({ article }) => {
  const { id, title, topics, author_name, author_profile, authorId } = article;
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevents handleDetails from being triggered
    setMenuOpen((prev) => !prev);
  };
  

  // Fetch the like status for the article
  const { data: likesData = [] } = useQuery({
    queryKey: ["articleLikes", article.id],
    queryFn: async () => {
      const res = await makeRequest.get(`/likes/getArtLike?articleId=${article.id}`);
      return res.data;
    },
  });

  // Mutation to like/unlike the article
  const likeMutation = useMutation({
    mutationFn: (liked) => {
      return liked
        ? makeRequest.delete(`/likes/deleteArtLike?articleId=${article.id}`)
        : makeRequest.post(`/likes/addArtLike`, { articleId: article.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["articleLikes", article.id]);
    },
  });

  const handleLike = (e) => {
    e.stopPropagation();
    const liked = likesData.includes(currentUser.id);
    likeMutation.mutate(liked);
  };

  const getImageSrc = (imageUrl) => {
    if(!imageUrl || imageUrl === '') return '/upload/empty-profile-picture.jpg';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    } else {
      return `${imageUrl}`;
    }
  };

  // Mutation to save/unsave the article
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return makeRequest.delete(`/favorites/delfavArticle?articleId=${id}`);
      } else {
        return makeRequest.post(`/favorites/addfavArticle`, { articleId: id });
      }
    },
    onSuccess: () => {
      setIsSaved((prev) => !prev);
      queryClient.invalidateQueries(["articleSavedState", id]);
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  const handleSave = (e) => {
    e.stopPropagation();
    saveMutation.mutate();
    setMenuOpen(false);
  };

  // Function to delete the article
  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/articles/delete/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["articles"]);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setMenuOpen(false);
  };

  const handleDetails = () => {
    navigate(`/user/articledetails/${id}`);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const res = await makeRequest.get(`/favorites/article/favStatus/${article.id}`);
        setIsSaved(res.data.saved); // Now this should work correctly
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };

    fetchSavedStatus();
  }, [article.id]);

  
  return (
    <div className="article-item" onClick={handleDetails}>
      <div className="articleauthorinfo">
        <img src={getImageSrc(author_profile)} alt={""} className="articleauthorpic" />
        <Link
                to={`/user/profile/${authorId}`}
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="articleauthorname">
                  <u>{author_name}</u>
                </span>
          </Link>

        <div className="more-icon-container" ref={dropdownRef}>
          <MoreHorizIcon onClick={toggleMenu} className="more-icon" />
          {menuOpen && (
            <div className="dropdown-menu">
              {currentUser.id === authorId ? (
                <>
                  <span onClick={handleDelete}>
                    Delete <DeleteIcon />
                  </span>
                  <span>
                    Share <ShareOutlinedIcon />
                  </span>
                </>
              ) : (
                <>
                  <span onClick={handleSave}>
                    {isSaved ? "Unsave" : "Save"}{" "}
                    {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </span>
                  <span>
                    Share <ShareOutlinedIcon />
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="articlecontent">
        <h2 className="article-title">{title}</h2>
        <p className="article-topics">
          <strong>Topics:</strong> {topics || "No topics available"}
        </p>
        <p className="card-excerpt">
          {article.content.substring(0, 100)}...
        </p>

        <div className="buttons">
          <div className="like-container" onClick={handleLike}>
            {likesData.includes(currentUser.id) ? (
              <LocalCafeIcon className="icon-hover" />
            ) : (
              <LocalCafeOutlinedIcon className="icon-hover" />
            )}
            <span>{likesData.length || 0} Likes</span>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticleCard;