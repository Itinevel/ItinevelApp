"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import axios from 'axios' // Updated import for useRouter in Next.js 13+ app directory

const ConfirmEmail = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState(false);
  const router = useRouter();  // Updated useRouter hook
  
  const token = new URLSearchParams(window.location.search).get("token"); 
  // Get the token from the URL query parameter
  useEffect(() => {
    if (token) {
        const fetchfunction = async()=>{
            try{
            const res = await axios.post(`/api/confirm-email?token=${token}`, {token: token})
             if(res.data.status === 'success'){
                setMessage('Your email has been confirmed successfully!'); 
                setTimeout(()=>{
                   router.push('/login')
                }, 3000)
                
             }else{
                setError(res.data.message)
             }
            }catch(error){
                setError(true);
                setMessage('An error occurred. Please try again later.');
 
            }
        }

        fetchfunction()
    }

      
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className={`text-2xl font-bold ${error ? 'text-red-500' : 'text-green-500'}`}>
        {message}
      </h1>
    </div>
  );
};

export default ConfirmEmail;
