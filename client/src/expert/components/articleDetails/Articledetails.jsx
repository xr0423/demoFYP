import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { makeRequest } from "../../../axios";
import "./articleDetails.scss";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Articlecomments from "../articleComments/Articlecomments";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";

const Articledetails = () => {
  const { articleId } = useParams();
  const [numOfComments, setNumOfComments] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // New state for image slider
  const {currentUser} = useContext(AuthContext);

  const { isLoading, error, data: article } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () =>
      makeRequest.get(`/articles/details/${articleId}`).then((res) => res.data),
    onError: (error) => {
      console.error("Error fetching article details:", error);
    },
  });

  const getImageSrc = (imgPath) => {
    return imgPath || "https://dummyimage.com/650x450/cccccc/ffffff&text=No+Image+Available";
  };

  const backToListings = () => {
    window.history.back();
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === article.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? article.images.length - 1 : prevIndex - 1
    );
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error fetching article: {error.message}</div>;

  // Split the content for the two-column layout
  const splitContent = (content) => {
    const words = content.split(" ");
    const middleIndex = Math.floor(words.length / 2);
    return [
      words.slice(0, middleIndex).join(" "),
      words.slice(middleIndex).join(" "),
    ];
  };

  const [part1, part2] = splitContent(article?.content);

  console.log(article);

  return (
    <div className="article">
      <div className="articlesection">
        <button className="go-back-button" onClick={backToListings}>
          <ArrowBackIcon /> Go Back
        </button>
        <div className="container">
          <h1>{article?.title}</h1>
          <div className="author-details">
            <img
              src={article?.author_profile ? `/upload/${article.author_profile}` :  "/upload/empty-profile-picture.jpg"}
              alt={article?.author_name || "Unknown Author"}
            />
            <p>
              <Link
                to={
                  currentUser.type === "expert"
                    ? `/expert/profile/${article.author_id}`
                    : `/user/profile/${article.author_id}`
                }
                style={{ textDecoration: "none", color: "inherit" }}
              >
                 <u>{article.author_name || "Anonymous"} </u>
              </Link>
            </p>
          </div>
          
          <div className="moreinfo">
            <p className="published-date">
              Published on: {new Date(article.created_at).toLocaleDateString()}
            </p>
            <p className="likenumber">
              {article.likes + "  Likes" || 0}
            </p>
          </div>

          {/* Render image slider */}
          {article.images && article.images.length > 0 && (
            <div className="image-slider">
              <button onClick={handlePreviousImage} className="slider-button">{"<"}</button>
              <img
                src={getImageSrc(article.images[currentImageIndex])}
                alt={`Article Image ${currentImageIndex + 1}`}
                className="article-image"
              />
              <button onClick={handleNextImage} className="slider-button">{">"}</button>
            </div>
          )}

          <div className="article-content">
            <div className="contentdiv">
              <p>{part1}</p>
            </div>
            <div className="contentdiv">
              <p>{part2}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="commentsection">
        <h4>Comments ({numOfComments})</h4>
        <Articlecomments articleId={articleId} setNumOfComments={setNumOfComments} />
      </div>
    </div>
  );
};

export default Articledetails;
