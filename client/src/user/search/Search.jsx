import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./search.scss";
import {
     CircularProgress,
     Typography,
     Button,
     Card,
     CardContent,
} from "@mui/material";

import {Label as LabelIcon} from "@mui/icons-material";

import { debounce } from "lodash"; // Import debounce from lodash
import Post from "../components/post/Post"; // Import the Post component
import Shoplisting from "./components/Shoplisting";
import User from "./components/User";
// import Event from "./components/Event"

const Search = ({ onClose }) => {
     const [searchTerm, setSearchTerm] = useState("");
     const [results, setResults] = useState({ users: [], shoplistings: [], posts: [], events: [] });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [refetchShops, setRefetchShops] = useState(false);
     const [favoriteShops, setFavoriteShops] = useState(new Set());

     const queryClient = useQueryClient();

     const searchMutation = useMutation({
          mutationFn: (term) =>
               makeRequest.get("/search?target=" + term).then((res) => res.data),
          onSuccess: (data) => {
               setResults(data);
          },
          onError: (error) => {
               setError("Failed to fetch results. Please try again later.");
          },
     });

     // Fetch favorite shops
     useEffect(() => {
          makeRequest.get("/shoplistings/FavoriteShops").then((res) => {
               setFavoriteShops(new Set(res.data));
          });
     }, [refetchShops]);

     const toggleFavorite = (shopId) => {
          const isFavorite = favoriteShops.has(shopId);
          const mutation = isFavorite ? removeFavorite : addFavorite;
          mutation.mutate(shopId);
     };

     const addFavorite = useMutation({
          mutationFn: (shopId) =>
               makeRequest.post("/shoplistings/addFavoriteShop", { shop_id: shopId }),
          onSuccess: () => {
               queryClient.invalidateQueries(["favoriteShops"]);
               setRefetchShops((prevRefetchShop) => !prevRefetchShop);
          },
     });

     const removeFavorite = useMutation({
          mutationFn: (shopId) =>
               makeRequest.delete("/shoplistings/removeFavoriteShop", { data: { shop_id: shopId } }),
          onSuccess: () => {
               queryClient.invalidateQueries(["favoriteShops"]);
               setRefetchShops((prevRefetchShop) => !prevRefetchShop);
          },
     });

     // Debounced search function with cancellation
     const debouncedSearch = useCallback(
          debounce((term) => {
               if (term) {
                    searchMutation.mutate(term);
               } else {
                    setResults({ users: [], shoplistings: [], posts: [] }); // Clear results on empty search
               }
          }, 500),
          [] // Empty dependencies array ensures this function is not recreated on every render
     );

     // Handle the input change
     const handleInputChange = (e) => {
          const term = e.target.value;
          setSearchTerm(term);

          if (term.trim() === "") {
               // If input is cleared, cancel the debounce and reset results
               debouncedSearch.cancel();
               setResults({ users: [], shoplistings: [], posts: [], events: [] });
               setError(null); // Clear any previous error
          } else {
               debouncedSearch(term); // Execute the debounced search
          }
     };

     // Handle search manually
     const handleSearch = (e) => {
          e.preventDefault();
          if (!searchTerm.trim()) {
               setResults({ users: [], shoplistings: [], posts: [], events: [] }); // Clear results when input is empty
               setError(null); // Reset error state
               return;
          }

          setLoading(true);
          setError(null);

          searchMutation.mutate(searchTerm, {
               onSettled: () => setLoading(false),
          });
     };

     useEffect(() => {
          document.body.style.overflow = "hidden";
          return () => {
               document.body.style.overflow = "auto";
               debouncedSearch.cancel(); // Ensure debounce is canceled when component unmounts
          };
     }, []);



     return (
          <div className="search-modal">
               <div className="modal">
                    <div className="search-header">
                         <Button className="close-modal" onClick={onClose}>
                              &times;
                         </Button>
                         <input
                              value={searchTerm}
                              onChange={handleInputChange}
                              placeholder="Search ..."
                              className="searchBar"
                         />
                         <Button className="searchBtn" onClick={handleSearch}>
                              Search
                         </Button>
                    </div>

                    {loading ? (
                         <div className="loading">
                              <CircularProgress />
                         </div>
                    ) : error ? (
                         <Typography color="error">{error}</Typography>
                    ) : (
                         <div className="results-wrapper">
                              {results.users.length > 0 && (
                                   <div className="results-section">
                                        <Typography variant="h5">Users</Typography>
                                        {results.users.map((user) => (
                                             <User user={user} onClose={onClose} className="result-card" />
                                        ))}
                                   </div>
                              )}

                              {results.posts.length > 0 && (
                                   <div className="results-section">
                                        <Typography variant="h5">Posts</Typography>
                                        <div className="posts-container">
                                             {results.posts.map((post) => (
                                                  <Post key={post.id} post={post} 
                                                  className="result-card"/>
                                             ))}
                                        </div>
                                   </div>
                              )}

                              {results.shoplistings.length > 0 && (
                                   <div className="results-section">
                                        <Typography variant="h5">Shoplistings</Typography>
                                        {results.shoplistings.map((shoplisting) => (
                                             <Shoplisting
                                                  shoplisting={shoplisting}
                                                  key={shoplisting.shop_id}
                                                  isFavorite={favoriteShops.has(shoplisting.shop_id)}
                                                  toggleFavorite={toggleFavorite}
                                                  onClose={onClose}
                                                  className="result-card" />
                                        ))}
                                   </div>
                              )}

                              {results.events.length > 0 && (
                                   <div className="results-section">
                                        <Typography variant="h5">Events</Typography>
                                        {results.events.map((event) => (
                                             <Card
                                                  key={event.id}
                                                  className="result-card"
                                             >
                                                  <CardContent className="card-content">
                                                       <div className="details">
                                                            <Typography variant="h6">{event.title}</Typography>
                                                            <div className="event-type">
                                                                 <LabelIcon />
                                                                 <span>{event.type_name}</span>
                                                            </div>
                                                       </div>
                                                  </CardContent>
                                             </Card>
                                        ))}
                                   </div>
                              )}

                              {results.posts.length === 0 && results.users.length === 0 && results.shoplistings.length === 0 && results.events.length === 0 && (
                                   <Typography variant="h6" className="no-results">
                                        No results found for "{searchTerm}".
                                   </Typography>
                              )}
                         </div>
                    )}
               </div>
          </div>
     );
};

export default Search;
