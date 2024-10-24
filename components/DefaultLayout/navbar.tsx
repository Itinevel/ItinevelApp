"use client"


import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaHome, FaInfoCircle, FaMapMarkerAlt, FaSignInAlt, FaSignOutAlt, FaStoreAlt, FaUserCircle, FaUserPlus } from "react-icons/fa";
import { useSession, signOut, getSession } from 'next-auth/react';

import { Plan } from "@/interfaces/Itinerary";

interface NavbarProps {
  onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
    const { data: session, status } = useSession();
    const [ isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [username, setUsername] = useState('User');
    const [role, setRole] = useState<string[]>([]);
    const isLoggedIn = status === 'authenticated';
    const [isSeller, setIsSeller] = useState(false);
    const [userPlans, setUserPlans] = useState<Plan[]>([]);
    const userId = session?.user?.id;
    console.log("data:",session);
    console.log("user id",userId)

    useEffect(() => {
      if (session?.user) {
        setUsername(session.user.email || 'User'); // Set the username if available
        const userRoles = session.user.roles || []; // Fetch roles from the session
        setRole(userRoles);
        setIsSeller(userRoles.includes('SELLER')); // Update seller status based on roles
      }
    }, [session]);

    useEffect(() => {
      const fetchUserPlans = async () => {
        if (isLoggedIn) {
          try {
            const response = await fetch(`/api/user/${userId}/plans`); // Adjust the API route if necessary
            const plans = await response.json();
            console.log("userPlans", plans);
            setUserPlans(plans); // Save plans in state
          } catch (error) {
            console.error('Error fetching user plans:', error);
          }
        }
      };
  
      fetchUserPlans();
    }, [userId, isLoggedIn]);
  
    const getItinerariesRedirect = () => {
      if (userPlans.length > 0) {
        // Redirect to edit the first plan if any plans exist
        return `/plan/${userPlans[0].id}`;
      }
      // Redirect to create a new plan if none exist
      return '/plan/create';
    };
  
    const handleLogout = async () => {
      await signOut({ redirect: false });
      window.location.reload();
    };
    const toggleMobileMenu = () => {
      setMobileMenuOpen(!isMobileMenuOpen);
    };
  
    const toggleProfileMenu = () => {
      setIsProfileOpen(!isProfileOpen);
    };
  
    // Show popup for becoming a seller
    const handleBecomeSeller = () => {
      if (!isLoggedIn) {
        onNavigate('/register?role=seller,user');
      } else if (role && role.includes('USER')) {
        setIsPopupOpen(true); // Open the popup
      }
    };

    const confirmBecomeSeller = async () => {
      try {
        // Send request to update roles in the database
        const response = await fetch(`/api/user/${userId}/updateRole`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roles: [...role, 'SELLER'] }), // Add SELLER role to the roles array
        });
  
        if (!response.ok) {
          throw new Error('Failed to update roles');
        }
  
        // Refetch the session to get updated roles
        const updatedSession = await getSession();
        if (updatedSession){
        if (updatedSession.user.roles?.includes('SELLER')) {
          setRole(updatedSession.user.roles); // Update roles in the state
          setIsSeller(true); // Update seller status
        }}
  
