-- Insert sample categories
INSERT INTO categories (name, description, icon, color, display_order) VALUES
('School Uniforms', 'School uniforms for various schools', 'shirt', '#3b82f6', 1),
('Stationery', 'Pens, pencils, and other stationery items', 'pencil', '#10b981', 2),
('Office Supplies', 'Office supplies for businesses and schools', 'briefcase', '#f59e0b', 3),
('Electronics', 'Calculators and other electronic devices', 'calculator', '#6366f1', 4);

-- Insert sample products
INSERT INTO products (name, description, category_id, image_url, active, featured, special) VALUES
('GIS Sky Blue Shirt', 'Short sleeve sky blue shirt for GIS', 
 (SELECT id FROM categories WHERE name = 'School Uniforms'), 
 'uniforms/shirt-ssleeve-gis-sky-blue.png', -- Use DB Ref path
 true, true, false),
 
('GIS Navy Jersey', 'Navy jersey with white stripes for GIS', 
 (SELECT id FROM categories WHERE name = 'School Uniforms'), 
 'uniforms/jersey-navy-white-stripes-gis-hs.png', -- Use DB Ref path
 true, false, false),
 
('GIS PE Shorts', 'Blue PE shorts with pipping for GIS', 
 (SELECT id FROM categories WHERE name = 'School Uniforms'), 
 'uniforms/gis-pe-shorts-blue-pipping.png', -- Use DB Ref path
 true, false, true),
 
('Northside Primary Bucket Hat', 'Bucket hat for Northside Primary School', 
 (SELECT id FROM categories WHERE name = 'School Uniforms'), 
 'uniforms/bucket-hat-northside-primary.png', -- Use DB Ref path
 true, false, false),
 
('BIC Cristal Blue Pen', 'Classic blue ballpoint pen', 
 (SELECT id FROM categories WHERE name = 'Stationery'), 
 'products/pen-bic-cristal-blue.png', -- Use DB Ref path
 true, true, false),
 
('Staedtler 24 Color Crayons', 'Set of 24 colored crayons', 
 (SELECT id FROM categories WHERE name = 'Stationery'), 
 'products/crayons-coloured-24s-staedtler.png', -- Use DB Ref path
 true, false, true),
 
('Pritt Glue Stick 43g', 'Adhesive glue stick for paper', 
 (SELECT id FROM categories WHERE name = 'Stationery'), 
 'products/glue-stick-pritt-43g.png', -- Use DB Ref path
 true, false, false),
 
('Clear Plastic Sheet Protectors', 'Pack of clear plastic sheet protectors', 
 (SELECT id FROM categories WHERE name = 'Office Supplies'), 
 'products/clear-plastic-sheet-protectors.png', -- Use DB Ref path
 true, false, false),
 
('Colorful Plastic Folders', 'Set of colorful plastic folders', 
 (SELECT id FROM categories WHERE name = 'Office Supplies'), 
 'products/colorful-plastic-folders-labeled.png', -- Use DB Ref path
 true, true, false),
 
('Casio FX-82MS Scientific Calculator', 'Scientific calculator for students', 
 (SELECT id FROM categories WHERE name = 'Electronics'), 
 'products/calculator-casio-fx-82ms-sc3-dh-scientific.png', -- Use DB Ref path
 true, false, true),
 
('Casio Desktop Calculator', 'Desktop calculator for office use', 
 (SELECT id FROM categories WHERE name = 'Electronics'), 
 'products/desktop-casio.png', -- Use DB Ref path
 true, false, false);

-- Insert sample product prices
INSERT INTO product_prices (product_id, tier_name, price, original_price) VALUES
-- GIS Sky Blue Shirt with size-based pricing
((SELECT id FROM products WHERE name = 'GIS Sky Blue Shirt'), 'Size 4', 149.99, NULL),
((SELECT id FROM products WHERE name = 'GIS Sky Blue Shirt'), 'Size 6', 159.99, NULL),
((SELECT id FROM products WHERE name = 'GIS Sky Blue Shirt'), 'Size 8', 169.99, NULL),
((SELECT id FROM products WHERE name = 'GIS Sky Blue Shirt'), 'Size 10', 179.99, NULL),

-- GIS Navy Jersey with size-based pricing
((SELECT id FROM products WHERE name = 'GIS Navy Jersey'), 'Size 4', 249.99, 279.99),
((SELECT id FROM products WHERE name = 'GIS Navy Jersey'), 'Size 6', 259.99, 289.99),
((SELECT id FROM products WHERE name = 'GIS Navy Jersey'), 'Size 8', 269.99, 299.99),
((SELECT id FROM products WHERE name = 'GIS Navy Jersey'), 'Size 10', 279.99, 309.99),

-- GIS PE Shorts with size-based pricing
((SELECT id FROM products WHERE name = 'GIS PE Shorts'), 'Size 4', 129.99, 149.99),
((SELECT id FROM products WHERE name = 'GIS PE Shorts'), 'Size 6', 139.99, 159.99),
((SELECT id FROM products WHERE name = 'GIS PE Shorts'), 'Size 8', 149.99, 169.99),
((SELECT id FROM products WHERE name = 'GIS PE Shorts'), 'Size 10', 159.99, 179.99),

-- Northside Primary Bucket Hat with size-based pricing
((SELECT id FROM products WHERE name = 'Northside Primary Bucket Hat'), 'Small', 89.99, NULL),
((SELECT id FROM products WHERE name = 'Northside Primary Bucket Hat'), 'Medium', 99.99, NULL),
((SELECT id FROM products WHERE name = 'Northside Primary Bucket Hat'), 'Large', 109.99, NULL),

-- Stationery items with single pricing
((SELECT id FROM products WHERE name = 'BIC Cristal Blue Pen'), NULL, 4.99, NULL),
((SELECT id FROM products WHERE name = 'Staedtler 24 Color Crayons'), NULL, 59.99, 79.99),
((SELECT id FROM products WHERE name = 'Pritt Glue Stick 43g'), NULL, 24.99, NULL),

-- Office supplies with single pricing
((SELECT id FROM products WHERE name = 'Clear Plastic Sheet Protectors'), NULL, 29.99, NULL),
((SELECT id FROM products WHERE name = 'Colorful Plastic Folders'), NULL, 19.99, NULL),

-- Electronics with single pricing
((SELECT id FROM products WHERE name = 'Casio FX-82MS Scientific Calculator'), NULL, 199.99, 249.99),
((SELECT id FROM products WHERE name = 'Casio Desktop Calculator'), NULL, 149.99, NULL);

-- Insert sample announcements
INSERT INTO announcements (title, content, type, active, start_date, end_date) VALUES
('Back to School Sale', 'Get up to 20% off on all school uniforms!', 'ticker', true, '2025-01-01', '2025-02-28'),
('New Stationery Arrivals', 'Check out our new stationery collection!', 'slide', true, '2025-01-15', '2025-03-15'),
('Holiday Hours', 'We will be closed on April 5th for Easter holiday.', 'popup', true, '2025-04-01', '2025-04-06');

-- Insert sample settings
INSERT INTO settings (key, value, description) VALUES
('display_settings', 
 '{"slideInterval": 8000, "showWeather": true, "defaultCity": "Gaborone", "showClock": true}', 
 'Settings for the display interface'),
('admin_settings', 
 '{"allowedIPs": ["127.0.0.1"], "sessionTimeout": 3600}', 
 'Settings for the admin interface');
