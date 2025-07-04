import React from 'react';
import './Carousel.css';

const AdCarousel = () => {
    const images = [
        'https://github.com/dataground-inc/passtival25/blob/main/carousel1.png?raw=true',
        'https://github.com/dataground-inc/passtival25/blob/main/carousel2.png?raw=true',
        'https://github.com/dataground-inc/passtival25/blob/main/carousel3.png?raw=true',
    ];

    return (
        <div className="carousel-wrapper">
            {images.map((src, idx) => (
                <div className="carousel-item" key={idx}>
                    <img src={src} alt={`banner-${idx}`} />
                </div>
            ))}
        </div>
    );
};

export default AdCarousel;
