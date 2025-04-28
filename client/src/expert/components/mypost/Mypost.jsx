import Post from "../post/Post";
import "./mypost.scss";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../../axios";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";

const Mypost = () => {
  const { currentUser } = useContext(AuthContext);  // Get the current user from context

  // Fetch posts using react-query, similar to how you fetch posts in `Posts` component
  const { isLoading, error, data } = useQuery({
    queryKey: ['myPosts', currentUser.id],  // Include userId in the queryKey for uniqueness
    queryFn: () => makeRequest.get(`/posts?userId=${currentUser.id}`).then((res) => res.data),
  });

  return (
    <div className="expert-mypost">
        <h1>My Posts</h1>
        <br/>
      <div className="container">
        {error 
            ? <p>Something went wrong</p> 
            : isLoading 
            ? <p>Loading...</p> 
            : data && Array.isArray(data) && data.length > 0 
            ? data.map((post) => <Post post={post} key={post.id} />) 
            : <p>You haven't share anything...</p>
        }
      </div>
    </div>
  );
};

export default Mypost;
