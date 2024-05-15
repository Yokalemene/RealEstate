import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import 'react-image-gallery/styles/css/image-gallery.css';
import './ListingDetailsPage.css';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(response.data);
      } catch (error) {
        console.error('Ошибка загрузки объявления:', error);
      }
    };

    fetchListing();
  }, [id]);

  if (!listing) {
    return <p>Загрузка...</p>;
  }

  const images = listing.photos.map(photo => ({
    original: photo,
    thumbnail: photo,
  }));

  return (
    <div className="container">
      <h2 className="heading">{listing.propertyType}</h2>
      <div className="property-info">
        <FiMapPin className="icon" />
        <span className="label">Местоположение:</span>&nbsp;{listing.location}
      </div>
      <div className="property-info">
        <span className="label">Цена:</span>&nbsp;{listing.price} &#8381;
      </div>
      <p className="description">
        <span className="label">Описание:</span> {listing.description}
      </p>
      <div className="property-info">
        <FiPhone className="icon" />
        <span className="label">Контактная информация:</span>&nbsp;{listing.contactInfo}
      </div>
      <div className="gallery-container">
        <ImageGallery
          items={images}
          onClick={() => setFullscreenPhoto(true)}
          showFullscreenButton={false}
          showPlayButton={false}
          disableSwipe={true}
        />
      </div>
      {fullscreenPhoto && (
        <div className="fullscreen-photo" onClick={() => setFullscreenPhoto(false)}>
          <img src={images[0].original} alt="Fullscreen" />
        </div>
      )}
    </div>
  );
};

export default ListingDetailsPage;
