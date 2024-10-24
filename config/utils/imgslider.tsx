"use client";
import React, { useState, useEffect } from 'react';
import { FaRegArrowAltCircleRight } from 'react-icons/fa'; // FontAwesome icons
import { FaCircleArrowRight, FaCircleArrowLeft } from "react-icons/fa6";
import { FiGlobe, FiBox, FiStar } from 'react-icons/fi'; // Using FontAwesome as replacements
import testImage2 from '../../public/images/img2.jpg'; // Ensure image paths are correct
import testImage3 from '../../public/images/img3.jpeg';
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from "react-icons/io";
import { useRouter } from 'next/navigation';


const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 5; // Total number of slides
  const images = [
    testImage2.src, // Make sure these images exist in your project
    testImage3.src,
    testImage2.src,
    testImage3.src,
    testImage2.src,
  ];

  const router = useRouter();

  // Automatically move to the next slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex, totalSlides]);

  // Function to handle manual slide navigation
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  };
  const handleBrowseClick = () => {
    router.push('/market');
  };

  return (
    <div className="relative w-full max-w-screen-xl mx-auto  shadow-2xl overflow-hidden rounded h-[250px] lg:h-[500px] group">
      {/* Image Container */}
      <div className="relative w-full h-full shadow-4xl">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              currentIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Left Arrow */}
      <button
  className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 bg-white  rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-95"
  onClick={goToPrevious}
>
  <IoIosArrowDropleftCircle className="text-blue-500 w-5 h-5 lg:h-9 lg:w-9" /> {/* Left Arrow */}
</button>

{/* Right Arrow */}
<button
  className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 bg-white  rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-95"
  onClick={goToNext}
>
  <IoIosArrowDroprightCircle className="text-blue-500 w-5 h-5 lg:h-9 lg:w-9" /> {/* Right Arrow */}
</button>

      {/* Slide Indicators (Circles) */}
      <div className="absolute top-6 w-full flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-blue-500' : 'bg-white'
            }`}
          ></div>
        ))}
      </div>

      {/* Background Row for Icons and Button */}
      <div className="absolute  bottom-0 left-0 w-full h-25 bg-gradient-to-r from-black/85 via-black/75 to-black/75 flex items-center justify-between   px-3 lg:px-12 py-2 lg:py-4">
        {/* Icons and Labels */} 
        <div className="flex space-x-3 lg:space-x-14 text-white">
          {/* Globe Icon */}
          <div className="flex items-center space-x-1 lg:space-x-2 ">
            <FiGlobe className="text-l lg:text-3xl" /> {/* Responsive icon size */}
            <div className="flex flex-col">
              <p className="text-[11px] lg:text-[18px] font-semibold">50</p>
              <p className="text-[11px] lg:text-[17px]">Countries</p>
            </div>
          </div>

          {/* Plans Icon */}
          <div className="flex items-center space-x-1 lg:space-x-2 ">
            <FiBox className="text-l lg:text-3xl" />
            <div className="flex flex-col">
              <p className="text-[11px] lg:text-[18px] font-semibold">120</p>
              <p className="text-[11px] lg:text-[17px]">Plans</p>
            </div>
          </div>

          {/* Top Sellers Icon */}
          <div className="flex items-center space-x-1 lg:space-x-2 ">
            <FiStar className="text-l lg:text-3xl mt-1 " />
            <div className="flex flex-col">
              <p className="text-[11px] sm:text-[18px] font-semibold">25</p>
              <p className="text-[11px] lg:text-[17px]"> Sellers</p>
            </div>
          </div>
        </div>

        {/* Browse Itineraries Button */}
        <button
      onClick={handleBrowseClick}
      className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-2 py-2 lg:px-8 rounded-xl shadow-lg text-xs lg:text-base hover:from-blue-600 hover:to-green-500 transition-all duration-300 flex items-center hover:scale-105"
    >
      Browse
      <FaRegArrowAltCircleRight className="ml-1 w-4 h-4 lg:w-6 lg:h-6" />
    </button>

      </div>
    </div>
  );
};

export default ImageSlider;
