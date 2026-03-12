import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Package, EyeOff, Eye, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const StaffMerchandise = () => {
  const [items, setItems] = useState<Tables<'merchandise'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock_quantity: '', sizes: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showDisabled, setShowDisabled] = useState(true);

  const fetchItems = async () => {
    const { data } = await supabase.from('merchandise').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }

    let imageUrl: string | null = null;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('merchandise-images').upload(filePath, imageFile);
      if (uploadError) {
        toast.error('Failed to upload image');
        return;
      }
      const { data: urlData } = supabase.storage.from('merchandise-images').getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const payload: any = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category: form.category || null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()) : [],
      is_available: true,
    };
    if (imageUrl) payload.image_url = imageUrl;

    let error;
    if (editId) {
      ({ error } = await supabase.from('merchandise').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('merchandise').insert(payload));
    }

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success(editId ? 'Updated!' : 'Added!');
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', description: '', price: '', category: '', stock_quantity: '', sizes: '' });
      setImageFile(null);
      fetchItems();
    }
  };

  const startEdit = (item: Tables<'merchandise'>) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      stock_quantity: item.stock_quantity.toString(),
      sizes: item.sizes?.join(', ') || '',
    });
    setImageFile(null);
    setShowForm(true);
  };

  const toggleAvailability = async (item: Tables<'merchandise'>) => {
    const { error } = await supabase.from('merchandise').update({ is_available: !item.is_available }).eq('id', item.id);
    if (error) toast.error('Failed');
    else {
      toast.success(item.is_available ? 'Product disabled' : 'Product enabled');
      fetchItems();
    }
  };

  const displayedItems = showDisabled ? items : items.filter(i => i.is_available);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-card-foreground">Merchandise</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDisabled(!showDisabled)}>
            {showDisabled ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showDisabled ? 'Hide Disabled' : 'Show All'}
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', price: '', category: '', stock_quantity: '', sizes: '' }); setImageFile(null); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="login-input" />
            <input placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="login-input" />
            <input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="login-input" />
            <input placeholder="Stock Qty" type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} className="login-input" />
            <input placeholder="Sizes (comma separated)" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} className="login-input" />
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="login-input" />
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : 'Upload product image (optional)'}
                </span>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={handleSubmit}>{editId ? 'Update' : 'Add'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedItems.map((item) => (
          <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                    {!item.is_available && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">DISABLED</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-lg font-bold text-primary">₱{item.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Stock: {item.stock_quantity}</p>
                  {item.sizes && item.sizes.length > 0 && (
                    <p className="text-xs text-muted-foreground">Sizes: {item.sizes.join(', ')}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleAvailability(item)} title={item.is_available ? 'Disable' : 'Enable'}>
                    {item.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffMerchandise;
