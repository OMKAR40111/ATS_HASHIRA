import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const databaseName = process.env.MYSQL_DATABASE || 'sardhya_foods';
const baseConnectionOptions = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || ''
};

const menuSeedItems = [
  {
    id: 'menu-1',
    name: 'Grilled Paneer Bowl',
    category: 'Lunch',
    description: 'Smoked rice, paneer, vegetables, and coriander chutney.',
    price: 240,
    serves: 1
  },
  {
    id: 'menu-2',
    name: 'Mini Idli Party Tray',
    category: 'Breakfast',
    description: 'Soft idlis with coconut chutney and sambar.',
    price: 180,
    serves: 2
  },
  {
    id: 'menu-3',
    name: 'Festival Feast Pack',
    category: 'Catering',
    description: 'A large spread for celebrations and corporate lunches.',
    price: 1950,
    serves: 12
  },
  {
    id: 'menu-4',
    name: 'Coconut Payasam',
    category: 'Dessert',
    description: 'Creamy payasam finished with roasted cashews.',
    price: 120,
    serves: 1
  },
  {
    id: 'menu-5',
    name: 'Veg Kathi Roll Box',
    category: 'Snacks',
    description: 'Wrapped rolls with seasoned vegetables and sauce.',
    price: 160,
    serves: 1
  },
  {
    id: 'menu-6',
    name: 'South Indian Thali',
    category: 'Lunch',
    description: 'Rice, curry, poriyal, chutney, and a sweet finish.',
    price: 280,
    serves: 1
  },
  {
    id: 'menu-7',
    name: 'Masala Dosa Combo',
    category: 'Breakfast',
    description: 'Crispy dosa with potato masala, chutney, and sambar.',
    price: 210,
    serves: 1
  },
  {
    id: 'menu-8',
    name: 'Hyderabadi Veg Biryani',
    category: 'Lunch',
    description: 'Fragrant biryani layered with saffron rice and vegetables.',
    price: 320,
    serves: 2
  },
  {
    id: 'menu-9',
    name: 'Party Mini Samosa Platter',
    category: 'Snacks',
    description: 'Crispy samosas with mint chutney for events and breaks.',
    price: 140,
    serves: 2
  },
  {
    id: 'menu-10',
    name: 'Chocolate Rava Cake',
    category: 'Dessert',
    description: 'Soft cake slice with a rich cocoa finish.',
    price: 150,
    serves: 1
  },
  {
    id: 'menu-11',
    name: 'Corporate Lunch Box',
    category: 'Catering',
    description: 'Balanced lunch pack for office meetings and team events.',
    price: 390,
    serves: 1
  },
  {
    id: 'menu-12',
    name: 'Family Feast Combo',
    category: 'Catering',
    description: 'Large meal combo designed for family gatherings.',
    price: 2250,
    serves: 8
  }
];

let pool;
let usingMemoryFallback = false;

const memory = {
  menuItems: menuSeedItems.map((item) => ({ ...item })),
  bookings: [],
  orders: [],
  users: [
    {
      id: 'admin-demo',
      name: 'Demo Admin',
      email: 'admin@sardhyafoods.com',
      passwordHash: passwordHash('Admin123!'),
      role: 'admin'
    }
  ]
};

function passwordHash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function getAdminConnection() {
  return mysql.createConnection(baseConnectionOptions);
}

export async function getPool() {
  if (pool) {
    return pool;
  }

  try {
    const adminConnection = await getAdminConnection();
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    await adminConnection.end();

    pool = mysql.createPool({
      ...baseConnectionOptions,
      database: databaseName,
      waitForConnections: true,
      connectionLimit: 10,
      decimalNumbers: true
    });

    usingMemoryFallback = false;
    return pool;
  } catch (error) {
    usingMemoryFallback = true;
    console.warn('MySQL unavailable, using in-memory fallback data.');
    console.warn(error instanceof Error ? error.message : error);
    return null;
  }
}

