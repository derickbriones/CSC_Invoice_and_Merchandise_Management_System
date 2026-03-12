import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Home, ShoppingBag, CreditCard, History, ShoppingCart } from 'lucide-react';
import StudentHome from './StudentHome';
import StudentMerchandise from './StudentMerchandise';
import StudentPayFee from './StudentPayFee';
import StudentOrders from './StudentOrders';
import StudentCart from './StudentCart';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/student' },
  { label: 'Merchandise', icon: ShoppingBag, path: '/student/merchandise' },
  { label: 'Pay CSC Fee', icon: CreditCard, path: '/student/pay-fee' },
  { label: 'My Orders', icon: History, path: '/student/orders' },
  { label: 'Cart', icon: ShoppingCart, path: '/student/cart' },
];

const StudentDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="Student Portal">
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="merchandise" element={<StudentMerchandise />} />
        <Route path="pay-fee" element={<StudentPayFee />} />
        <Route path="orders" element={<StudentOrders />} />
        <Route path="cart" element={<StudentCart />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
