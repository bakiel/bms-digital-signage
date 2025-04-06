-- SQL script to update product and announcement image URLs in Supabase
-- Run this in the Supabase SQL editor or via psql

BEGIN;

-- Update product images
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/uniforms/golf-shirt-gis-sky-blue.png' WHERE name ILIKE '%Sky Blue Golf Shirt%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/uniforms/shirt-ssleeve-gis-sky-blue.png' WHERE name ILIKE '%Short Sleeve Sky Blue Shirt%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/pen-bic-cristal-blue.png' WHERE name ILIKE '%BIC Cristal Blue Pen%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/back-to-school-sale.png' WHERE image_url LIKE '%back-to-school-sale.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/calculator-casio-fx-82ms-sc3-dh-scientific.png' WHERE image_url LIKE '%calculator-casio-fx-82ms-sc3-dh-scientific.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/clear-plastic-sheet-protectors.png' WHERE image_url LIKE '%clear-plastic-sheet-protectors.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/colorful-plastic-folders-labeled.png' WHERE image_url LIKE '%colorful-plastic-folders-labeled.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/crayons-coloured-24s-staedtler.png' WHERE image_url LIKE '%crayons-coloured-24s-staedtler.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/desktop-casio.png' WHERE image_url LIKE '%desktop-casio.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/duracell-aaa-batteries-pack.png' WHERE image_url LIKE '%duracell-aaa-batteries-pack.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/duracell-cr2016-battery-pack.png' WHERE image_url LIKE '%duracell-cr2016-battery-pack.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/duracell-dl-cr2016-batteries-pack.png' WHERE image_url LIKE '%duracell-dl-cr2016-batteries-pack.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/exam-2.png' WHERE image_url LIKE '%exam-2.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/exam-essentials.png' WHERE image_url LIKE '%exam-essentials.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/glue-stick-pritt-43g.png' WHERE image_url LIKE '%glue-stick-pritt-43g.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/graphite-pencils-and-packaging.png' WHERE image_url LIKE '%graphite-pencils-and-packaging.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/lion-king-book-jacket-packaging.png' WHERE image_url LIKE '%lion-king-book-jacket-packaging.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/new-term-supplies-2.png' WHERE image_url LIKE '%new-term-supplies-2.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/new-term-supplies.png' WHERE image_url LIKE '%new-term-supplies.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/orange-sketchbook-with-tree-illustration.png' WHERE image_url LIKE '%orange-sketchbook-with-tree-illustration.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/pen-bic-cristal-blue.png' WHERE image_url LIKE '%pen-bic-cristal-blue.png%';
UPDATE products SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/products/three-rolls-of-white-paper.png' WHERE image_url LIKE '%three-rolls-of-white-paper.png%';

-- Update announcement images to placeholder (temporary fix)
UPDATE announcements SET image_url = 'https://rwsjbkedgztplwzxoxks.supabase.co/storage/v1/object/public/ui-elements/placeholder.svg' WHERE image_url IS NULL OR image_url = '';

COMMIT;
