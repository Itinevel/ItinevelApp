"use client";

import { useParams } from 'next/navigation';
import PreviewPlan from '../previewPlanComponent'; // Adjust the path based on your structure

const PreviewPlanPage = () => {
  const params = useParams();
  const planId = typeof params?.planId === 'string' ? params.planId : undefined;

  if (!planId) {
    return <div>Loading...</div>;
  }

  return <PreviewPlan planId={planId} />;
};

export default PreviewPlanPage;
