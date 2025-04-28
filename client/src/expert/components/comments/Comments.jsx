import { useContext, useState, useEffect } from "react";
import "./comments.scss";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import moment from "moment";

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
        <img src={currentUser.profilePic} alt="" />
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
          <img src={comment.profilePic} alt="" />
          <div className="info">
            <span>{comment.name}</span>
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
