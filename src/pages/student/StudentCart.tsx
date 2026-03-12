import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CartItemWithMerch {
  id: string;
  quantity: number;
  size: string | null;
  merchandise: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

const StudentCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithMerch[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cart_items')
      .select('id, quantity, size, merchandise(id, name, price, image_url)')
      .eq('user_id', user.id);
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeItem(id);
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Item removed');
  };

  const total = items.reduce((sum, i) => sum + i.merchandise.price * i.quantity, 0);

  const placeOrder = async () => {
    if (!user || items.length === 0) return;
    setOrdering(true);

    const { data: orderNum } = await supabase.rpc('generate_order_number');
    
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id,
      order_number: orderNum || `ORD-${Date.now()}`,
      total_amount: total,
      payment_method: 'cash' as const,
      payment_status: 'pending' as const,
      status: 'pending' as const,
    }).select().single();

    if (error || !order) {
      toast.error('Failed to place pre-order');
      setOrdering(false);
      return;
    }

    const orderItems = items.map(i => ({
      order_id: order.id,
      merchandise_id: i.merchandise.id,
      merchandise_name: i.merchandise.name,
      quantity: i.quantity,
      size: i.size,
      unit_price: i.merchandise.price,
    }));

    await supabase.from('order_items').insert(orderItems);
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
    setOrdering(false);
    toast.success('Pre-order placed successfully! Check "My Orders" for your receipt.');
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">Shopping Cart</h2>
        <p className="text-sm text-muted-foreground">Items will be pre-ordered. Claim details will be set by CSC staff.</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{item.merchandise.name}</p>
                    {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                    <p className="text-sm text-primary font-semibold">₱{item.merchandise.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 rounded border border-border hover:bg-muted">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 rounded border border-border hover:bg-muted">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-card-foreground">₱{total.toFixed(2)}</p>
              </div>
              <Button onClick={placeOrder} disabled={ordering} size="lg">
                {ordering ? 'Placing Pre-Order...' : 'Place Pre-Order'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentCart;
