import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import { AuthContext } from "../../../context/authContext";
import "./expertEditPost.scss";

const EditPost = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState({ desc: "", img: "" }); // Initialize post state

  const { isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => makeRequest.get(`/posts/${id}`).then((res) => {
      setPost(res.data); // Set post data
      return res.data;
    }),
    onError: (error) => {
      console.error("Error fetching post:", error);
    },
  });

  const handleUpdate = async () => {
    try {
      await makeRequest.put(`/posts/${id}`, post); // Update post API call
      navigate("/posts"); // Redirect after update
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Handle changes to the post description
  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading post: {error.message}</div>;

  return (
    <div className="edit-post">
      <h1>Edit Post</h1>
      <textarea
        name="desc"
        value={post.desc}
        onChange={handleChange}
        placeholder="Edit post description..."
      />
      {post.img && <img src={`/upload/${post.img}`} alt="Post" />}
      <button onClick={handleUpdate}>Update Post</button>
    </div>
  );
};

export default EditPost;
