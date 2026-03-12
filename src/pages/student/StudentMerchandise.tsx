import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const StudentMerchandise = () => {
  const { user } = useAuth();
  const [merchandise, setMerchandise] = useState<Tables<'merchandise'>[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('merchandise').select('*').eq('is_available', true);
      setMerchandise(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const addToCart = async (item: Tables<'merchandise'>) => {
    if (!user) return;
    const size = item.sizes && item.sizes.length > 0 ? selectedSizes[item.id] : null;
    if (item.sizes && item.sizes.length > 0 && !size) {
      toast.error('Please select a size');
      return;
    }
    
    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      merchandise_id: item.id,
      quantity: 1,
      size,
    });
    
    if (error) {
      toast.error('Failed to add to cart');
    } else {
      toast.success(`${item.name} added to cart!`);
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">CSC Merchandise</h2>
        <p className="text-sm text-muted-foreground">All items are pre-order only. Add to cart and place your pre-order.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {merchandise.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-16 h-16 text-muted-foreground/30" />
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">PRE-ORDER</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-lg font-bold text-primary mt-1">₱{item.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Available stock: {item.stock_quantity}</p>
              </div>
              
              {item.sizes && item.sizes.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {item.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSizes(prev => ({ ...prev, [item.id]: size }))}
                      className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                        selectedSizes[item.id] === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              <Button onClick={() => addToCart(item)} className="w-full" size="sm" disabled={item.stock_quantity <= 0}>
                <ShoppingCart className="w-4 h-4 mr-1" /> {item.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
        {merchandise.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">No merchandise available</p>
        )}
      </div>
    </div>
  );
};

export default StudentMerchandise;
