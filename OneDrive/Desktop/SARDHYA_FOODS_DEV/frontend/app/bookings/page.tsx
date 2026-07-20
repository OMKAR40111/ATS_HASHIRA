"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { apiBase } from '../../lib/api';

export default function BookingsPage() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    venue: '',
    serviceStyle: 'drop-off',
    notes: ''
  });

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      const response = await fetch(`${apiBase}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to submit booking');
      }

      setStatus(`Booking request ${payload.booking.id} created.`);
      setForm({
        customerName: '',
        email: '',
        phone: '',
        eventDate: '',
        guestCount: '',
        venue: '',
        serviceStyle: 'drop-off',
        notes: ''
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Booking submission failed');
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h1 className="section-title">Catering booking</h1>
          <p className="section-copy">Capture event details before pushing the request to the backend.</p>
        </div>
        <Link className="button-secondary" href="/menu">View menu</Link>
      </div>

      <div className="form-card">
        <form onSubmit={submitBooking}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="bookingName">Customer name</label>
              <input id="bookingName" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="bookingEmail">Email</label>
              <input id="bookingEmail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="bookingPhone">Phone</label>
              <input id="bookingPhone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="eventDate">Event date</label>
              <input id="eventDate" type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="guestCount">Guest count</label>
              <input id="guestCount" type="number" min="1" value={form.guestCount} onChange={(event) => setForm({ ...form, guestCount: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="venue">Venue</label>
              <input id="venue" value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="serviceStyle">Service style</label>
              <select id="serviceStyle" value={form.serviceStyle} onChange={(event) => setForm({ ...form, serviceStyle: event.target.value })}>
                <option value="drop-off">Drop-off</option>
                <option value="buffet">Buffet</option>
                <option value="full-service">Full service</option>
              </select>
            </div>
            <div className="field full">
              <label htmlFor="bookingNotes">Notes</label>
              <textarea id="bookingNotes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </div>
          </div>

          <button className="button" type="submit" style={{ marginTop: 14 }}>Submit booking</button>
        </form>

        {status ? <div className="message">{status}</div> : null}
        {error ? <div className="message error">{error}</div> : null}
      </div>
    </section>
  );
}
