USE sardhya_foods;

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
ON DUPLICATE KEY UPDATE name = VALUES(name);
