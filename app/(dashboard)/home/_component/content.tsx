"use client"

import { FaCrown, FaSearch, FaTag } from "react-icons/fa"
import ImageSlider from "./image-slider"
import { itineraries } from "@/data/statsitic"
import CardsSlider from "./cards-slider"

const ContentPage = ()=>{
    const plans = itineraries
    return(
        <div className="relative w-full z-0">
        {/* Background Image for this section only */}
      
        {/* Search Bar positioned half inside and half outside */}
        <div className="w-full max-w-screen-2xl mx-auto px-12 lg:px-24 relative z-10">
          <div className="relative w-full flex justify-center -mt-5 lg:-mt-7 ">
            <div className="w-full md:w-9/12 lg:w-7/12 flex bg-white rounded shadow-xl overflow-hidden">
              <div className="px-3 lg:px-4 flex items-center justify-center text-gray-400">
                <FaSearch className="w-4 h-4 lg:h-6 lg:w-5" />
              </div>
              <input
                type="text"
                className="flex-grow py-2 lg:py-4  lg:px-2  text-xs lg:text-sm lg-text-xl text-black outline-none font-amifer"
                placeholder="Search destinations..."
              />
              <button className="px-4 lg:px-6 text-xs lg:text-lg bg-blue-500 text-white font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105">
                Search
              </button>
            </div>
          </div>

         

        </div>

         {/* Image Slider */}
         <div className="relative lg:mt-8 min-w-full max-w-screen-lg mx-auto sm:max-w-md md:max-w-lg lg:max-w-7xl xl:max-w-7xl z-10 p-6  transform transition-all hover:scale-105">
          <ImageSlider />
         </div>

        {/* Top Rated Itineraries Section */}
        <div className="lg:mt-2 lg:mx-24 relative z-10 lg:p-8  p-5  2xl:px-56  transition-transform transform hover:scale-105">
            <h2 className="text-l lg:text-xl ml-2 lg:ml-8 text-black font-bold text-left flex items-center">
              <FaCrown className="mr-2 text-yellow-500 animate-bounce" />
              Top Rated Itineraries
            </h2>
            <div className="lg:ml-8  mt-4">
              <CardsSlider title="Top Rated Itineraries" plans={plans} />
            </div>
            </div>


                    {/* Weekly Deals Section */}
                    <div className=" lg:mx-24  relative z-10 p-6 2xl:px-56  transition-transform transform hover:scale-105">
                        <h2 className="text-l lg:text-xl ml-2 lg:ml-8 text-black font-bold text-left flex items-center">
                        <FaTag className="mr-2 text-green-500 animate-pulse" />
                        Weekly Deals
                        </h2>
                        <div className="lg:ml-8 mt-4  ">
                           <CardsSlider title="Weekly Deals" plans={plans} />
                        </div>
          </div>

        {/* Explore More Section */}
        <div className="relative w-full bg-gradient-to-b from-blue-500/100 via-blue-100  to-white py-6 lg:pb-10 mt-10 lg:mt-8 shadow-lg ">
        <img 
          src={"/img/imgy.jpg"} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-10 filter grayscale"
          style={{ filter: 'grayscale(20%)' }}
        />
          <h2 className="text-xl lg:text-3xl font-bold text-center mb-6 z-50 lg:mb-8 text-white">
            Explore More
          </h2>
          <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-6 px-6 lg:px-12">
            {plans.slice(0,3).map((item, index) => (
              <div
                key={index}
                className="relative w-full md:w-1/3 h-[350px]  bg-white shadow-xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs lg-text:sm font-bold px-3 py-1 rounded-bl-lg">
                  Coming Soon
                </div>
                <img
                  src={"/img/img7.jpg"}
                  alt={item.title}
                  className="w-full h-3/4 object-cover hover:opacity-90"
                />
                <div className="px-4 py-1 h-1/4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs lg:text-sm text-gray-700 mt-1 lg:mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div> 
    )
}
export default ContentPage