import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Layout Container */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Header Navigation */}
        <Header />

        {/* Dynamic Page Content Canvas */}
        <main className="flex-1 md:pl-[240px] transition-all duration-300">
          <div className="p-comfortable md:p-loose max-w-[1600px] mx-auto flex flex-col gap-comfortable md:gap-loose">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
