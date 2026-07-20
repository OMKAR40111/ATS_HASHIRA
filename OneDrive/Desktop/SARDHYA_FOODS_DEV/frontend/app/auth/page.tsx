"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiBase } from '../../lib/api';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      const response = await fetch(`${apiBase}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Authentication failed');
      }

      localStorage.setItem('sardhya-foods-auth', JSON.stringify(payload));
      setStatus(`${mode === 'login' ? 'Logged in' : 'Account created'} for ${payload.user.email}.`);
      if (mode === 'register') {
        setMode('login');
      }
      setForm({ name: '', email: '', password: '' });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h1 className="section-title">Authentication</h1>
          <p className="section-copy">Login and registration screens for future user and admin flows.</p>
        </div>
        <div className="pill-row" style={{ margin: 0 }}>
          <button type="button" className={`pill ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={`pill ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={submitAuth}>
          <div className="form-grid">
            {mode === 'register' ? (
              <div className="field full">
                <label htmlFor="name">Name</label>
                <input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </div>
          </div>

          <button className="button" type="submit" style={{ marginTop: 14 }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {status ? <div className="message">{status}</div> : null}
        {error ? <div className="message error">{error}</div> : null}
      </div>
    </section>
  );
}
