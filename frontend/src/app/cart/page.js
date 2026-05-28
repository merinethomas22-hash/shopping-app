'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  }, []);

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.qty || 1)), 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--secondary)', borderRadius: '1rem' }}>
          <h3>Your cart is empty</h3>
          <Link href="/products"><button className="btn" style={{ marginTop: '1rem' }}>Go Shopping</button></Link>
        </div>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--secondary)', marginBottom: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '0.25rem' }} />}
                <h4>{item.name}</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span>₹{item.price} x {item.qty || 1}</span>
                <button onClick={() => removeFromCart(item.id)} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>Remove</button>
              </div>
            </div>
          ))}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1.5rem', background: 'var(--secondary)', borderRadius: '0.5rem' }}>
            <h2>Total: ₹{total.toFixed(2)}</h2>
            <Link href="/checkout"><button className="btn btn-accent" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>Proceed to Checkout</button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
