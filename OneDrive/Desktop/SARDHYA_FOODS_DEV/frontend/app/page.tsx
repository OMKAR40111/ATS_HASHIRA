import Link from 'next/link';

const highlights = [
  {
    title: 'Order from a curated menu',
    text: 'Browse plated meals, snacks, desserts, and event-ready catering packages.'
  },
  {
    title: 'Book catering with confidence',
    text: 'Capture the date, guest count, venue, and service mode in one smooth flow.'
  },
  {
    title: 'Control everything from the admin view',
    text: 'Track orders, bookings, menu items, and the health of the business in one place.'
  }
];

const menuPreview = [
  { name: 'Grilled Paneer Bowl', category: 'Lunch', price: '₹240' },
  { name: 'Mini Idli Party Tray', category: 'Breakfast', price: '₹180' },
  { name: 'Coconut Payasam', category: 'Dessert', price: '₹120' },
  { name: 'Festival Feast Pack', category: 'Catering', price: '₹1,950' }
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-panel">
            <span className="eyebrow">Online food shopping and catering bookings</span>
            <h1>Food commerce built for catering teams.</h1>
            <p>
              This starter gives you a polished customer experience for browsing dishes,
              building a cart, placing orders, and booking catering services without losing
              sight of the admin side.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/menu">
                Explore menu
              </Link>
              <Link className="button-secondary" href="/cart">
                Open cart
              </Link>
              <Link className="button-ghost" href="/bookings">
                Book catering
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>4 flows</strong>
                <span className="muted">Menu, cart, booking, admin</span>
              </div>
              <div className="stat">
                <strong>1 API</strong>
                <span className="muted">Express backend endpoints</span>
              </div>
              <div className="stat">
                <strong>MySQL</strong>
                <span className="muted">Schema prepared for persistence</span>
              </div>
            </div>
          </div>

          <div className="hero-aside">
            <div className="glass-panel">
              <div className="callout">Designed to feel premium, warm, and easy to scan.</div>
              <div className="metrics-grid" style={{ marginTop: 14 }}>
                <div className="metric-card">
                  <strong>12+</strong>
                  <span className="muted">menu items seeded</span>
                </div>
                <div className="metric-card">
                  <strong>3</strong>
                  <span className="muted">service types</span>
                </div>
                <div className="metric-card">
                  <strong>100%</strong>
                  <span className="muted">frontend-ready scaffold</span>
                </div>
              </div>
            </div>

            <div className="glass-panel">
              <h3 className="section-title" style={{ fontSize: '1.7rem', margin: 0 }}>
                Featured dishes
              </h3>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {menuPreview.map((item) => (
                  <div key={item.name} className="list-row">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="muted">{item.category}</div>
                    </div>
                    <span className="price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">What this starter includes</h2>
            <p className="section-copy">
              The app is split into a clean customer frontend and a focused Express backend,
              so the project is ready for product work instead of only mockups.
            </p>
          </div>
        </div>
        <div className="feature-grid">
          {highlights.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="badge">Starter module</span>
              <h3>{feature.title}</h3>
              <p className="muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
