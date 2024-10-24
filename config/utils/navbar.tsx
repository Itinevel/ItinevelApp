"use client"; // Client-side component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Itinefylogo from '../../public/images/Itinefy.png'; // Your logo image
import { FaChevronDown, FaChevronUp, FaHome, FaMapMarkerAlt, FaInfoCircle, FaUserCircle, FaSignOutAlt, FaUserPlus, FaSignInAlt, FaStoreAlt } from 'react-icons/fa'; // Importing icons
import { useSession, signOut, getSession } from 'next-auth/react';
import { Plan } from '../../interfaces/Itinerary';

interface NavbarProps {
  className?: string;
  onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ className, onNavigate }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for the popup
  const [role, setRole] = useState<string[]>([]); // Initialize as an array
  const [username, setUsername] = useState('User'); // Add username state
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const userId = session?.user?.id;
  console.log("user id",userId)

  // Fetch user roles and set isSeller
  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.email || 'User'); // Set the username if available
      const userRoles = session.user.roles || []; // Fetch roles from the session
      setRole(userRoles);
      setIsSeller(userRoles.includes('SELLER')); // Update seller status based on roles
    }
  }, [session]);

  // Fetch the user's plans from the backend
  useEffect(() => {
    const fetchUserPlans = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch(`https://itinevel-back.vercel.app/api/users/${userId}/plans`); // Adjust the API route if necessary
          const plans = await response.json();
          setUserPlans(plans); // Save plans in state
        } catch (error) {
          console.error('Error fetching user plans:', error);
        }
      }
    };

    fetchUserPlans();
  }, [userId, isLoggedIn]);

  // Handle redirection logic for My Itineraries link
  const getItinerariesRedirect = () => {
    if (userPlans.length > 0) {
      // Redirect to edit the first plan if any plans exist
      return `/edit-plan/${userPlans[0].id}`;
    }
    // Redirect to create a new plan if none exist
    return '/create-plan';
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

  // Confirm becoming a seller
  const confirmBecomeSeller = async () => {
    try {
      // Send request to update roles in the database
      const response = await fetch(`https://itinevel-back.vercel.app/api/users/${userId}/updateRole`, {
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

      if (updatedSession?.user?.roles.includes('SELLER')) {
        setRole(updatedSession.user.roles); // Update roles in the state
        setIsSeller(true); // Update seller status
      }

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
    <nav className={`bg-gradient-to-r from-blue-100/60 via-blue-100 to-blue-200/30 p-2   ${className}`}>
  <div className="mx-auto flex items-center justify-between">
    {/* Logo */}
    <div className="ml-4 sm:ml-8 flex items-center flex-grow-0">
      <a href="/home" onClick={(e) => { e.preventDefault(); onNavigate('/home'); }}>
        <Image
          src={Itinefylogo}
          alt="Itinerary Logo"
          width={150}
          height={50}
          className="cursor-pointer"
        />
      </a>
    </div>

    {/* Desktop Menu */}
    <ul className="hidden lg:flex xl:flex space-x-4 lg:space-x-8 text-md font-medium mx-auto">
      <li>
        <a href="/home" onClick={(e) => { e.preventDefault(); onNavigate('/home'); }} className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
          <FaHome className="mr-1 lg:mr-2" /> Home
        </a>
      </li>
      <li>
        <a href="/market" onClick={(e) => { e.preventDefault(); onNavigate('/market'); }} className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
          <FaMapMarkerAlt className="mr-1 lg:mr-2" /> Itineraries
        </a>
      </li>

      {isLoggedIn ? (
        isSeller ? (
          <li>
            <a href={getItinerariesRedirect()} onClick={(e) => { e.preventDefault(); onNavigate(getItinerariesRedirect()); }} className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
              <FaMapMarkerAlt className="mr-1 lg:mr-2" /> My Itineraries
            </a>
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
          <button onClick={() => onNavigate('/register?role=seller,user')} className="hover:border-b-4 hover:border-green-500 text-green-500 transition-colors flex items-center">
            <FaStoreAlt className="mr-1 lg:mr-2" /> Become a Seller
          </button>
        </li>
      )}

      <li>
        <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('/about'); }} className="hover:border-b-4 hover:border-blue-800 text-blue-800 transition-colors flex items-center">
          <FaInfoCircle className="mr-1 lg:mr-2" /> About
        </a>
      </li>
    </ul>

    {/* Profile Section */}
    <div className="ml-auto mr-4 lg:mr-12 flex items-center">
      {!isLoggedIn ? (
        <>
          <a href="/register" onClick={(e) => { e.preventDefault(); onNavigate('/register'); }}>
            <button className="ml-2 lg:ml-4 px-3 lg:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm shadow-md hover:from-green-600 hover:to-green-700 transition-transform transform hover:scale-105 flex items-center">
              <FaUserPlus className="mr-1 lg:mr-2" /> Register
            </button>
          </a>
          <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('/login'); }}>
            <button className="ml-2 lg:ml-4 px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:from-blue-600 hover:to-blue-700 transition-transform transform hover:scale-105 flex items-center">
              <FaSignInAlt className="mr-1 lg:mr-2" /> Login
            </button>
          </a>
        </>
      ) : (
        <div className="relative">
          <button onClick={toggleProfileMenu} className="ml-2 lg:ml-4 flex items-center px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold text-sm shadow-md transition-transform transform hover:scale-105">
            <FaUserCircle className="mr-1 lg:mr-2" />
            {username.slice(0, 2)} {/* Show only first 2 letters of username */}
            {isProfileOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
              <a href={`/profile/${userId}`} onClick={(e) => { e.preventDefault(); onNavigate(`/profile/${userId}`); }}>
                <button className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center">
                  <FaUserCircle className="mr-2" /> Edit Profile
                </button>
              </a>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center">
                <FaSignOutAlt className="mr-2" /> Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Mobile Menu Toggle */}
    <div className="flex lg:hidden xl:hidden items-center">
      <button onClick={toggleMobileMenu} className="text-blue-800 focus:outline-none">
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
        <a href="/home" onClick={(e) => { e.preventDefault(); onNavigate('/home'); }} className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
          <FaHome className="mr-2" /> Home
        </a>
      </li>
      <li>
        <a href="/market" onClick={(e) => { e.preventDefault(); onNavigate('/market'); }} className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
          <FaMapMarkerAlt className="mr-2" /> Itineraries
        </a>
      </li>
      <li>
        <a href={getItinerariesRedirect()} onClick={(e) => { e.preventDefault(); onNavigate(getItinerariesRedirect()); }} className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
          <FaMapMarkerAlt className="mr-2" /> My Itineraries
        </a>
      </li>
      <li>
        <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('/about'); }} className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
          <FaInfoCircle className="mr-2" /> About
        </a>
      </li>
      {!isSeller && (
        <li>
          <button onClick={handleBecomeSeller} className="hover:border-b-4 hover:border-green-500 text-green-500 transition-colors flex items-center">
            <FaStoreAlt className="mr-2" /> Become a Seller
          </button>
        </li>
      )}
      {isSeller && (
        <li>
          <a href={getItinerariesRedirect()} onClick={(e) => { e.preventDefault(); onNavigate(getItinerariesRedirect()); }} className="hover:border-b-4 hover:border-blue-800 transition-colors flex items-center">
                <FaMapMarkerAlt className="mr-2" /> My Itineraries
          </a>
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
          <button onClick={confirmBecomeSeller} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  )}
</nav>


  );
};

export default Navbar;

