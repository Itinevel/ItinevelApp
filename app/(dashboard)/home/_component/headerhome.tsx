"use client"
const HeaderHome = ()=>{
return(
    <div className="w-full relative  pb-6 lg:pt-32 lg:pb-12 flex flex-col items-center justify-start shadow-lg">
    {/* Background Image */}
    <img src={"/img/imgx.jpg"} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0 " style={{ filter: 'grayscale(20%)' }} />
  
    {/* Left side shadow gradient */}
    <div className="absolute left-0 top-0 bottom-0 w-12 lg:w-64 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
  
    {/* Right side shadow gradient */}
    <div className="absolute right-0 top-0 bottom-0 w-12 lg:w-64  bg-gradient-to-l from-black/50 to-transparent z-10"></div>
  
    {/* Content */}
    <div className="relative z-20 w-full flex flex-col mt-20  items-center">
    <h1 className="text-xl lg:text-4xl font-bold  mb-20 lg:mb-28   text-white max-w-screen-2xl w-full text-left px-4 lg:px-12">
        Plan your trip with ease
      </h1>
      <h2 className="text-xl lg:text-4xl font-semibold   text-white text-center">
        Where are we headed?
      </h2>
    </div>
  </div>
)
}
export default HeaderHome