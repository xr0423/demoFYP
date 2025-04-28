import "./post.scss";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import Carousel from "react-material-ui-carousel";

import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useContext, useEffect } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import { AuthContext } from "../../../context/authContext";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [numOfComments, setNumOfComments] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const [carouselKey, setCarouselKey] = useState(0);

  const getImageSrc = (imageUrl) => {
    if(!imageUrl || imageUrl === '') return '/upload/empty-profile-picture.jpg';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    } else {
      return `/upload/${imageUrl}`;
    }
  };

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // useEffect to update carousel key on each mount, forcing re-render
  useEffect(() => {
    setCarouselKey((prevKey) => prevKey + 1); 
  }, [post.img]);

  // for read more
  const handleToggleText = () => {
    setShowFullText((prevState) => !prevState);
  };

  // Fetch likes data
  const { isLoading, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get(`/likes?postId=${post.id}`).then((res) => res.data),
  });

  // Fetch post saved status and sync the state
  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const res = await makeRequest.get(`/favorites/post/favStatus/${post.id}`);
        setIsSaved(res.data.saved);
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };
    fetchSavedStatus();
    setNumOfComments(post.totalComments);
  }, [post.id]);

  const likeMutation = useMutation({
    mutationFn: (liked) => {
      return liked
        ? makeRequest.delete(`/likes?postId=${post.id}`)
        : makeRequest.post("/likes", { postId: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["likes", post.id]);
    },
  });

  const handleLike = () => {
    const liked = data?.includes(currentUser.id);
    likeMutation.mutate(liked);
  };

  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/posts/${post.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      return isSaved
        ? makeRequest.delete(`/favorites/delfavPost?postId=${post.id}`)
        : makeRequest.post("/favorites/addfavPost", { postId: post.id });
    },
    onSuccess: () => {
      setIsSaved((prev) => !prev);
      queryClient.invalidateQueries(["favorites"]);
    },
    onError: (error) => {
      console.error("Error saving/un-saving the post:", error);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
    setMenuOpen(false);
  };

  if (!post) {
    return <div className="post-error">Post data is missing.</div>;
  }

  const images = post.img ? post.img.split(",") : [];

  return (
    <div className="user-post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={getImageSrc(post.profilePic)} alt="" />
            <div className="details">
              <Link
                to={`/user/profile/${post.userid}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">
                  <u>{post.name}</u>
                </span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
              <span className="shop">{post.shop_name}</span>
            </div>
          </div>

          <div className="moreOptions">
            <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
            {menuOpen && (
              <div className="dropdownMenu">
                <span onClick={handleSave} className="dropdown-item">
                  {isSaved ? (
                    <>
                      <BookmarkIcon className="icon" />
                      Unsave
                    </>
                  ) : (
                    <>
                      <BookmarkBorderIcon className="icon" />
                      Save
                    </>
                  )}
                </span>
                {currentUser.id === post.userid && (
                  <span onClick={handleDelete} className="dropdown-item">
                    <DeleteIcon className="icon" />
                    Delete
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="content">
          <p className={showFullText ? "show-full-text" : "truncate"}>
            {post.desc}
          </p>
          {post.desc.length > 100 && (
            <span className="read-more" onClick={handleToggleText}>
              {showFullText ? "Show Less" : "Read More"}
            </span>
          )}

          {/* Carousel for images */}
          {images.length > 0 && (
            <Carousel
              key={carouselKey} // Force re-render by using the carouselKey
              autoPlay={false}
              navButtonsAlwaysVisible
              indicators={false}
              animation="slide"
            >
              {images.map((img, index) => (
                <img
                  key={index}
                  src={`/upload/${img}`}
                  alt={`Post Image ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                />
              ))}
            </Carousel>
          )}
        </div>

        <div className="info">
          <div className="item">
            {isLoading ? (
              "Loading"
            ) : data?.includes(currentUser.id) ? (
              <LocalCafeIcon
                style={{ color: "brown" }}
                onClick={handleLike}
                className="icon-hover"
              />
            ) : (
              <LocalCafeOutlinedIcon
                style={{ color: "brown" }}
                onClick={handleLike}
                className="icon-hover"
              />
            )}
            <span>{data?.length || 0} Likes</span>
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            <span>{numOfComments} Comments</span>
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>

        {commentOpen && (
          <Comments postId={post.id} setNumOfComments={setNumOfComments} />
        )}
      </div>
    </div>
  );
};

export default Post;
