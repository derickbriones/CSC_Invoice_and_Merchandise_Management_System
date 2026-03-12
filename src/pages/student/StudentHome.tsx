import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ShoppingBag, History, CheckCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const StudentHome = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ feeStatus: 'unpaid' as string, orders: 0, pending: 0, cartItems: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [fees, orders, cart] = await Promise.all([
        supabase.from('csc_fee_payments').select('payment_status').eq('user_id', user.id),
        supabase.from('orders').select('status').eq('user_id', user.id),
        supabase.from('cart_items').select('id').eq('user_id', user.id),
      ]);

      const feeData = fees.data || [];
      const latestFee = feeData.length > 0
        ? (feeData.some(f => f.payment_status === 'approved') ? 'paid'
          : feeData.some(f => f.payment_status === 'pending') ? 'pending' : 'unpaid')
        : 'unpaid';

      setStats({
        feeStatus: latestFee,
        orders: orders.data?.length || 0,
        pending: orders.data?.filter(o => o.status === 'pending').length || 0,
        cartItems: cart.data?.length || 0,
      });
    };
    fetchStats();
  }, [user]);

  const feeStatusConfig: Record<string, { color: string; label: string }> = {
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid ✓' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
    unpaid: { color: 'bg-red-100 text-red-800', label: 'Unpaid' },
  };

  const feeConfig = feeStatusConfig[stats.feeStatus] || feeStatusConfig.unpaid;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">
          Welcome, {profile?.first_name}! 👋
        </h2>
        <p className="text-muted-foreground">Here's your overview for this semester</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CSC Fee Status</CardTitle>
            <CreditCard className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <Badge className={feeConfig.color}>{feeConfig.label}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">{stats.orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <History className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cart Items</CardTitle>
            <ShoppingCart className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">{stats.cartItems}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-card-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/student/merchandise">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Merchandise Store</p>
                    <p className="text-xs text-muted-foreground">Browse & pre-order items</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/student/pay-fee">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Pay CSC Fee</p>
                    <p className="text-xs text-muted-foreground">Submit your payment</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/student/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">My Orders & Receipts</p>
                    <p className="text-xs text-muted-foreground">Track & print receipts</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
