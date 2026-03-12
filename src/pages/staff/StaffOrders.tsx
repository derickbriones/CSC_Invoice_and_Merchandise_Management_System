import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

const StaffOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  const [claimDate, setClaimDate] = useState('');
  const [claimVenue, setClaimVenue] = useState('');

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(merchandise_name, quantity, size, unit_price), profiles!orders_user_id_fkey(first_name, last_name, student_id, course)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update');
    else { toast.success(`Order ${status}`); fetchOrders(); }
  };

  const saveClaim = async (id: string) => {
    const { error } = await supabase.from('orders').update({
      claim_date: claimDate || null,
      claim_venue: claimVenue || null,
    }).eq('id', id);
    if (error) toast.error('Failed to save');
    else {
      toast.success('Claim details saved');
      setEditingClaim(null);
      fetchOrders();
    }
  };

  const exportOrders = () => {
    const rows = orders.map(o => ({
      'Order Number': o.order_number,
      'Student Name': `${o.profiles?.first_name} ${o.profiles?.last_name}`,
      'Student ID': o.profiles?.student_id || '',
      'Course': o.profiles?.course || '',
      'Items': o.order_items?.map((i: any) => `${i.merchandise_name} x${i.quantity}`).join('; '),
      'Total': o.total_amount,
      'Status': o.status,
      'Claim Date': o.claim_date || '',
      'Claim Venue': o.claim_venue || '',
      'Order Date': new Date(o.created_at).toLocaleDateString(),
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders_export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': case 'ready': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const nextStatus: Record<string, OrderStatus> = {
    pending: 'confirmed',
    confirmed: 'ready',
    ready: 'completed',
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">Pre-Orders Management</h2>
        <Button variant="outline" onClick={exportOrders} disabled={orders.length === 0}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-card-foreground">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.profiles?.first_name} {order.profiles?.last_name}
                    {order.profiles?.student_id && <span className="ml-1">({order.profiles.student_id})</span>}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {order.order_items?.map((i: any, idx: number) => (
                      <span key={idx}>{i.merchandise_name} ×{i.quantity}{idx < order.order_items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-primary mt-1">₱{order.total_amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(order.status)}>{order.status}</Badge>
                  {nextStatus[order.status] && (
                    <Button size="sm" onClick={() => updateStatus(order.id, nextStatus[order.status])}>
                      Mark {nextStatus[order.status]}
                    </Button>
                  )}
                </div>
              </div>

              {/* Claim Info */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                {order.claim_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{order.claim_date}</span>}
                {order.claim_venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.claim_venue}</span>}
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => {
                  setEditingClaim(editingClaim === order.id ? null : order.id);
                  setClaimDate(order.claim_date || '');
                  setClaimVenue(order.claim_venue || '');
                }}>
                  {editingClaim === order.id ? 'Cancel' : 'Set Claim Details'}
                </Button>
              </div>

              {editingClaim === order.id && (
                <div className="flex items-end gap-2 flex-wrap bg-muted/50 p-3 rounded-lg">
                  <div>
                    <label className="text-xs font-medium text-card-foreground">Claim Date</label>
                    <input type="date" value={claimDate} onChange={e => setClaimDate(e.target.value)} className="login-input text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-card-foreground">Claim Venue</label>
                    <input type="text" value={claimVenue} onChange={e => setClaimVenue(e.target.value)} placeholder="e.g. CSC Office, Gym" className="login-input text-sm mt-1" />
                  </div>
                  <Button size="sm" onClick={() => saveClaim(order.id)}>Save</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center text-muted-foreground py-10">No orders found</p>}
      </div>
    </div>
  );
};

export default StaffOrders;
