"use client"

import { useState } from "react";
import Navbar from "./navbar"
import { useRouter } from "next/navigation";

export default function DefaultLayout ({
    children,
}:{children: React.ReactNode}){

  const [loading, setLoading] = useState(false); // Manage loading state
  const router = useRouter(); // Get router instance from next/navigation

  const handleNavigation = (path: string) => {
    setLoading(true);  // Show spinner
    router.push(path); // Navigate to the new page
    setTimeout(() => setLoading(false), 500); // Hide spinner after a short delay
  };
return(
    <div className="flex flex-col h-screen">
        {/* Fixed Navbar */}
        <Navbar onNavigate={handleNavigation}/>
        {/* Main content with padding and custom scrollbar */}
        <main className="flex-1 overflow-auto  ">
          {children}
        </main>
      </div>
    )
}
