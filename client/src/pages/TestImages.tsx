import React from 'react';
import TestProductImage from '../components/TestProductImage';

const TestImages: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Image Integration Test</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <TestProductImage />
      </div>
    </div>
  );
};

export default TestImages;