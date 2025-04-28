import React, {useState, useEffect} from 'react';
import './gallery.scss';
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from '../../axios';

const Gallery = () => {

  const [galleries, setGalleries] = useState([]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['features'],  // Query key
    queryFn: async () => {
      const response = await makeRequest.get('/review/features');  // API call to fetch features
      setGalleries(response.data); 
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching features:', error);  // Handle errors
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;  // Show loading state while fetching data
  }

  if (error) {
    return <p>Error fetching features: {error.message}</p>;  // Show error message if there's an error
  }

  const getImageSrc = (img) => {
    if(img.startsWith("http")){
      return img
    }else {
      return `/upload/${img}`;
    }
  }
    



  return (
    <div className="gallery" id="gallery">
      <h1>Gallery of Features</h1>
      <div className="gallery-grid">
        {galleries.length === 0 ? (
          <p>No features available.</p>  // Handle case where no features are available
        ) : (
          galleries.map((feature) => (
            <div key={feature.id} className="gallery-item">
              <div className="gallery-info">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <div className="gallery-image-wrapper">
                {feature.image && (
                  <img src={getImageSrc(feature.image)} alt={feature.title} className="gallery-image" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
