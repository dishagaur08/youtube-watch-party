import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ContextPanel from './ContextPanel';
import CallModal from './CallModal';
import IncomingCallDialog from './IncomingCallDialog';

const Layout = () => {
  return (
    <div className="flex h-screen bg-vyntra-bg text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto min-w-0 flex">
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <Outlet />
          </div>
          <ContextPanel />
        </main>
      </div>

      {/* Real-time Call Interfaces */}
      <IncomingCallDialog />
      <CallModal />
    </div>
  );
};

export default Layout;
