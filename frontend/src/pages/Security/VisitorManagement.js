import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';

const VisitorManagement = () => {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-black tracking-tighter text-primary mb-4">Visitor Management</h1>
        <p className="text-on-surface-variant">Register and track visitor vehicles</p>
      </div>
    </MainLayout>
  );
};

export default VisitorManagement;
