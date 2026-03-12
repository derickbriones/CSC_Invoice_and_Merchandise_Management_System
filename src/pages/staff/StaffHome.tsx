import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Package, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffHome = () => {
  const [stats, setStats] = useState({
    totalPayments: 0, pendingPayments: 0, approvedPayments: 0,
    totalOrders: 0, pendingOrders: 0, totalMerch: 0, feeRevenue: 0, merchRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [payments, orders, merch] = await Promise.all([
        supabase.from('csc_fee_payments').select('payment_status, amount'),
        supabase.from('orders').select('status, total_amount'),
        supabase.from('merchandise').select('id'),
      ]);

      const paymentData = payments.data || [];
      const orderData = orders.data || [];

      setStats({
        totalPayments: paymentData.length,
        pendingPayments: paymentData.filter(p => p.payment_status === 'pending').length,
        approvedPayments: paymentData.filter(p => p.payment_status === 'approved').length,
        totalOrders: orderData.length,
        pendingOrders: orderData.filter(o => o.status === 'pending').length,
        totalMerch: merch.data?.length || 0,
        feeRevenue: paymentData.filter(p => p.payment_status === 'approved').reduce((s, p) => s + p.amount, 0),
        merchRevenue: orderData.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_amount, 0),
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Pending Fee Approvals', value: stats.pendingPayments, icon: CreditCard, color: 'text-yellow-500' },
    { title: 'Approved Payments', value: stats.approvedPayments, icon: CreditCard, color: 'text-green-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-secondary' },
    { title: 'Total Revenue', value: `₱${(stats.feeRevenue + stats.merchRevenue).toFixed(2)}`, icon: TrendingUp, color: 'text-primary' },
  ];

  const quickLinks = [
    { label: 'Fee Approvals', desc: 'Review pending payments', path: '/staff/payments', icon: CreditCard },
    { label: 'Order Management', desc: 'Manage pre-orders', path: '/staff/orders', icon: ShoppingBag },
    { label: 'Inventory', desc: 'Manage merchandise', path: '/staff/merchandise', icon: Package },
    { label: 'Settings', desc: 'QR code & system config', path: '/staff/settings', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">Staff Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

export default StaffHome;
