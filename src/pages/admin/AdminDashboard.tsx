import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Home, Users, Package, FileText, BarChart3, Settings } from 'lucide-react';
import AdminHome from './AdminHome';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import StaffSettings from '../staff/StaffSettings';
import StaffMerchandise from '../staff/StaffMerchandise';
import StaffOrders from '../staff/StaffOrders';
import StaffPayments from '../staff/StaffPayments';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Fee Payments', icon: FileText, path: '/admin/payments' },
  { label: 'Merchandise', icon: Package, path: '/admin/merchandise' },
  { label: 'Pre-Orders', icon: FileText, path: '/admin/orders' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="System Administrator">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<StaffPayments />} />
        <Route path="merchandise" element={<StaffMerchandise />} />
        <Route path="orders" element={<StaffOrders />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<StaffSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
