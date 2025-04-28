import React from "react";
import Post from "../post/Post";
import "../posts/posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";

const PostCommunity = ({ selectedCategories }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts-with-images"],
    queryFn: () =>
      makeRequest.get("/posts/with-images").then((res) => res.data),
  });

  // Filter posts based on selected categories
  const filteredData = data?.filter((post) => {
    const postCategories = post.categories
      ? post.categories.split(",").map((cat) => cat.trim())
      : []; // Ensure categories is always an array

    if (!selectedCategories || selectedCategories.length === 0) return true; // No filtering if no categories selected

    // Ensure all selected categories are present in the post categories
    return selectedCategories.every((category) => postCategories.includes(category));
  });
  
  return (
    <div className="posts">
      {error
        ? `Something went wrong: ${error.message || "Unknown error"}`
        : isLoading
        ? "Loading..."
        : filteredData?.length > 0
        ? filteredData.map((post) => <Post post={post} key={post.id} />)
        : "No posts found"}
    </div>
  );
};

export default PostCommunity;
