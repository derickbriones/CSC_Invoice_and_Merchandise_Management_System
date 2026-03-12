import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Printer, MapPin, Calendar } from 'lucide-react';
import { generatePdfReceipt } from '@/utils/generatePdfReceipt';

const StudentOrders = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, merchandise(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': case 'ready': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const printOrderReceipt = (order: any) => {
    generatePdfReceipt({
      receiptNumber: order.order_number,
      date: new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      studentName: `${profile?.first_name} ${profile?.last_name}`,
      studentId: profile?.student_id || undefined,
      course: profile?.course || undefined,
      yearLevel: profile?.year_level || undefined,
      type: 'merchandise',
      amount: order.total_amount,
      paymentMethod: order.payment_method,
      orderNumber: order.order_number,
      claimDate: order.claim_date ? new Date(order.claim_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
      claimVenue: order.claim_venue || undefined,
      items: order.order_items?.map((i: any) => ({
        name: i.merchandise_name,
        quantity: i.quantity,
        size: i.size,
        unitPrice: i.unit_price,
      })),
    });
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">My Pre-Orders</h2>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No pre-orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">{order.order_number}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(order.status)}>{order.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => printOrderReceipt(order)}>
                      <Printer className="w-4 h-4 mr-1" /> Receipt
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-card-foreground">
                        {item.merchandise_name} {item.size ? `(${item.size})` : ''} × {item.quantity}
                      </span>
                      <span className="text-muted-foreground">₱{(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₱{order.total_amount.toFixed(2)}</span>
                  </div>

                  {/* Claim Info */}
                  {(order.claim_date || order.claim_venue) && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-1">
                      <p className="text-xs font-semibold text-card-foreground">📦 Claim Information</p>
                      {order.claim_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.claim_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {order.claim_venue && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.claim_venue}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentOrders;
