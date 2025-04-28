import React from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import Articlecard from "../articleCard/Articlecard";
import "./articles.scss";

const Articles = ({ selectedTopics }) => {
  // Fetch articles using React Query
  const { isLoading, error, data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () =>
      makeRequest.get(`/articles`).then((res) => {
        console.log("API Response:", res.data); // Debugging the API response
        return res.data || []; // Ensure fallback to an empty array if no data
      }),
    onError: (error) => {
      console.error("Error fetching articles:", error);
    },
  });

  // Filter articles based on selected topics
  const filteredArticles = articles.filter((article) => {
    // Split the `topics` string into an array
    const articleTopics = article.topics
      ? article.topics.split(",").map((topic) => topic.trim().toLowerCase())
      : [];

    // If no topics are selected, show all articles
    if (selectedTopics && !selectedTopics.length) return true;

    // Ensure the article topics include all selected topics
    return selectedTopics?.every((selectedTopic) =>
      articleTopics.includes(selectedTopic.toLowerCase())
    );
  });

  // Handle loading state
  if (isLoading) return <div>Loading...</div>;

  // Handle error state
  if (error) return <div>Error fetching articles: {error.message}</div>;

  console.log(filteredArticles);

  return (
    <div className="articles">
      <div className="articles-container">
        {/* Check if filteredArticles is a valid array */}
        {Array.isArray(filteredArticles) && filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <Articlecard key={article.id} article={article} />
          ))
        ) : (
          // Handle case where no articles are available
          <div>No articles match the selected topics.</div>
        )}
      </div>
    </div>
  );
};

export default Articles;
