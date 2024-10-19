import React, { useEffect, useState } from 'react';
import Image from "next/image";

interface PopupImageProps {
  imageId: string;
  onClose: () => void;
}

const PopupImage: React.FC<PopupImageProps> = ({ imageId, onClose }) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/patient/image/detail/${imageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageId }), // Send the payload here
        });

        const data = await response.json();

        if (response.ok) {
          setImageData(data.data?.image); // Adjust based on your API response structure
        } else {
          setError(data.error || 'Error fetching image.');
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageId]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative">
        {imageData && (
          <Image src={imageData} 
          alt="Full Size" 
          width={600}
        height={600}
          className="object-cover" />
        )}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          aria-label="Close"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default PopupImage;