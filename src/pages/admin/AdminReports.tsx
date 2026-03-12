import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const AdminReports = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [p, o] = await Promise.all([
        supabase.from('csc_fee_payments').select('*, profiles!csc_fee_payments_user_id_fkey(first_name, last_name, student_id)').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, profiles!orders_user_id_fkey(first_name, last_name), order_items(merchandise_name, quantity, unit_price)').order('created_at', { ascending: false }),
      ]);
      setPayments(p.data || []);
      setOrders(o.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredPayments = academicYearFilter
    ? payments.filter(p => p.academic_year.includes(academicYearFilter))
    : payments;

  const approvedPayments = filteredPayments.filter(p => p.payment_status === 'approved');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalFeeRevenue = approvedPayments.reduce((s, p) => s + p.amount, 0);
  const totalMerchRevenue = completedOrders.reduce((s, o) => s + o.total_amount, 0);

  const downloadCSV = (data: Record<string, any>[], filename: string) => {
    if (data.length === 0) { toast.error('No data to export'); return; }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename}.csv downloaded`);
  };

  const downloadPayments = () => {
    downloadCSV(filteredPayments.map(p => ({
      'Student Name': `${p.profiles?.first_name} ${p.profiles?.last_name}`,
      'Student ID': p.profiles?.student_id || '',
      'Academic Year': p.academic_year,
      'Amount': p.amount,
      'Payment Method': p.payment_method,
      'Status': p.payment_status,
      'Receipt Number': p.receipt_number || '',
      'Date': new Date(p.created_at).toLocaleDateString(),
    })), 'fee_payments_report');
  };

  const downloadOrders = () => {
    downloadCSV(orders.map(o => ({
      'Order Number': o.order_number,
      'Customer': `${o.profiles?.first_name} ${o.profiles?.last_name}`,
      'Items': o.order_items?.map((i: any) => `${i.merchandise_name}x${i.quantity}`).join('; '),
      'Total': o.total_amount,
      'Status': o.status,
      'Date': new Date(o.created_at).toLocaleDateString(),
    })), 'orders_report');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">Reports & Analytics</h2>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fee Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">₱{totalFeeRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{approvedPayments.length} approved payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Merchandise Revenue</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">₱{totalMerchRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{completedOrders.length} completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">₱{(totalFeeRevenue + totalMerchRevenue).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Payments Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" /> Fee Payments Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by A.Y. (e.g. 2025)"
                  value={academicYearFilter}
                  onChange={e => setAcademicYearFilter(e.target.value)}
                  className="login-input w-48 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={downloadPayments}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>A.Y.</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.slice(0, 50).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.profiles?.first_name} {p.profiles?.last_name}</TableCell>
                  <TableCell>{p.academic_year}</TableCell>
                  <TableCell>₱{p.amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{p.payment_method.replace('_', ' ')}</TableCell>
                  <TableCell><Badge className={statusColor(p.payment_status)}>{p.payment_status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{p.receipt_number || '-'}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">No payment records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Orders Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" /> Orders Report
            </CardTitle>
            <Button variant="outline" size="sm" onClick={downloadOrders}>
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 50).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                  <TableCell>{o.profiles?.first_name} {o.profiles?.last_name}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {o.order_items?.map((i: any) => `${i.merchandise_name} ×${i.quantity}`).join(', ')}
                  </TableCell>
                  <TableCell>₱{o.total_amount.toFixed(2)}</TableCell>
                  <TableCell><Badge className={statusColor(o.status)}>{o.status}</Badge></TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No orders found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
