import React from 'react';

interface ImagesComponentProps {
  images: string[]; // Accept an array of image URLs
}

const ImagesComponent: React.FC<ImagesComponentProps> = ({ images }) => {
  // Debugging: Log the images passed to the component
  console.log("Images received in ImagesComponent:", images);

  // Only show the images if there are any
  if (images.length === 0) {
    return <div>No Images Available</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4 rounded-lg">
      {/* Main Image */}
      <div className="w-full h-40 md:w-1/2 md:h-auto max-h-[455px] overflow-hidden rounded-lg md:rounded-l-lg md:rounded-tr-none shadow-lg relative group">
        <img
          src={images[0]}
          alt="Main"
          className="object-cover w-full h-full max-h-[455px] rounded-lg md:rounded-l-lg md:rounded-tr-none transform transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* Small Images Grid - Hidden on mobile */}
      <div className="hidden md:grid w-full md:w-1/2 grid-cols-2 gap-2 md:gap-4 pl-2">
        {images.slice(1, 5).map((src, index) => (
          <div
            key={index}
            className={`relative h-25 md:h-80 max-h-[215px] overflow-hidden shadow-lg group ${
              index === 0
                ? 'rounded-none'
                : index === 1
                ? 'rounded-tr-lg'
                : index === 2
                ? 'rounded-none'
                : 'rounded-br-lg'
            }`}
          >
            <img
              src={src}
              alt={`Small ${index + 1}`}
              className="object-cover w-full h-full max-h-[278px] transform transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">9+</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagesComponent;
