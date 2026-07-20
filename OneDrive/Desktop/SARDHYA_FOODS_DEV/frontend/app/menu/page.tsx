"use client";

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiBase } from '../../lib/api';

type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  serves: number;
};

type CartItem = MenuItem & { quantity: number };

const fallbackItems: MenuItem[] = [
  { id: '1', name: 'Grilled Paneer Bowl', category: 'Lunch', description: 'Smoked rice, paneer, vegetables, and coriander chutney.', price: 240, serves: 1 },
  { id: '2', name: 'Mini Idli Party Tray', category: 'Breakfast', description: 'Soft idlis with coconut chutney and sambar.', price: 180, serves: 2 },
  { id: '3', name: 'Festival Feast Pack', category: 'Catering', description: 'A large spread for celebrations and corporate lunches.', price: 1950, serves: 12 },
  { id: '4', name: 'Coconut Payasam', category: 'Dessert', description: 'Creamy payasam finished with roasted cashews.', price: 120, serves: 1 },
  { id: '5', name: 'Veg Kathi Roll Box', category: 'Snacks', description: 'Wrapped rolls with seasoned vegetables and sauce.', price: 160, serves: 1 },
  { id: '6', name: 'South Indian Thali', category: 'Lunch', description: 'Rice, curry, poriyal, chutney, and a sweet finish.', price: 280, serves: 1 },
  { id: '7', name: 'Masala Dosa Combo', category: 'Breakfast', description: 'Crispy dosa with potato masala, chutney, and sambar.', price: 210, serves: 1 },
  { id: '8', name: 'Hyderabadi Veg Biryani', category: 'Lunch', description: 'Fragrant biryani layered with saffron rice and vegetables.', price: 320, serves: 2 },
  { id: '9', name: 'Party Mini Samosa Platter', category: 'Snacks', description: 'Crispy samosas with mint chutney for events and breaks.', price: 140, serves: 2 },
  { id: '10', name: 'Chocolate Rava Cake', category: 'Dessert', description: 'Soft cake slice with a rich cocoa finish.', price: 150, serves: 1 },
  { id: '11', name: 'Corporate Lunch Box', category: 'Catering', description: 'Balanced lunch pack for office meetings and team events.', price: 390, serves: 1 },
  { id: '12', name: 'Family Feast Combo', category: 'Catering', description: 'Large meal combo designed for family gatherings.', price: 2250, serves: 8 }
];

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(fallbackItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('sardhya-foods-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart) as CartItem[]);
    }

    const loadMenu = async () => {
      try {
        const response = await fetch(`${apiBase}/api/menu`);
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        if (Array.isArray(payload.items) && payload.items.length > 0) {
          setItems(payload.items);
        }
      } catch {
        setStatus('Menu API not available yet, so seeded data is shown.');
      }
    };

    loadMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem('sardhya-foods-cart', JSON.stringify(cart));
  }, [cart]);

  const categories = useMemo(() => ['All', ...new Set(items.map((item) => item.category))], [items]);
  const visibleItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) => (
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        ));
      }
      return [...current, { ...item, quantity: 1 }];
    });
    setStatus(`${item.name} added to cart.`);
  };

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h1 className="section-title">Menu</h1>
          <p className="section-copy">Choose dishes, filter by category, and push them into the cart.</p>
        </div>
        <Link className="button" href="/cart">Review cart</Link>
      </div>

      <div className="pill-row">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {status ? <div className="message">{status}</div> : null}

      <div className="menu-grid" style={{ marginTop: 16 }}>
        {visibleItems.map((item) => (
          <article key={item.id} className="menu-card">
            <div className="menu-meta">
              <span className="badge">{item.category}</span>
              <span className="price">₹{item.price}</span>
            </div>
            <h3>{item.name}</h3>
            <p className="muted">{item.description}</p>
            <div className="menu-meta">
              <span className="muted">Serves {item.serves}</span>
              <button className="button-secondary" type="button" onClick={() => addToCart(item)}>
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