        alert('Congratulations, you are now a seller!');
        onNavigate('/create-plan'); // Redirect to create itinerary page
      } catch (error) {
        console.error('Error updating roles:', error);
        alert('Failed to update roles. Please try again later.');
      }
    };
  
    // Cancel becoming a seller
    const cancelBecomeSeller = () => {
      setIsPopupOpen(false); // Close the popup
    };
    
    return (
    <nav className={`bg-gradient-to-r from-blue-100/60 via-blue-100 to-blue-200/30 p-2 fixed top-0 left-0 w-full z-50`}>
        <div className="mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="ml-4 sm:ml-8 flex items-center flex-grow-0">
           <Link href={"/home"}>
              <Image
                src={"/img/Itinefy.png"}
                alt="Itinerary Logo"
                width={150}
                height={50}
                priority
                className="cursor-pointer"
              />
            </Link>
          </div>
      
          {/* Desktop Menu */}
          <ul className="hidden lg:flex xl:flex space-x-4 lg:space-x-8 text-md font-medium mx-auto">
            <li>
              <Link href="/home" className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
                <FaHome className="mr-1 lg:mr-2" /> Home
              </Link>
            </li>
            <li>
              <Link href="/market"  className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
                <FaMapMarkerAlt className="mr-1 lg:mr-2" /> Itineraries
              </Link>
            </li>
      
            {isLoggedIn ? (
              isSeller ? (
                <li>
                  <Link href={getItinerariesRedirect()} className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
                    <FaMapMarkerAlt className="mr-1 lg:mr-2" /> My Itineraries
                  </Link>
                </li>
              ) : (
                <li>
                  <button onClick={handleBecomeSeller} className="hover:border-b-4 hover:border-green-500 text-green-500 transition-colors flex items-center">
                    <FaStoreAlt className="mr-1 lg:mr-2" /> Become a Seller
                  </button>
                </li>
              )
            ) : (
              <li>
                <button onClick={handleBecomeSeller}  className="hover:border-b-4 hover:border-green-500 text-green-500 transition-colors flex items-center">
                  <FaStoreAlt className="mr-1 lg:mr-2" /> Become a Seller
                </button>
              </li>
            )}
      
            <li>
              <Link href="/about"  className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
                <FaInfoCircle className="mr-1 lg:mr-2" /> About
              </Link>
            </li>
          </ul>
      
          {/* Profile Section */}
          <div className="ml-auto mr-4 lg:mr-12 flex items-center">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <button className="ml-2 lg:ml-4 px-3 lg:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm shadow-md hover:from-green-600 hover:to-green-700 transition-transform transform hover:scale-105 flex items-center">
                    <FaUserPlus className="mr-1 lg:mr-2" /> Register
                  </button>
                </Link>
                <Link href="/login" >
                  <button className="ml-2 lg:ml-4 px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:from-blue-600 hover:to-blue-700 transition-transform transform hover:scale-105 flex items-center">
                    <FaSignInAlt className="mr-1 lg:mr-2" /> Login
                  </button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={toggleProfileMenu} className="ml-2 lg:ml-4 flex items-center px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold text-sm shadow-md transition-transform transform hover:scale-105">
                  <FaUserCircle className="mr-1 lg:mr-2" />
                  {username.slice(0, 2)}
                  {/* Show only first 2 letters of username */}
                  {isProfileOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                    <Link href={`/profile/${userId}`} >
                      <button className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center">
                        <FaUserCircle className="mr-2" /> Edit Profile
                      </button>
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center">
                      <FaSignOutAlt className="mr-2" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
      
          {/* Mobile Menu Toggle */}
          <div onClick={toggleMobileMenu} className="flex lg:hidden xl:hidden items-center">
            <button  className="text-blue-800 focus:outline-none">
              <span className="block w-6 h-1 bg-blue-800 mb-1"></span>
              <span className="block w-6 h-1 bg-blue-800 mb-1"></span>
              <span className="block w-6 h-1 bg-blue-800"></span>
            </button>
          </div>
        </div>
      
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <ul className="lg:hidden flex -mx-1  bg-blue-100 rounded-b-xl p-4 flex-col space-y-4 mt-3 text-lg font-medium text-blue-800">
            <li>
              <Link href="/home"  className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
                <FaHome className="mr-2" /> Home
              </Link>
            </li>
            <li>
              <Link href="/market"  className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Itineraries
              </Link>
            </li>
            <li>
              <Link href={getItinerariesRedirect()}  className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
                <FaMapMarkerAlt className="mr-2" /> My Itineraries
              </Link>
            </li>
            <li>
              <Link href="/about"  className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
                <FaInfoCircle className="mr-2" /> About
              </Link>
            </li>
            {!isSeller && (
              <li>
                <button onClick={handleBecomeSeller}  className="hover:border-b-4 hover:border-green-500 text-green-500 transition-colors flex items-center">
                  <FaStoreAlt className="mr-2" /> Become a Seller
                </button>
              </li>
            )}
            {isSeller && (
              <li>
                <Link href={getItinerariesRedirect()} onClick={(e) => { e.preventDefault(); onNavigate(getItinerariesRedirect()); }}  className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
                      <FaMapMarkerAlt className="mr-2" /> My Itineraries
                </Link>
              </li>
            )}
            {!isLoggedIn ? (
              <>
              
              </>
            ) : (
              <li>
                <button onClick={handleLogout} className="hover:border-b-4 hover:border-blue-500 transition-colors flex items-center">
                  <FaSignOutAlt className="mr-2" /> Log Out
                </button>
              </li>
            )}
          </ul>
        )}
      
        {/* Popup for Becoming a Seller */}
        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg z-60">
              <h3 className="text-lg font-semibold">Become a Seller</h3>
              <p className="mt-2 text-black">Becoming a seller allows you to create an itinerary with personalized details.</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={cancelBecomeSeller} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors">Cancel</button>
                <button  onClick={confirmBecomeSeller} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      
        );
      };
      
      export default Navbar;
