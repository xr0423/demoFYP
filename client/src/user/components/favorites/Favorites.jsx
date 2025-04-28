import React, { useState, useContext, useEffect } from "react";
import {
    Tabs,
    Tab,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Button,
    Chip,
    Rating,
} from "@mui/material";
import Carousel from 'react-material-ui-carousel';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../../axios";
import { AuthContext } from "../../../context/authContext"; // For user context
import "./favorites.scss"; // Styling for the component
import Post from "../post/Post";

const Favorites = () => {
    const { currentUser } = useContext(AuthContext);
    const [currentTab, setCurrentTab] = useState(0); // Track which tab is active
    const [favorites, setFavorites] = useState([]); // Store fetched favorites
    const [loading, setLoading] = useState(true); // Track loading state
    const [expandedPosts, setExpandedPosts] = useState({}); // Object to track expanded state for each post
    const navigate = useNavigate();
    
    const handleToggleText = (postId) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId] // Toggle the specific post's expanded state
        }));
    };
    
    // Fetch the updated favorites whenever the tab changes or after deletion
    const fetchFavoritesOnTabChange = () => {
        const routes = [
            "/favorites/getfavPost",
            "/favorites/getfavShop",
            "/favorites/getfavArticle",
        ];
        fetchFavorites(routes[currentTab]);
    };

    // Fetch favorites data from the server
    const fetchFavorites = async (route) => {
        setLoading(true);
        try {
            const { data } = await makeRequest.get(route);
            setFavorites(data || []);
            console.log(data)
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
        setLoading(false);
    };
    
    // Use effect to fetch favorites on tab change
    useEffect(() => {
        fetchFavoritesOnTabChange();
    }, [currentTab]);
    
    const handleNavigate = (shop_id) => {
        // Get the role of the current user
        const basePath = currentUser.type === "expert" ? "/expert" : "/user"; // Adjust based on role
        const path = `${basePath}/shoplisting/${shop_id}/overview`;
        navigate(path);
      };

    const handleDetails = (id) => {
        navigate(`/user/articledetails/${id}`);
    };
    // Handle removal of a favorite item (Optimistic UI Update)
    const handleRemoveFavorite = async (id, type) => {
        console.log(`Removing ${type} with ID:`, id);

        if (!id) {
            console.error(`Invalid ID for ${type}:`, id);
            return;
        }

        try {
            // Optimistically update UI before making the API request
            setFavorites((prevFavorites) =>
                prevFavorites.filter((item) => item.id !== id && item.shop_id !== id)
            );

            let route;
            if (type === "post") route = `/favorites/delfavPost?postId=${id}`;
            if (type === "shop") route = `/favorites/delfavShop?shopId=${id}`;
            if (type === "article") route = `/favorites/delfavArticle?articleId=${id}`;

            await makeRequest.delete(route);
            console.log(`${type} removed successfully`);
        } catch (error) {
            console.error("Failed to remove favorite:", error);
            // Re-fetch favorites in case of an error
            fetchFavoritesOnTabChange();
        }
    };
    

    // Render a message if no favorites exist
    const renderEmptyState = (type) => (
        <Typography variant="body2" className="empty-state">
            You haven't saved any {type} yet.
        </Typography>
    );

    // Render favorite posts
    const renderFavoritePosts = () => (
        favorites && favorites.length > 0 ? (
            <div className="favorites-container"> {/* Centering container */}
                {favorites.map((post) => (
                    <div key={post.id} className="post-favorite">
                        <Post className="user-fav-posts" post={post} /> {/* Adding class name */}
                    </div>
                ))}
            </div>
        ) : renderEmptyState("posts")
    );
    

    // Render favorite shops
    const renderFavoriteShops = () => (
        favorites.length > 0 ? (
            <Grid container spacing={3}>
                {favorites.map((shop) => (
                    <Grid item xs={12} md={3} key={shop.shop_id}>
                        <div className="shop-favorite"onClick={() => handleNavigate(shop.shop_id)}>
                            <img
                                src={
                                    shop.img ? `/upload/${shop.img}` : "/upload/default.png"
                                }
                                alt={shop.name}
                                className="shop-image"
                            />
                            <Typography variant="h6">{shop.name}</Typography>
                            <Typography variant="body2" className="shop-type">{shop.shopType || "N/A"}</Typography>
                            <Typography variant="body2">{shop.location}</Typography>
                            <Box mt={1} display="flex" alignItems="center" justifyContent="center" className="rating-container">
                                <Rating
                                    name="shop-rating"
                                    value={shop.rating || 0}
                                    precision={0.5}
                                    readOnly
                                />
                            </Box>
                            <BookmarkIcon className="bookmark-icon" onClick={(e) => {
                                e.stopPropagation(); // Prevent click event from propagating to the parent div
                                handleRemoveFavorite(shop.shop_id, "shop");
                                }} />
                        </div>
                    </Grid>
                ))}
            </Grid>
        ) : renderEmptyState("shops")
    );

// Render favorite articles
const renderFavoriteArticles = () => (
    favorites.length > 0 ? (
        <Grid container spacing={3} className="articles-grid">
            {favorites.map((article) => (
                <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <div className="article-favorite" onClick={() => handleDetails(article.id)}>
                        <div className="author-info">
                            <img
                                src={
                                    article.authorProfilePic
                                      ? `/upload/${article.authorProfilePic}`
                                      : "/upload/empty-profile-picture.jpg"
                                  }
                                alt={article.authorName}
                                className="author-pic"
                            />
                            <Typography className="author-name">{article.authorName}</Typography>
                        </div>
                        <Typography className="title">{article.title}</Typography>
                        <Typography className="content">
                            {article.content || "No description available."}
                        </Typography>
                        <BookmarkIcon
                            className="bookmark-icon"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents the onClick for `handleDetails`
                                handleRemoveFavorite(article.id, "article");
                            }}
                        />
                    </div>
                </Grid>
            ))}
        </Grid>
    ) : renderEmptyState("articles")
);


    return (
        <Box className="favorites">
            
            <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                className="user-fav-tabs"
            >
                <Tab label="Favorite Posts" />
                <Tab label="Favorite Shops" />
                <Tab label="Favorite Articles" />
            </Tabs>


            {loading ? (
                <CircularProgress className="loading" />
            ) : (
                <>
                    {currentTab === 0 && renderFavoritePosts()}
                    {currentTab === 1 && renderFavoriteShops()}
                    {currentTab === 2 && renderFavoriteArticles()}
                </>
            )}
        </Box>
    );
};

export default Favorites;
