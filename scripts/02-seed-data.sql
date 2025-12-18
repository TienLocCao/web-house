-- Insert categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Sofas & Couches', 'sofas-couches', 'Comfortable and stylish seating for your living space', '/placeholder.svg?height=400&width=600'),
('Dining Tables', 'dining-tables', 'Beautiful dining tables for family gatherings', '/placeholder.svg?height=400&width=600'),
('Beds & Mattresses', 'beds-mattresses', 'Quality beds for a perfect night sleep', '/placeholder.svg?height=400&width=600'),
('Chairs', 'chairs', 'Elegant chairs for every room', '/placeholder.svg?height=400&width=600'),
('Storage & Cabinets', 'storage-cabinets', 'Organize your space with style', '/placeholder.svg?height=400&width=600'),
('Lighting', 'lighting', 'Illuminate your home beautifully', '/placeholder.svg?height=400&width=600');

-- Insert products
INSERT INTO products (name, slug, description, price, original_price, category_id, room_type, image_url, stock, is_featured, dimensions, material, color, rating, review_count) VALUES
-- Living Room Products
('Modern Velvet Sofa', 'modern-velvet-sofa', 'Luxurious 3-seater velvet sofa with deep cushioning and solid wood legs. Perfect for contemporary living spaces.', 1299.99, 1599.99, 1, 'living_room', '/placeholder.svg?height=600&width=800', 15, true, '{"width": "220cm", "height": "85cm", "depth": "95cm"}', 'Velvet, Solid Wood', 'Gray', 4.8, 124),
('Scandinavian Coffee Table', 'scandinavian-coffee-table', 'Minimalist oak coffee table with clean lines and natural finish', 459.99, 599.99, 5, 'living_room', '/placeholder.svg?height=600&width=800', 28, true, '{"width": "120cm", "height": "45cm", "depth": "60cm"}', 'Oak Wood', 'Natural Oak', 4.7, 89),
('Contemporary Floor Lamp', 'contemporary-floor-lamp', 'Elegant arc floor lamp with marble base and adjustable head', 299.99, 399.99, 6, 'living_room', '/placeholder.svg?height=600&width=800', 42, false, '{"height": "180cm", "base": "30cm"}', 'Metal, Marble', 'Black & Gold', 4.6, 67),

-- Dining Room Products
('Elegant Dining Table Set', 'elegant-dining-table-set', 'Sophisticated 6-seater dining table with matching chairs. Solid walnut construction.', 2199.99, 2799.99, 2, 'dining_room', '/placeholder.svg?height=600&width=800', 8, true, '{"width": "180cm", "height": "75cm", "depth": "90cm"}', 'Walnut Wood', 'Dark Walnut', 4.9, 156),
('Modern Dining Chairs (Set of 4)', 'modern-dining-chairs', 'Comfortable upholstered dining chairs with ergonomic design', 599.99, 799.99, 4, 'dining_room', '/placeholder.svg?height=600&width=800', 32, false, '{"width": "45cm", "height": "95cm", "depth": "55cm"}', 'Fabric, Metal', 'Beige', 4.5, 78),
('Crystal Chandelier', 'crystal-chandelier', 'Stunning 8-light crystal chandelier for elegant dining spaces', 899.99, 1199.99, 6, 'dining_room', '/placeholder.svg?height=600&width=800', 12, true, '{"diameter": "70cm", "height": "60cm"}', 'Crystal, Metal', 'Chrome', 4.8, 93),

-- Bedroom Products
('King Size Platform Bed', 'king-platform-bed', 'Contemporary platform bed with upholstered headboard and storage drawers', 1599.99, 1999.99, 3, 'bedroom', '/placeholder.svg?height=600&width=800', 18, true, '{"width": "200cm", "height": "120cm", "depth": "220cm"}', 'Fabric, Plywood', 'Charcoal Gray', 4.7, 142),
('Wooden Nightstand', 'wooden-nightstand', 'Elegant nightstand with two drawers and USB charging ports', 289.99, 349.99, 5, 'bedroom', '/placeholder.svg?height=600&width=800', 45, false, '{"width": "50cm", "height": "55cm", "depth": "40cm"}', 'Oak Wood', 'Light Oak', 4.6, 87),
('Table Lamp Set', 'table-lamp-set', 'Pair of modern table lamps with fabric shades', 159.99, 199.99, 6, 'bedroom', '/placeholder.svg?height=600&width=800', 56, false, '{"height": "45cm", "base": "15cm"}', 'Ceramic, Fabric', 'White & Brass', 4.5, 103),

