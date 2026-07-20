"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBase } from '../../lib/api';

type Overview = {
  summary: {
    orders: number;
    bookings: number;
    revenue: number;
    pendingOrders: number;
  };
  recentOrders: Array<{ id: string; customerName: string; status: string; total: number }>;
  recentBookings: Array<{ id: string; customerName: string; eventDate: string; status: string }>;
};

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await fetch(`${apiBase}/api/admin/overview`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || 'Unable to load overview');
        }
        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard');
      }
    };

    loadOverview();
  }, []);

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h1 className="section-title">Admin dashboard</h1>
          <p className="section-copy">Monitor orders, bookings, and business totals from one control room.</p>
        </div>
        <Link className="button-secondary" href="/auth">Login</Link>
      </div>

      {error ? <div className="message error">{error}</div> : null}

      {data ? (
        <>
          <div className="metrics-grid" style={{ marginBottom: 18 }}>
            <div className="metric-card"><strong>{data.summary.orders}</strong><span className="muted">orders</span></div>
            <div className="metric-card"><strong>{data.summary.bookings}</strong><span className="muted">bookings</span></div>
            <div className="metric-card"><strong>₹{data.summary.revenue}</strong><span className="muted">revenue</span></div>
            <div className="metric-card"><strong>{data.summary.pendingOrders}</strong><span className="muted">pending orders</span></div>
          </div>

          <div className="admin-grid">
            <div className="admin-card">
              <h3>Recent orders</h3>
              {data.recentOrders.length === 0 ? <p className="muted">No orders yet.</p> : null}
              {data.recentOrders.map((order) => (
                <div key={order.id} className="admin-row">
                  <div>
                    <strong>{order.customerName}</strong>
                    <div className="muted">{order.status}</div>
                  </div>
                  <strong>₹{order.total}</strong>
                </div>
              ))}
            </div>

            <div className="admin-card">
              <h3>Recent bookings</h3>
              {data.recentBookings.length === 0 ? <p className="muted">No bookings yet.</p> : null}
              {data.recentBookings.map((booking) => (
                <div key={booking.id} className="admin-row">
                  <div>
                    <strong>{booking.customerName}</strong>
                    <div className="muted">{booking.eventDate}</div>
                  </div>
                  <strong>{booking.status}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
