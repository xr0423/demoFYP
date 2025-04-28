import React, { useState, useContext, useEffect } from "react";
import {
    Tabs,
    Tab,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Button,
} from "@mui/material";
import Carousel from 'react-material-ui-carousel';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import { makeRequest } from "../../../axios";
import { AuthContext } from "../../../context/authContext"; // For user context
import "./favorites.scss"; // Styling for the component

const Favorites = () => {
    const { currentUser } = useContext(AuthContext);
    const [currentTab, setCurrentTab] = useState(0); // Track which tab is active
    const [favorites, setFavorites] = useState([]); // Store fetched favorites
    const [loading, setLoading] = useState(true); // Track loading state
    const [expandedPosts, setExpandedPosts] = useState({}); // Object to track expanded state for each post

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
            console.log("Fetched favorites:", data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
        setLoading(false);
    };

    // Use effect to fetch favorites on tab change
    useEffect(() => {
        fetchFavoritesOnTabChange();
    }, [currentTab]);

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
            <Grid container spacing={3}>
                {favorites.map((post) => (
                    <Grid item xs={12} md={4} key={post.id}>
                        <div className="post-favorite">
                            <div className="author-info">
                                <img
                                    src={post.authorProfilePic ? `/upload/${post.authorProfilePic}` : "/upload/empty-profile-picture.jpg"}
                                    alt={post.authorName || "Author"}
                                    className="author-pic"
                                />
                                <Typography variant="body2">{post.authorName}</Typography>
                            </div>
                            <Typography variant="h6">{post.title}</Typography>
    
                            {/* Carousel for multiple images */}
                            {post.images && post.images.length > 0 && (
                                <Carousel
                                    autoPlay={false}
                                    navButtonsAlwaysVisible
                                    indicators={false}
                                    animation="slide"
                                >
                                    {post.images.map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={`/upload/${imageUrl}`}
                                            alt={`Post Image ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "280px",
                                                maxHeight: "500px",
                                                objectFit: "contain",
                                                borderRadius: "10px",
                                                marginBottom: "10px"
                                            }}
                                        />
                                    ))}
                                </Carousel>
                            )}
    
                            {/* Truncated/expanded description */}
                            <Typography variant="body2" className={expandedPosts[post.id] ? "show-full-text" : "truncate"}>
                                {post.desc}
                            </Typography>
                            {post.desc && post.desc.length > 20 && (
                                <span className="read-more" onClick={() => handleToggleText(post.id)}>
                                    {expandedPosts[post.id] ? "Show Less" : "Read More"}
                                </span>
                            )}
    
                            <BookmarkIcon
                                sx={{
                                    color: "#8B4513", // Brown color
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    cursor: "pointer"
                                }}
                                onClick={() => handleRemoveFavorite(post.id, "post")}
                            />
                        </div>
                    </Grid>
                ))}
            </Grid>
        ) : renderEmptyState("posts")
    );

    // Render favorite shops
    const renderFavoriteShops = () => (
        favorites && favorites.length > 0 ? (
            <Grid container spacing={3}>
                {favorites.map((shop) => (
                    <Grid item xs={12} md={4} key={shop.shop_id}>
                        <div className="shop-favorite">
                            <img
                                src={
                                    shop.photo_gallery?.split(",")[0] || "/upload/default.png"
                                }
                                alt={shop.name}
                                className="shop-image"
                            />
                            <Typography variant="h6">{shop.name}</Typography>
                            <Typography variant="body2">{shop.location}</Typography>
                            <BookmarkIcon className="bookmark-icon" onClick={() => handleRemoveFavorite(shop.shop_id, "shop")} />
                        </div>
                    </Grid>
                ))}
            </Grid>
        ) : renderEmptyState("shops")
    );

    // Render favorite articles
    const renderFavoriteArticles = () => (
        favorites && favorites.length > 0 ? (
            <Grid container spacing={3}>
                {favorites.map((article) => (
                    <Grid item xs={12} md={4} key={article.id}>
                        <div className="article-favorite">
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
                                <Typography variant="body2">{article.authorName}</Typography>
                            </div>
                            <Typography variant="h5" className="article-title">{article.title}</Typography>
                            <Typography variant="body2" className="article-description">
                            {article.content ? 
                                article.content.split(" ").slice(0, 100).join(" ") + (article.content.split(" ").length > 100 ? "..." : "") 
                                : "No description available."
                            }
                            </Typography>
                            <BookmarkIcon className="bookmark-icon" onClick={() => handleRemoveFavorite(article.id, "article")} />
                        </div>
                    </Grid>
                ))}
            </Grid>
        ) : renderEmptyState("articles")
    );

    return (
        <Box className="expertfavorites">
            
            <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                className="expertfavtabs"
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