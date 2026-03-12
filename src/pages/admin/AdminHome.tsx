import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, ShoppingBag, Package, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalPayments: 0, totalOrders: 0,
    totalMerch: 0, feeRevenue: 0, merchRevenue: 0
  });

  useEffect(() => {
    const fetch = async () => {
      const [profiles, payments, orders, merch] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('csc_fee_payments').select('amount, payment_status'),
        supabase.from('orders').select('total_amount, status'),
        supabase.from('merchandise').select('id'),
      ]);

      setStats({
        totalUsers: profiles.data?.length || 0,
        totalPayments: payments.data?.length || 0,
        totalOrders: orders.data?.length || 0,
        totalMerch: merch.data?.length || 0,
        feeRevenue: payments.data?.filter(p => p.payment_status === 'approved').reduce((s, p) => s + p.amount, 0) || 0,
        merchRevenue: orders.data?.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_amount, 0) || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { title: 'Total Payments', value: stats.totalPayments, icon: CreditCard, color: 'text-green-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-secondary' },
    { title: 'Merchandise Items', value: stats.totalMerch, icon: Package, color: 'text-purple-500' },
    { title: 'Fee Revenue', value: `₱${stats.feeRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Merch Revenue', value: `₱${stats.merchRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-primary' },
  ];

  const quickLinks = [
    { label: 'User Management', desc: 'Manage users & roles', path: '/admin/users', icon: Users },
    { label: 'Reports', desc: 'Financial reports & export', path: '/admin/reports', icon: TrendingUp },
    { label: 'Fee Payments', desc: 'Review & approve fees', path: '/admin/payments', icon: CreditCard },
    { label: 'System Settings', desc: 'Configure system', path: '/admin/settings', icon: Package },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-card-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-card-foreground mb-3">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <link.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
