import React from 'react';
import { FiMap, FiShare2 } from 'react-icons/fi'; // Feather icons
import { AiOutlineFileText } from 'react-icons/ai'; // Ant Design icons
import { FaDollarSign } from 'react-icons/fa'; // Font Awesome icons


const BecomeSellerPage: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-gray-100 overflow-y-scroll">
      {/* First Section */}
      <section className="flex flex-col md:flex-row items-center justify-between p-8 md:p-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        {/* Left Side - Title, Subtitle, Button */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-2xl md:text-5xl font-bold mb-4 font-amifer mt-12 lg:mt-0">
            Turn your Travel Itinerary Into Money
          </h1>
          <p className="text-sm md:text-xl mb-6 font-amifer max-w-[750px]">
            From personalized details and captivating photos to flexible pricing and unique experiences, Empower your journey and create unforgettable adventures that stand out.
          </p>

          <button className="bg-white text-indigo-600 text-sm lg:text-base  font-semibold px-4 py-2 lg:px-6 lg:py-3 rounded-full shadow-lg hover:bg-indigo-100 transition-all duration-300">
            Get Started
          </button>

          {/* PNG Arrow and Description */}
          <div className="relative mt-8 hidden md:flex">
            <div className="absolute left-36 ml-1 top-[-100px] flex items-center">
              <img src={'/img/arrow.png'} alt="Arrow pointing to button" className="w-32 h-32 transform" />
              <div className="flex flex-col justify-center max-w-[350px] -ml-2 mt-14 ">
                <p className="text-lg md:text-xl font-semibold font-amifer">
                  900$ refund with 15 sells for 60$, ensure providing quality data for highest gains!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Placeholder */}
        <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
          <div className="bg-white w-60 h-48 sm:w-72 sm:h-64 lg:mt-12 md:w-[800px] md:h-[400px] rounded-lg shadow-lg flex items-center justify-center">
            <img
              src={'/img/seller.png'}
              alt="Image Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section className="py-8 md:py-16 bg-white font-amifer">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-indigo-600 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-indigo-600 text-xl md:text-2xl font-bold mb-4">Step 1</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl">
                <FiMap />
              </div>
              <div className="text-indigo-600 font-semibold text-lg mt-4">Create a New Plan</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-indigo-600 text-xl md:text-2xl font-bold mb-4">Step 2</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl">
                <AiOutlineFileText />
              </div>
              <div className="text-indigo-600 font-semibold text-lg mt-4">Fill it with Tips & Details</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-indigo-600 text-xl md:text-2xl font-bold mb-4">Step 3</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl">
                <FiShare2 />
              </div>
              <div className="text-indigo-600 font-semibold text-lg mt-4">Share It</div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-indigo-600 text-xl md:text-2xl font-bold mb-4">Step 4</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl">
                <FaDollarSign />
              </div>
              <div className="text-indigo-600 font-semibold text-lg mt-4">Earn Money</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeSellerPage;
