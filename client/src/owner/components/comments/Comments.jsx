import { useContext, useState, useEffect } from "react";
import "./comments.scss";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import moment from "moment";
import { Link } from "react-router-dom";

const Comments = ({ postId, setNumOfComments }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get(`/comments?postId=${postId}`).then((res) => res.data),
    onSuccess: (data) => {
      setNumOfComments(data.totalComments); // Ensure comment count is set
    },
  });

  const mutation = useMutation({
    mutationFn: (newComment) => makeRequest.post("/comments", newComment),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]); // Refetch comments
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (desc.trim()) {
      mutation.mutate({ desc, postId });
      setDesc("");
    }
  };

  const getImageSrc = (imageUrl) => {
    if(!imageUrl || imageUrl === '') return '/upload/empty-profile-picture.jpg';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    } else {
      return `/upload/${imageUrl}`;
    }
  };

  useEffect(() => {
    if (data) {
      setNumOfComments(data.totalComments); // Keep comment count updated
    }
  }, [data, setNumOfComments]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching comments.</p>;

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.profilePic ? getImageSrc(currentUser.profilePic) : '/upload/empty-profile-picture.jpg'} />
        <input
          type="text"
          placeholder="Write a comment"
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
        />
        <button onClick={handleClick}>Send</button>
      </div>
      {data.comments.map((comment) => (
        <div className="comment" key={comment.id}>
          <img src={comment.profilePic ? getImageSrc(comment.profilePic) : '/upload/empty-profile-picture.jpg'} />
          <div className="info">
          <Link
                to={`/user/profile/${comment.userid}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">
                  <u>{comment.name}</u>
                </span>
              </Link>
            <p>{comment.desc}</p>
          </div>
          <span className="date">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Comments;
