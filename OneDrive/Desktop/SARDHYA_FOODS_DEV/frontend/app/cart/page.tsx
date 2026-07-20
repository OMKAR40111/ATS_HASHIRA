"use client";

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiBase } from '../../lib/api';

type CartItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('sardhya-foods-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sardhya-foods-cart', JSON.stringify(cart));
  }, [cart]);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.08) : 0;
  const total = subtotal + serviceFee;

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) => current
      .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
      .filter((item) => item.quantity > 0));
  };

  const removeItem = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const placeOrder = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const response = await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          deliveryMode,
          address,
          notes,
          items: cart
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to place order');
      }

      setStatus(`Order ${payload.order.id} placed successfully.`);
      setCart([]);
      setCustomerName('');
      setEmail('');
      setPhone('');
      setDeliveryMode('pickup');
      setAddress('');
      setNotes('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Order submission failed');
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h1 className="section-title">Cart and checkout</h1>
          <p className="section-copy">Review the order, adjust quantities, and send it to the backend.</p>
        </div>
        <Link className="button-secondary" href="/menu">Back to menu</Link>
      </div>

      <div className="layout-two-col">
        <div className="cart-card">
          <h3>Items</h3>
          {cart.length === 0 ? (
            <p className="muted">Your cart is empty. Add items from the menu first.</p>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <div className="muted">{item.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="qty-controls">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <div className="muted">₹{item.price * item.quantity}</div>
                  </div>
                  <button className="icon-button" type="button" onClick={() => removeItem(item.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-card">
          <h3>Summary</h3>
          <div className="menu-meta"><span>Subtotal</span><strong>₹{subtotal}</strong></div>
          <div className="menu-meta"><span>Service fee</span><strong>₹{serviceFee}</strong></div>
          <div className="menu-meta"><span>Total</span><strong>₹{total}</strong></div>

          <form onSubmit={placeOrder} style={{ marginTop: 18 }}>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="customerName">Customer name</label>
                <input id="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="deliveryMode">Delivery mode</label>
                <select id="deliveryMode" value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value)}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="event">Event setup</option>
                </select>
              </div>
              <div className="field full">
                <label htmlFor="address">Address or event location</label>
                <input id="address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Optional for pickup, required for delivery" />
              </div>
              <div className="field full">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Dietary notes, timing, service preferences" />
              </div>
            </div>

            <button className="button" type="submit" style={{ marginTop: 14 }} disabled={cart.length === 0}>
              Place order
            </button>
          </form>

          {status ? <div className="message">{status}</div> : null}
          {error ? <div className="message error">{error}</div> : null}
        </div>
      </div>
    </section>
  );
}
