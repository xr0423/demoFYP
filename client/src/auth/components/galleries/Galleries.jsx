import React from 'react';
import Slider from 'react-slick';
import './galleries.scss';

const Galleries = () => {

  return (
    <div className="gallery-container">
      <h1>Gallery</h1>
      <div className="gallery-row">
        {slideshows.map((slideshow, index) => (
          <div key={index} className="gallery-column">
            <div className="slideshow">
              <Slider {...settings}>
                {slideshow.images.map((image, idx) => (
                  <div key={idx}>
                    <img src={image} alt={`Slideshow ${index + 1} - Slide ${idx + 1}`} />
                  </div>
                ))}
              </Slider>
            </div>
            <div className="slideshow-description">
              <p>{slideshow.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Galleries;
