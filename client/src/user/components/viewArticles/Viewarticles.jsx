import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import Articlecard from "../articleCard/Articlecard"; // Import the Articlecard component
import './viewArticles.scss';

const Viewarticles = () => {
  const { isLoading, error, data: articles } = useQuery({
    queryKey: ["articles"],
    queryFn: () => makeRequest.get(`/articles`).then((res) => res.data),
    onError: (error) => {
      console.error("Error fetching articles:", error);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching articles: {error.message}</div>;

  return (
    <div className="viewarticles">
      <div className="articles-container">
        {articles.map((article) => (
          <Articlecard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default Viewarticles;
