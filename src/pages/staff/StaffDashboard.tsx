import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Home, CreditCard, Package, FileText, Settings } from 'lucide-react';
import StaffHome from './StaffHome';
import StaffPayments from './StaffPayments';
import StaffMerchandise from './StaffMerchandise';
import StaffOrders from './StaffOrders';
import StaffSettings from './StaffSettings';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/staff' },
  { label: 'Fee Payments', icon: CreditCard, path: '/staff/payments' },
  { label: 'Merchandise', icon: Package, path: '/staff/merchandise' },
  { label: 'Pre-Orders', icon: FileText, path: '/staff/orders' },
  { label: 'Settings', icon: Settings, path: '/staff/settings' },
];

const StaffDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="CSC Staff Portal">
      <Routes>
        <Route index element={<StaffHome />} />
        <Route path="payments" element={<StaffPayments />} />
        <Route path="merchandise" element={<StaffMerchandise />} />
        <Route path="orders" element={<StaffOrders />} />
        <Route path="settings" element={<StaffSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StaffDashboard;
