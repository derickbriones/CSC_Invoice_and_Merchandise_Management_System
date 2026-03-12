import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, Globe, Building2, FileText, Upload, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';
import { generatePdfReceipt } from '@/utils/generatePdfReceipt';

type PaymentMethod = Database['public']['Enums']['payment_method'];

const StudentPayFee = () => {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<Tables<'csc_fee_payments'>[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const currentYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [paymentsRes, settingsRes] = await Promise.all([
        supabase.from('csc_fee_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('system_settings').select('value').eq('key', 'payment_qr_code_url').single(),
      ]);
      setPayments(paymentsRes.data || []);
      setQrCodeUrl(settingsRes.data?.value || null);
    };
    fetchData();
  }, [user]);

  const submitPayment = async () => {
    if (!user || !selectedMethod) return;
    if ((selectedMethod === 'online' || selectedMethod === 'bank_transfer') && !proofFile) {
      toast.error('Please upload a screenshot of your payment proof');
      return;
    }

    setSubmitting(true);
    let proofUrl: string | null = null;

    if (proofFile) {
      const fileExt = proofFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proofFile);
      if (uploadError) {
        toast.error('Failed to upload proof');
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(filePath);
      proofUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('csc_fee_payments').insert({
      user_id: user.id,
      academic_year: currentYear,
      amount: 100.00,
      payment_method: selectedMethod,
      reference_number: refNumber || null,
      payment_proof_url: proofUrl,
      payment_status: 'pending',
    });

    if (error) {
      toast.error('Failed to submit payment');
    } else {
      toast.success(
        selectedMethod === 'cash'
          ? 'Cash payment submitted! Please go to the CSC office. Your receipt will be available once verified.'
          : 'Payment submitted with proof! Awaiting CSC staff verification.'
      );
      setSelectedMethod(null);
      setRefNumber('');
      setProofFile(null);
      const { data } = await supabase.from('csc_fee_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setPayments(data || []);
    }
    setSubmitting(false);
  };

  const printReceipt = (p: Tables<'csc_fee_payments'>) => {
    generatePdfReceipt({
      receiptNumber: p.receipt_number || 'N/A',
      date: new Date(p.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      studentName: `${profile?.first_name} ${profile?.last_name}`,
      studentId: profile?.student_id || undefined,
      course: profile?.course || undefined,
      yearLevel: profile?.year_level || undefined,
      type: 'csc_fee',
      academicYear: p.academic_year,
      amount: p.amount,
      paymentMethod: p.payment_method,
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const methods = [
    { key: 'cash' as PaymentMethod, icon: Banknote, label: 'Cash', desc: 'Pay at CSC office' },
    { key: 'online' as PaymentMethod, icon: Globe, label: 'Online Payment', desc: 'GCash / Maya' },
    { key: 'bank_transfer' as PaymentMethod, icon: Building2, label: 'Bank Transfer', desc: 'Upload reference' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">Pay CSC Fee</h2>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSC Fee for A.Y. {currentYear}</CardTitle>
          <p className="text-sm text-muted-foreground">Amount: ₱100.00</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium text-card-foreground mb-3">Scan QR Code to Pay</p>
              <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto max-w-[250px] rounded-lg border border-border" />
              <p className="text-xs text-muted-foreground mt-2">After payment, upload your screenshot below</p>
            </div>
          )}

          <p className="text-sm font-medium text-card-foreground">Select Payment Method:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {methods.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMethod(m.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMethod === m.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <m.icon className={`w-6 h-6 mb-2 ${selectedMethod === m.key ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium text-sm text-card-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </button>
            ))}
          </div>

          {selectedMethod && selectedMethod !== 'cash' && (
            <>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Reference Number (optional)
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="Enter reference/transaction number"
                  className="login-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Upload Payment Proof (Screenshot) *
                </label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {proofFile ? proofFile.name : 'Click to upload screenshot'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {proofFile && (
                  <img
                    src={URL.createObjectURL(proofFile)}
                    alt="Preview"
                    className="mt-2 max-h-40 rounded-lg border border-border"
                  />
                )}
              </div>
            </>
          )}

          {selectedMethod === 'cash' && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 Please visit the CSC office to make your cash payment. Once verified by CSC staff, your digital receipt will be available here.
              </p>
            </div>
          )}

          {selectedMethod && (
            <Button onClick={submitPayment} disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payment History & Receipts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" /> Payment History & Receipts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">A.Y. {p.academic_year}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.payment_method.replace('_', ' ')} • ₱{p.amount.toFixed(2)}</p>
                    {p.receipt_number && (
                      <p className="text-xs text-primary font-mono mt-1">Receipt: {p.receipt_number}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(p.payment_status)}>{p.payment_status}</Badge>
                    {p.payment_status === 'approved' && p.receipt_number && (
                      <Button size="sm" variant="outline" onClick={() => printReceipt(p)}>
                        <Printer className="w-4 h-4 mr-1" /> Print
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPayFee;
