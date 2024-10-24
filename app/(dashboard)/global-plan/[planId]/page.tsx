// app/global-plan/[planId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import GlobalPlanPage from '../globalPlanComponent';

const GlobalPlanDynamicPage = () => {
  const params = useParams();
  const planId  = params?.planId;

  if (!planId) {
    return <div>Loading...</div>;
  }

  return <GlobalPlanPage planId={planId as string} />;
};

export default GlobalPlanDynamicPage;
