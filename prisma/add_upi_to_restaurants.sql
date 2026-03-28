-- Add upi_id to all existing restaurant entries
UPDATE restaurants SET upi_id = 'bharat030406@oksbi' WHERE upi_id IS NULL;
