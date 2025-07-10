import React, { Suspense } from 'react';
import Employers from '@/components/page/Employer';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function EmployersContent() {
  return <Employers />;
}

const EmployerPage: React.FC = () => {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading employers..." />}>
      <EmployersContent />
    </Suspense>
  );
};

export default EmployerPage;