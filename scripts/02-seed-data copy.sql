INSERT INTO categories (name, slug, description, image_url) VALUES
('Sofa', 'sofa', 'Các loại sofa cao cấp', '/uploads/init.svg'),
('Bàn ăn', 'ban-an', 'Bàn ăn gia đình', '/uploads/init.svg'),
('Giường ngủ', 'giuong-ngu', 'Giường ngủ hiện đại', '/uploads/init.svg');

INSERT INTO products (
  name, slug, description, price, original_price,
  category_id, room_type, image_url, stock,
  is_featured, material, color
) VALUES
(
  'Sofa vải hiện đại',
  'sofa-vai-hien-dai',
  'Sofa vải phong cách Bắc Âu',
  15000000,
  18000000,
  1,
  'living_room',
  '/uploads/init.svg',
  10,
  TRUE,
  'Vải + khung gỗ',
  'Xám'
),
(
  'Bàn ăn gỗ sồi 6 ghế',
  'ban-an-go-soi-6-ghe',
  'Bàn ăn gỗ sồi tự nhiên',
  22000000,
  25000000,
  2,
  'dining_room',
  '/uploads/init.svg',
  5,
  FALSE,
  'Gỗ sồi',
  'Nâu'
);

INSERT INTO projects (
  title, slug, description, client_name,
  location, image_url, room_type, status, featured
) VALUES
(
  'Thiết kế căn hộ Vinhomes',
  'thiet-ke-can-ho-vinhomes',
  'Thiết kế nội thất căn hộ 2PN',
  'Anh Minh',
  'Hà Nội',
  '/uploads/init.svg',
  'living_room',
  'completed',
  TRUE
);

INSERT INTO reviews (
  product_id, customer_name, email,
  rating, title, comment, is_verified, is_approved
) VALUES
(
  1,
  'Nguyễn Văn A',
  'a@gmail.com',
  5,
  'Sản phẩm rất tốt',
  'Sofa đẹp, ngồi êm, giao hàng nhanh',
  TRUE,
  TRUE
);

INSERT INTO orders (
  order_number, customer_name, customer_email,
  shipping_address, total_amount, status, payment_method
) VALUES
(
  'ORD-0001',
  'Trần Thị B',
  'b@gmail.com',
  '{"address":"123 Nguyễn Trãi, Hà Nội"}',
  15000000,
  'processing',
  'COD'
);

INSERT INTO order_items (
  order_id, product_id, product_name,
  quantity, unit_price, total_price
) VALUES
(
  1,
  1,
  'Sofa vải hiện đại',
  1,
  15000000,
  15000000
);

INSERT INTO contact_inquiries (
  name, email, phone, subject, message
) VALUES
(
  'Lê Văn C',
  'c@gmail.com',
  '0901234567',
  'Tư vấn thiết kế',
  'Tôi muốn tư vấn thiết kế nội thất căn hộ 70m2'
);
