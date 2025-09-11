import React, { useState, useEffect } from 'react';
import './DeliveryProofModal.css';

const DeliveryProofModal = ({ foodItem, onConfirm, onClose }) => {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    // This is a simplified example. In a real app, you would ask for
    // permission and handle errors from the geolocation API.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setTimestamp(new Date().toLocaleString());
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to a mock location if permission is denied or an error occurs
          setLocation({ latitude: 'N/A', longitude: 'N/A' });
          setTimestamp(new Date().toLocaleString());
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setLocation({ latitude: 'N/A', longitude: 'N/A' });
      setTimestamp(new Date().toLocaleString());
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (photo && location) {
      const proofData = {
        foodItemId: foodItem.id,
        photo,
        location,
        timestamp,
      };
      onConfirm(proofData);
    } else {
      alert('Please upload a photo before submitting.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Proof of Delivery for: {foodItem.foodName}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="proof-details">
            <p><strong>Item:</strong> {foodItem.foodName}</p>
            {timestamp && <p><strong>Time:</strong> {timestamp}</p>}
            {location && <p><strong>Location:</strong> {location.latitude}, {location.longitude}</p>}
          </div>

          <div className="photo-upload-container">
            {!photoPreview && (
              <label htmlFor="photo-upload" className="upload-label">
                Take or Upload Photo
              </label>
            )}
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              capture="environment" // This suggests using the back camera on mobile
              onChange={handleFileChange}
              className="hidden-file-input"
            />
            {photoPreview && (
              <div className="photo-preview-container">
                <img src={photoPreview} alt="Proof of Delivery" className="photo-preview" />
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="submit-proof-btn" onClick={handleSubmit}>
            Submit Proof of Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProofModal;