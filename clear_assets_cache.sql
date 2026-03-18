-- Run this in your Odoo PostgreSQL database to clear the asset bundle cache
-- This forces Odoo to recompile all JS/CSS assets with the new code
--
-- Usage:
--   psql -U odoo -d YOUR_DB_NAME -f clear_assets_cache.sql
--
-- OR run directly in psql shell:

DELETE FROM ir_attachment
WHERE name LIKE '%web.assets_backend%'
   OR name LIKE '%persian_date_picker%'
   OR url  LIKE '/web/assets/%';

-- Also clear the ir_asset table cache if present
UPDATE ir_module_module
SET state = 'installed'
WHERE name = 'persian_date_picker'
  AND state = 'installed';

-- Optional: clear ALL asset bundles (nuclear option - safe to run)
DELETE FROM ir_attachment
WHERE url LIKE '/web/assets/%';

SELECT 'Asset cache cleared. Please restart Odoo server.' AS message;
