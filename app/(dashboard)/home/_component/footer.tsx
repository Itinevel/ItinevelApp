"use clinet"
const FooterPage = ()=>{
    return (
        <div className="w-full relative m z-20">
        <div className="absolute top-0 w-full h-0.5 shadow-md bg-gray-300"></div>
        <footer className="w-full bg-gradient-to-r from-white to-blue-200 text-blue-800 lg:py-4 shadow-2xl">
          <div className="max-w-screen">
            <div className="flex pt-4 lg:pt-0 flex-row justify-between px-6 lg:px-16  ">
              <div className="mb-2">
                <h3 className="font-semibold text-[13px] lg:text-[16px] hover:text-blue-600">
                  About
                </h3>
                <ul className="space-y-[1px]">
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Our Story</a></li>
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Team</a></li>
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Careers</a></li>
                </ul>
              </div>
              <div className=" md:mb-0">
                <h3 className="font-semibold text-[13px] lg:text-[16px] hover:text-blue-600">
                  Contact
                </h3>
                <ul className="space-y-[1px]">
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Support</a></li>
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">FAQ</a></li>
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Feedback</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[13px] lg:text-[16px] hover:text-blue-600">
                  Follow Us
                </h3>
                <ul className="space-y-[1px]">
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Twitter</a></li>
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Instagram</a></li>
                  <li><a href="#" className="hover:underline hover:text-blue-600 text-xs lg:text-[14px]">Facebook</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
}
export default FooterPage