-- Office Products
('Executive Office Chair', 'executive-office-chair', 'Ergonomic leather office chair with lumbar support and adjustable height', 699.99, 899.99, 4, 'office', '/placeholder.svg?height=600&width=800', 25, true, '{"width": "65cm", "height": "120cm", "depth": "60cm"}', 'Leather, Metal', 'Black', 4.8, 201),
('Modern Writing Desk', 'modern-writing-desk', 'Sleek desk with built-in cable management and storage drawer', 549.99, 699.99, 5, 'office', '/placeholder.svg?height=600&width=800', 19, false, '{"width": "140cm", "height": "75cm", "depth": "70cm"}', 'Wood, Metal', 'Walnut & Black', 4.7, 112);

-- Insert projects
INSERT INTO projects (title, slug, description, client_name, location, image_url, room_type, status, completion_date, featured) VALUES
('Modern Minimalist Living Room', 'modern-minimalist-living', 'Complete living room transformation featuring custom furniture and neutral color palette with pops of warmth.', 'Sarah Johnson', 'New York, NY', '/images/img-4706.jpeg', 'living_room', 'completed', '2024-09-15', true),
('Elegant Dining Space', 'elegant-dining-space', 'Sophisticated dining room design with custom walnut table and statement chandelier.', 'Michael Chen', 'San Francisco, CA', '/placeholder.svg?height=800&width=1200', 'dining_room', 'completed', '2024-08-22', true),
('Luxury Master Bedroom', 'luxury-master-bedroom', 'Serene bedroom retreat with custom upholstered bed and built-in storage solutions.', 'Emily Rodriguez', 'Los Angeles, CA', '/placeholder.svg?height=800&width=1200', 'bedroom', 'completed', '2024-10-05', true),
('Contemporary Home Office', 'contemporary-home-office', 'Functional and stylish workspace with custom shelving and ergonomic furniture.', 'David Park', 'Seattle, WA', '/placeholder.svg?height=800&width=1200', 'office', 'completed', '2024-07-18', false),
('Scandinavian Kitchen', 'scandinavian-kitchen', 'Light and airy kitchen with clean lines and natural materials throughout.', 'Lisa Anderson', 'Portland, OR', '/placeholder.svg?height=800&width=1200', 'kitchen', 'completed', '2024-11-02', true),
('Boutique Hotel Lobby', 'boutique-hotel-lobby', 'Welcoming hotel lobby with custom seating and artistic lighting fixtures.', 'Grand Hotel Group', 'Miami, FL', '/placeholder.svg?height=800&width=1200', 'living_room', 'in_progress', NULL, false);

-- Insert sample reviews
INSERT INTO reviews (product_id, customer_name, email, rating, title, comment, is_verified, is_approved) VALUES
(1, 'Jennifer Smith', 'jennifer.s@example.com', 5, 'Absolutely stunning!', 'This sofa exceeded all my expectations. The velvet is so soft and the construction is solid. Worth every penny!', true, true),
(1, 'Robert Brown', 'robert.b@example.com', 5, 'Best purchase ever', 'Comfortable, stylish, and well-made. The delivery was smooth and assembly was easy.', true, true),
(1, 'Amanda Lee', 'amanda.l@example.com', 4, 'Great sofa, minor issue', 'Love the sofa overall but one of the cushions was slightly uneven. Customer service resolved it quickly though.', true, true),
(4, 'Thomas Wilson', 'thomas.w@example.com', 5, 'Perfect for our dining room', 'The table is beautiful and the chairs are very comfortable. Our family dinners are so much more enjoyable now.', true, true),
(4, 'Maria Garcia', 'maria.g@example.com', 5, 'Excellent quality', 'Solid construction and gorgeous finish. This set will last us for years.', true, true),
(7, 'James Taylor', 'james.t@example.com', 5, 'Dream bed!', 'This bed transformed our bedroom. The storage drawers are a game-changer and it looks amazing.', true, true),
(10, 'Patricia Martinez', 'patricia.m@example.com', 5, 'Office chair perfection', 'My back pain is gone since I started using this chair. Highly recommend for anyone working from home.', true, true);
