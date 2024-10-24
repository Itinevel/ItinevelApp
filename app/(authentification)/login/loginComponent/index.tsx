"use client"

import React, { useState, useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from './Spinner';


const LoginPage = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const requestData={
        email:email,
        password:password
    }
    setLoading(false);
    const result = await signIn('credentials', {
      redirect: false, // Prevent automatic redirection
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error || 'Invalid credentials');
    } else {
      setError(null);
      router.push('/home'); // Redirect to the home page after successful login
    }
  } 

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('/api/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      setLoading(false);
  
      if (response.ok) {
        alert('Password reset email sent. Please check your inbox.');
      } else {
        // Check if the response has a body before parsing it as JSON
        const data = await response.text(); // Use text() instead of json() to avoid the error
        if (data) {
          const parsedData = JSON.parse(data);
          setError(parsedData.error || 'Failed to send reset email.');
        } else {
          setError('Failed to send reset email. No additional information provided.');
        }
      }
    } catch (err) {
      setLoading(false);
      console.error('Error sending reset email:', err);
      setError('Something went wrong, please try again later.');
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row   lg:h-screen w-full min-h-screen justify-center">
    {/* Image Section */}
    <div className="lg:w-2/3 relative hidden lg:block h-screen lg:h-auto">
      <img src={"/img/bali.webp"} alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white"></div>
    </div>
  
    {/* Form Section */}
    <div className="w-full h-screen lg:w-1/3 bg-white flex flex-col justify-center items-center p-8 font-amifer">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
        {isForgotPassword ? 'Reset Password' : 'Login'}
      </h1>
      <p className="text-gray-600 mb-8 text-center lg:text-left">
        {isForgotPassword ? 'Enter your email to reset your password' : 'Sign in to your account'}
      </p>
  
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
  
      {loading ? (
        <Spinner />
      ) : (
        <form className="w-full" onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
  
          {!isForgotPassword && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Your Password"
                className="w-full px-4 py-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
  
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            {isForgotPassword ? 'Send Reset Email' : 'Login'}
          </button>
        </form>
      )}
  
      {!isForgotPassword && (
        <div className="mt-4">
          <button onClick={() => setIsForgotPassword(true)} className="text-indigo-500 hover:text-indigo-600">
            Forgot Password?
          </button>
        </div>
      )}
  
      <div className="mt-6 text-center">
        {!isForgotPassword && (
          <p className="text-gray-600"> 
          Don&apos;t have an account?
          <a href="/register" className="text-indigo-500 hover:text-indigo-600">
            Register
          </a>
        </p>
        
        )}
      </div>
    </div>
  </div>
  
  );
}
export default LoginPage
