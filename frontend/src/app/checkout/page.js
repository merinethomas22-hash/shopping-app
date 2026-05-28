'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/api';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Credit Card');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Dummy Card States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    if (items.length === 0) {
      router.push('/cart');
    }
    setCartItems(items);
  }, [router]);

  const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.qty || 1)), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // Simulate Payment Processing
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to place an order');
        }

        const orderData = {
          orderItems: cartItems.map(item => ({ productId: item.id, name: item.name, price: item.price, qty: item.qty || 1 })),
          shippingAddress: address,
          paymentMethod: payment,
          totalPrice: total,
        };

        await createOrder(orderData, token);
        setSuccess(true);
        localStorage.removeItem('cart');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err) {
        setError(err.message);
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h1 style={{ color: '#10b981', marginBottom: '1rem' }}>Order Placed Successfully!</h1>
        <p>Thank you for shopping with BabyPro. Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>
      
      {error && <p style={{ color: 'var(--accent)', marginBottom: '1rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '0.5rem' }}>{error}</p>}
      {processing && <p style={{ color: '#38bdf8', marginBottom: '1rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>🔄 Processing Payment Securely... Please Wait.</p>}
 
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: '1rem' }}>
          <h3>Shipping & Payment</h3>
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <textarea 
              placeholder="Shipping Address" 
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              rows="3"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white' }}
            />
            <select 
              value={payment}
              onChange={e => setPayment(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white' }}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
            </select>

            {payment === 'Credit Card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', marginTop: '0.5rem' }}>
                <h4 style={{ color: 'var(--accent)' }}>Card Details (Simulated)</h4>
                <input 
                  type="text" 
                  placeholder="Cardholder Name" 
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white' }}
                />
                <input 
                  type="text" 
                  placeholder="Card Number (16-digits)" 
                  maxLength="16"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    maxLength="5"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    required
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white' }}
                  />
                  <input 
                    type="password" 
                    placeholder="CVV" 
                    maxLength="3"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white' }}
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={processing} className="btn btn-accent" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem', opacity: processing ? 0.6 : 1, cursor: processing ? 'not-allowed' : 'pointer' }}>
              {processing ? 'Processing...' : `Pay & Place Order (₹${total.toFixed(2)})`}
            </button>
          </form>
        </div>
 
        <div style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: '1rem' }}>
          <h3>Order Summary</h3>
          <div style={{ marginTop: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span>{item.name} (x{item.qty || 1})</span>
                <span>₹{(parseFloat(item.price) * (item.qty || 1)).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
