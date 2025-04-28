import Post from "../../../../user/components/post/Post";
import '../../../../user/components/posts/posts.scss';

import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../../axios";


const ShopPosts = ({ shopId, ownerDetails, selectedCategories }) => {
  // Fetch all posts from the backend
  const { isLoading, error, data } = useQuery({
    queryKey: ["shopposts", shopId, ownerDetails?.id], // Include both shopId and ownerDetails.id in the query key
    queryFn: () =>
      makeRequest
        .get(`/posts/postsByShop?shopId=${shopId}&ownerId=${ownerDetails?.id}`)
        .then((res) => res.data), // Pass ownerDetails.id as a query parameter
  });

  // Filter posts based on selected categories
  const filteredPosts = data?.filter((post) => {
    const postCategories = post.categories
      ? post.categories.split(",").map((cat) => cat.trim())
      : []; // Ensure categories is always an array

    if (!selectedCategories || selectedCategories.length === 0) return true; // No filtering if no categories selected

    // Ensure all selected categories are present in the post categories
    return selectedCategories.every((category) => postCategories.includes(category));
  });


  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <div className="shop-posts">
      {filteredPosts && filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <Post className="shop-post" key={post.id} post={post} shopId={shopId} />
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
};

export default ShopPosts;



