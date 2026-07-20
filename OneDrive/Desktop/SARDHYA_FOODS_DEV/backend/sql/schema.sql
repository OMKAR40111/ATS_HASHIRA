CREATE DATABASE IF NOT EXISTS sardhya_foods;
USE sardhya_foods;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  serves INT NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
);

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
);

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  menu_item_id CHAR(36) NOT NULL,
  item_name VARCHAR(180) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

INSERT INTO users (id, name, email, password_hash, role)
VALUES ('admin-demo', 'Demo Admin', 'admin@sardhyafoods.com', SHA2('Admin123!', 256), 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role);

INSERT INTO menu_items (id, name, category, description, price, serves)
VALUES
  ('menu-1', 'Grilled Paneer Bowl', 'Lunch', 'Smoked rice, paneer, vegetables, and coriander chutney.', 240, 1),
  ('menu-2', 'Mini Idli Party Tray', 'Breakfast', 'Soft idlis with coconut chutney and sambar.', 180, 2),
  ('menu-3', 'Festival Feast Pack', 'Catering', 'A large spread for celebrations and corporate lunches.', 1950, 12),
  ('menu-4', 'Coconut Payasam', 'Dessert', 'Creamy payasam finished with roasted cashews.', 120, 1),
  ('menu-5', 'Veg Kathi Roll Box', 'Snacks', 'Wrapped rolls with seasoned vegetables and sauce.', 160, 1),
  ('menu-6', 'South Indian Thali', 'Lunch', 'Rice, curry, poriyal, chutney, and a sweet finish.', 280, 1),
  ('menu-7', 'Masala Dosa Combo', 'Breakfast', 'Crispy dosa with potato masala, chutney, and sambar.', 210, 1),
  ('menu-8', 'Hyderabadi Veg Biryani', 'Lunch', 'Fragrant biryani layered with saffron rice and vegetables.', 320, 2),
  ('menu-9', 'Party Mini Samosa Platter', 'Snacks', 'Crispy samosas with mint chutney for events and breaks.', 140, 2),
  ('menu-10', 'Chocolate Rava Cake', 'Dessert', 'Soft cake slice with a rich cocoa finish.', 150, 1),
  ('menu-11', 'Corporate Lunch Box', 'Catering', 'Balanced lunch pack for office meetings and team events.', 390, 1),
  ('menu-12', 'Family Feast Combo', 'Catering', 'Large meal combo designed for family gatherings.', 2250, 8)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  description = VALUES(description),
  price = VALUES(price),
  serves = VALUES(serves),
  is_active = 1;
