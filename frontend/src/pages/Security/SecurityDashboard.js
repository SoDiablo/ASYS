import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';

const SecurityDashboard = () => {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-black tracking-tighter text-primary mb-4">Security Dashboard</h1>
        <p className="text-on-surface-variant">Monitor parking and visitor activity</p>
      </div>
    </MainLayout>
  );
};

export default SecurityDashboard;
