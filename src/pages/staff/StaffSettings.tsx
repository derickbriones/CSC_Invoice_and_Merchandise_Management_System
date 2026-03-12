import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, QrCode, Trash2, Calendar, DollarSign, Save } from 'lucide-react';
import { toast } from 'sonner';

const StaffSettings = () => {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('system_settings').select('key, value');
      const settings = data || [];
      setQrCodeUrl(settings.find(s => s.key === 'payment_qr_code_url')?.value || null);
      setAcademicYear(settings.find(s => s.key === 'academic_year')?.value || '');
      setFeeAmount(settings.find(s => s.key === 'csc_fee_amount')?.value || '100');
    };
    fetch();
  }, []);

  const uploadQrCode = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `payment-qr-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('qr-codes').upload(filePath, file);
    if (uploadError) {
      toast.error('Failed to upload QR code');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(filePath);
    const url = urlData.publicUrl;

    await upsertSetting('payment_qr_code_url', url);
    setQrCodeUrl(url);
    toast.success('QR code updated!');
    setUploading(false);
  };

  const removeQrCode = async () => {
    await upsertSetting('payment_qr_code_url', null);
    setQrCodeUrl(null);
    toast.success('QR code removed');
  };

  const upsertSetting = async (key: string, value: string | null) => {
    // Try update first
    const { data } = await supabase.from('system_settings').select('id').eq('key', key).single();
    if (data) {
      await supabase.from('system_settings').update({ value, updated_by: user?.id, updated_at: new Date().toISOString() }).eq('key', key);
    } else {
      await supabase.from('system_settings').insert({ key, value, updated_by: user?.id });
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    await Promise.all([
      upsertSetting('academic_year', academicYear),
      upsertSetting('csc_fee_amount', feeAmount),
    ]);
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">Settings</h2>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" /> System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Current Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025-2026"
                className="login-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                CSC Fee Amount (₱)
              </label>
              <input
                type="number"
                value={feeAmount}
                onChange={e => setFeeAmount(e.target.value)}
                placeholder="100"
                className="login-input"
              />
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5" /> Payment QR Code
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a QR code that students will scan to pay CSC fees (GCash, Maya, etc.)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCodeUrl ? (
            <div className="text-center space-y-3">
              <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto max-w-[300px] rounded-lg border border-border" />
              <div className="flex items-center justify-center gap-2">
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" disabled={uploading} asChild>
                    <span><Upload className="w-4 h-4 mr-1" /> Replace</span>
                  </Button>
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadQrCode(e.target.files[0])} className="hidden" />
                </label>
                <Button variant="destructive" size="sm" onClick={removeQrCode}>
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <QrCode className="w-12 h-12 text-muted-foreground/30" />
              <span className="text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : 'Click to upload QR code image'}
              </span>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadQrCode(e.target.files[0])} className="hidden" disabled={uploading} />
            </label>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSettings;
