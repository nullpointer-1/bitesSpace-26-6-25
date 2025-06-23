
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardOverview from '@/components/admin/DashboardOverview';
import VendorManagement from '@/components/admin/vendormanagement';
import TicketManagement from '@/components/admin/TicketManagement';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Routes, Route, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const getActiveSection = () => {
    const pathParts = location.pathname.split('/');
    // For "/admin-dashboard/vendors", pathParts[2] is "vendors"
    // For "/admin-dashboard", pathParts[2] is undefined, so we default to "dashboard"
    return pathParts[2] || 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      <AdminSidebar
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
        <header className="p-4 flex justify-end">
            <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
        </header>
        <main className="p-8 pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="vendors" element={<VendorManagement />} />
                <Route path="tickets" element={<TicketManagement />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;