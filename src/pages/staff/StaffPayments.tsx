import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Image, Download } from 'lucide-react';
import { toast } from 'sonner';

const StaffPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  const fetchPayments = async () => {
    const { data } = await supabase
      .from('csc_fee_payments')
      .select('*, profiles!csc_fee_payments_user_id_fkey(first_name, last_name, student_id, course, year_level)')
      .order('created_at', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const updates: any = {
      payment_status: status,
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      const { data: receiptNum } = await supabase.rpc('generate_receipt_number');
      updates.receipt_number = receiptNum;
    }

    const { error } = await supabase.from('csc_fee_payments').update(updates).eq('id', id);
    if (error) {
      toast.error('Failed to update payment');
    } else {
      toast.success(`Payment ${status}`);
      fetchPayments();
    }
  };

  const exportPayments = () => {
    const rows = payments.map(p => ({
      'Student Name': `${p.profiles?.first_name} ${p.profiles?.last_name}`,
      'Student ID': p.profiles?.student_id || '',
      'Course': p.profiles?.course || '',
      'Year Level': p.profiles?.year_level || '',
      'Academic Year': p.academic_year,
      'Amount': p.amount,
      'Payment Method': p.payment_method,
      'Status': p.payment_status,
      'Receipt Number': p.receipt_number || '',
      'Reference Number': p.reference_number || '',
      'Date': new Date(p.created_at).toLocaleDateString(),
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fee_payments_export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">Fee Payments</h2>
        <Button variant="outline" onClick={exportPayments} disabled={payments.length === 0}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Proof Image Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setViewingProof(null)}>
          <img src={viewingProof} alt="Payment Proof" className="max-w-full max-h-[80vh] rounded-lg" />
        </div>
      )}

      <div className="space-y-3">
        {payments.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-card-foreground">
                    {p.profiles?.first_name} {p.profiles?.last_name}
                    {p.profiles?.student_id && <span className="text-muted-foreground text-xs ml-2">({p.profiles.student_id})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.profiles?.course && `${p.profiles.course} • `}
                    {p.profiles?.year_level && `Year ${p.profiles.year_level} • `}
                    A.Y. {p.academic_year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.payment_method.replace('_', ' ')} • ₱{p.amount.toFixed(2)}
                  </p>
                  {p.reference_number && (
                    <p className="text-xs text-muted-foreground">Ref: {p.reference_number}</p>
                  )}
                  {p.receipt_number && (
                    <p className="text-xs text-primary font-mono">Receipt: {p.receipt_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {p.payment_proof_url && (
                    <Button size="sm" variant="outline" onClick={() => setViewingProof(p.payment_proof_url)}>
                      <Image className="w-4 h-4 mr-1" /> View Proof
                    </Button>
                  )}
                  <Badge className={statusColor(p.payment_status)}>{p.payment_status}</Badge>
                  {p.payment_status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleAction(p.id, 'approved')}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(p.id, 'rejected')}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {payments.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No payments found</p>
        )}
      </div>
    </div>
  );
};

export default StaffPayments;
