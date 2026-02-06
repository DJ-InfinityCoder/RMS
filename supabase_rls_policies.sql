-- Enable Row Level Security (RLS) on all tables (IMPORTANT for security)
-- This assumes the tables are already created via Prisma Migrate

-- 1. Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- 2. User Food Preferences
ALTER TABLE user_food_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_food_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- 3. Restaurants
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Public read access for restaurants
CREATE POLICY "Public read access for restaurants" ON restaurants
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins (or specific owners in future) can insert/update/delete restaurants
-- For now, we might want to restrict this to service_role or specific admin users.
-- Assuming a claiming system in future, for now let's keep it restricted.
-- If you want 'RESTAURANT_ADMIN' role to edit, you'd need a check like:
-- USING ( EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'RESTAURANT_ADMIN') )
-- But since restaurant ownership isn't directly linked to user yet in schema (restaurant_id on user?),
-- we'll rely on service_role for creating restaurants for now or strict admin check if you add `owner_id` to restaurant.

-- 4. Restaurant QR Codes
ALTER TABLE restaurant_qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read qr codes" ON restaurant_qr_codes FOR SELECT USING (true);

-- 5. Dishes
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dishes" ON dishes FOR SELECT USING (true);
-- Write access restricted (similar to Restaurants)

-- 6. Ingredients
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ingredients" ON ingredients FOR SELECT USING (true);

-- 7. Dish Ingredients
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dish ingredients" ON dish_ingredients FOR SELECT USING (true);

-- 8. Offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read offers" ON offers FOR SELECT USING (true);

-- 9. Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own order items (via order)
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Users can create order items for their own orders
CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- 11. Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read reviews
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- Users can create/edit own reviews
CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL
  USING (auth.uid() = user_id);