export async function initializeDatabase() {
  const activePool = await getPool();

  if (!activePool) {
    return;
  }

  await activePool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(40) NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await activePool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      category VARCHAR(80) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      serves INT NOT NULL DEFAULT 1,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await activePool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NULL,
      customer_name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      event_date DATE NOT NULL,
      guest_count INT NOT NULL,
      venue VARCHAR(180) NOT NULL,
      service_style VARCHAR(60) NOT NULL,
      notes TEXT,
      status VARCHAR(40) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await activePool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NULL,
      customer_name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      delivery_mode VARCHAR(40) NOT NULL,
      address TEXT,
      notes TEXT,
      subtotal DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await activePool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id CHAR(36) PRIMARY KEY,
      order_id CHAR(36) NOT NULL,
      menu_item_id CHAR(36) NOT NULL,
      item_name VARCHAR(180) NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
    )
  `);

  for (const item of menuSeedItems) {
    await activePool.query(
      `
        INSERT INTO menu_items (id, name, category, description, price, serves, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          category = VALUES(category),
          description = VALUES(description),
          price = VALUES(price),
          serves = VALUES(serves),
          is_active = VALUES(is_active)
      `,
      [item.id, item.name, item.category, item.description, item.price, item.serves]
    );
  }

  await activePool.query(
    `
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password_hash = VALUES(password_hash),
        role = VALUES(role)
    `,
    ['admin-demo', 'Demo Admin', 'admin@sardhyafoods.com', passwordHash('Admin123!'), 'admin']
  );
}

export function buildPasswordHash(password) {
  return passwordHash(password);
}

export function createId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

export function isUsingMemoryFallback() {
  return usingMemoryFallback || !pool;
}

export async function listMenuItems() {
  const activePool = await getPool();
  if (!activePool) {
    return cloneRows(memory.menuItems);
  }

  const [rows] = await activePool.query(
    'SELECT id, name, category, description, price, serves FROM menu_items WHERE is_active = 1 ORDER BY category, name'
  );
  return rows;
}

export async function listOrders() {
  const activePool = await getPool();
  if (!activePool) {
    return cloneRows(memory.orders);
  }

  const [orders] = await activePool.query(
    'SELECT id, customer_name AS customerName, email, phone, delivery_mode AS deliveryMode, address, notes, subtotal, total, status, created_at AS createdAt FROM orders ORDER BY created_at DESC'
  );

  if (orders.length === 0) {
    return [];
  }

  const [items] = await activePool.query(
    `
      SELECT order_id AS orderId, menu_item_id AS menuItemId, item_name AS name, unit_price AS price, quantity
      FROM order_items
      WHERE order_id IN (?)
    `,
    [orders.map((order) => order.id)]
  );

  const itemsByOrder = new Map();
  for (const item of items) {
    const existing = itemsByOrder.get(item.orderId) || [];
    existing.push({
      id: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    });
    itemsByOrder.set(item.orderId, existing);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) || []
  }));
}

export async function createOrder(input) {
  const resolvedItems = input.items.map((item) => {
    const menuItem = memory.menuItems.find((entry) => entry.id === item.id) || item;
    return {
      id: menuItem.id,
      name: menuItem.name,
      price: Number(menuItem.price),
      quantity: Number(item.quantity) || 1
    };
  });

  const subtotal = resolvedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + Math.round(subtotal * 0.08);
  const order = {
    id: createId('order'),
    ...input,
    items: resolvedItems,
    subtotal,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const activePool = await getPool();
  if (!activePool) {
    memory.orders.unshift(order);
    return order;
  }

  const connection = await activePool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `
        INSERT INTO orders (id, customer_name, email, phone, delivery_mode, address, notes, subtotal, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [order.id, input.customerName, input.email, input.phone, input.deliveryMode || 'pickup', input.address || '', input.notes || '', subtotal, total]
    );

    for (const item of resolvedItems) {
      await connection.query(
        `
          INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [createId('order-item'), order.id, item.id, item.name, item.price, item.quantity]
      );
    }

    await connection.commit();
    return order;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listBookings() {
  const activePool = await getPool();
  if (!activePool) {
    return cloneRows(memory.bookings);
  }

  const [rows] = await activePool.query(
    'SELECT id, customer_name AS customerName, email, phone, event_date AS eventDate, guest_count AS guestCount, venue, service_style AS serviceStyle, notes, status, created_at AS createdAt FROM bookings ORDER BY created_at DESC'
  );
  return rows;
}

export async function createBooking(input) {
  const booking = {
    id: createId('booking'),
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const activePool = await getPool();
  if (!activePool) {
    memory.bookings.unshift(booking);
    return booking;
  }

  await activePool.query(
    `
      INSERT INTO bookings (id, customer_name, email, phone, event_date, guest_count, venue, service_style, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [booking.id, input.customerName, input.email, input.phone, input.eventDate, Number(input.guestCount), input.venue, input.serviceStyle || 'drop-off', input.notes || '']
  );

  return booking;
}

export async function registerUser(input) {
  const user = {
    id: createId('user'),
    name: input.name || 'Customer',
    email: input.email,
    passwordHash: buildPasswordHash(input.password),
    role: 'customer'
  };

  const activePool = await getPool();
  if (!activePool) {
    memory.users.unshift(user);
    return user;
  }

  await activePool.query(
    `
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, 'customer')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password_hash = VALUES(password_hash)
    `,
    [user.id, user.name, user.email, user.passwordHash]
  );

  return user;
}

export async function authenticateUser(email, password) {
  const activePool = await getPool();
  const passwordHashValue = buildPasswordHash(password);

  if (!activePool) {
    return memory.users.find((user) => user.email === email && user.passwordHash === passwordHashValue) || null;
  }

  const [rows] = await activePool.query(
    'SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?',
    [email, passwordHashValue]
  );

  return rows[0] || null;
}

export async function getAdminOverview() {
  const activePool = await getPool();
  if (!activePool) {
    const revenue = memory.orders.reduce((total, order) => total + order.total, 0);
    return {
      summary: {
        orders: memory.orders.length,
        bookings: memory.bookings.length,
        revenue,
        pendingOrders: memory.orders.filter((order) => order.status === 'pending').length
      },
      recentOrders: memory.orders.slice(0, 5).map((order) => ({
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        total: order.total
      })),
      recentBookings: memory.bookings.slice(0, 5).map((booking) => ({
        id: booking.id,
        customerName: booking.customerName,
        eventDate: booking.eventDate,
        status: booking.status
      }))
    };
  }

  const [[orderSummary]] = await activePool.query(
    'SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue, SUM(CASE WHEN status = \'pending\' THEN 1 ELSE 0 END) AS pendingOrders FROM orders'
  );
  const [[bookingSummary]] = await activePool.query('SELECT COUNT(*) AS bookings FROM bookings');
  const [recentOrders] = await activePool.query(
    'SELECT id, customer_name AS customerName, status, total FROM orders ORDER BY created_at DESC LIMIT 5'
  );
  const [recentBookings] = await activePool.query(
    'SELECT id, customer_name AS customerName, event_date AS eventDate, status FROM bookings ORDER BY created_at DESC LIMIT 5'
  );

  return {
    summary: {
      orders: Number(orderSummary.orders || 0),
      bookings: Number(bookingSummary.bookings || 0),
      revenue: Number(orderSummary.revenue || 0),
      pendingOrders: Number(orderSummary.pendingOrders || 0)
    },
    recentOrders,
    recentBookings
  };
}