"use client";
import React, { useEffect, useState } from 'react';
import { BsCheckCircle, BsPerson, BsEnvelope, BsPhone, BsLock } from 'react-icons/bs'; // Icons for the fields

interface ProfilePageProps {
  userId: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
  });
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
console.log("component",userId)
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`);
        const data = await response.json();
        console.log("data",data);
        setProfileData({
          name: data.name || '',
          surname: data.prenom || '',
          email: data.email || '',
          password: '', // Don't expose the real password
          phone: data.em_number || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
    console.log("data fetched",profileData);
  }, [userId]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, password: e.target.value });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

  const handleSave = async () => {
    if (profileData.password && profileData.password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setPasswordError('');
    setSuccessMessage(false);

    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          oldPassword, // Send oldPassword to validate before updating
        }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData({
          ...updatedData,
          password: '', // Hide real password after save
        });
        setOldPassword(''); // Clear the old password field
        setConfirmPassword(''); // Clear the confirm password field
        setIsEditing(false);
        setSuccessMessage(true); // Show success message
      } else {
        const errorData = await response.json();
        if (errorData.message === 'Invalid old password') {
          setPasswordError('Old password is incorrect');
        } else {
          console.error('Error saving profile:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-300 text-gray-400 flex items-center justify-center pt-10 lg:p-10 ">
      <div className="max-w-4xl w-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-12">
        {successMessage && (
          <div className="flex items-center justify-center mb-6">
            <BsCheckCircle className="text-green-500 text-2xl mr-2" />
            <p className="text-green-500 font-semibold">Profile updated successfully!</p>
          </div>
        )}
        {/* Profile fields */}
        <div className="space-y-8">
          <div className="relative flex items-center">
            <BsPerson className="absolute left-3 text-gray-400 text-xl" />
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pl-10 text-sm p-3 rounded-lg border-2 ${
                isEditing
                  ? 'border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 text-gray-900'
                  : 'border-gray-300 text-gray-600 cursor-not-allowed'
              } bg-white bg-opacity-50`}
              placeholder="Name"
            />
          </div>

          <div className="relative flex items-center">
            <BsPerson className="absolute left-3 text-gray-400 text-xl" />
            <input
              type="text"
              name="surname"
              value={profileData.surname || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pl-10 p-3 text-sm rounded-lg border-2 ${
                isEditing
                  ? 'border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 text-gray-900'
                  : 'border-gray-300 text-gray-600 cursor-not-allowed'
              } bg-white bg-opacity-50`}
              placeholder="Surname"
            />
          </div>

          <div className="relative flex items-center">
            <BsPhone className="absolute left-3 text-gray-400 text-xl" />
            <input
              type="text"
              name="phone"
              value={profileData.phone || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pl-10 p-3  text-sm rounded-lg border-2 ${
                isEditing
                  ? 'border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 text-gray-900'
                  : 'border-gray-300 text-gray-600 cursor-not-allowed'
              } bg-white bg-opacity-50`}
              placeholder="Phone"
            />
          </div>

          {/* Email field (non-editable for now) */}
          <div className="relative flex items-center">
            <BsEnvelope className="absolute left-3 text-gray-400 text-xl" />
            <input
              type="email"
              name="email"
              value={profileData.email}
              disabled
              className="w-full pl-10 p-3 text-sm rounded-lg border-2 border-gray-300 text-gray-600 cursor-not-allowed bg-white bg-opacity-50"
              placeholder="Email"
            />
          </div>

          {/* Old password field */}
          {isEditing && (
            <div className="relative flex items-center">
              <BsLock className="absolute left-3  text-gray-400 text-xl" />
              <input
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                className="w-full pl-10 p-3 text-sm rounded-lg border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white bg-opacity-50"
                placeholder="Old Password"
              />
            </div>
          )}

          {/* New Password field */}
          {isEditing && (
            <div className="relative flex items-center">
              <BsLock className="absolute left-3 text-gray-400 text-xl" />
              <input
                type="password"
                name="password"
                value={profileData.password}
                onChange={handlePasswordChange}
                className="w-full pl-10 p-3 text-sm rounded-lg border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white bg-opacity-50"
                placeholder="New Password"
              />
            </div>
          )}

          {/* Confirm password field */}
          {isEditing && (
            <div className="relative flex items-center">
              <BsLock className="absolute left-3 text-gray-400 text-xl" />
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full pl-10 p-3 text-sm rounded-lg border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white bg-opacity-50"
                placeholder="Confirm Password"
              />
              {passwordError && <p className="text-red-500">{passwordError}</p>}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex justify-center space-x-6">
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-xl text-white font-semibold hover:from-light-blue-500 hover:to-blue-500 transition-transform transform hover:scale-105"
            >
              Modify
            </button>
          ) : (
            <>
                           <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r text-sm lg:text-md from-blue-400 to-blue-700 rounded-xl shadow-xl text-white font-semibold hover:from-blue-400 hover:to-blue-600 transition-transform transform hover:scale-105"
              >
                Save
              </button>
              <button
                onClick={handleEditClick}
                className="px-8 py-3 bg-gradient-to-r text-sm lg:text-md from-gray-500 to-gray-700 rounded-xl shadow-xl text-white font-semibold hover:from-gray-400 hover:to-gray-600 transition-transform transform hover:scale-105"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

