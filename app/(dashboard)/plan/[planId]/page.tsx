"use client"; // Ensure this is a client-side component

import React, { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation'; // Use next/navigation hooks
import CreatePlan from '../planComponent/CreatePlanComponent'; // Adjust the path if needed
import { Plan } from '@/interfaces/Itinerary'; // Import your Plan type

const EditPlanPage: React.FC = () => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams(); // Get params from the route
  const pathname = usePathname(); // Optionally use pathname if needed for logging or additional logic

  useEffect(() => {
    const planId = params?.planId; // Destructure planId from params

    if (planId) {
      const fetchPlanById = async () => {
        try {
          const response = await fetch(`/api/plan/${planId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch the plan');
          }
          const data = await response.json();
          setPlan(data); // Set the fetched plan in state
        } catch (error) {
          console.error('Error fetching plan:', error);
          setError('Failed to load the plan. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchPlanById();
    }
  }, [params?.planId]); // Re-run only when params.planId changes

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while the plan is being fetched
  }

  if (error) {
    return <div>{error}</div>; // Show error if there is one
  }

  if (!plan) {
    return <div>Plan not found</div>; // If no plan is found, show a message
  }

  return <CreatePlan initialPlan={plan} />; // Render the CreatePlan component with the fetched plan data
};

export default EditPlanPage;
