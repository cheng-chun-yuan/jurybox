-- Delete all judges except the newly created ones (ID 29 and 30)
-- Run with: mysql -u root -p jurybox < scripts/delete-old-judges.sql

-- Show judges before deletion
SELECT 'Before deletion:' as Status;
SELECT id, name, title FROM judges ORDER BY id;

-- Delete old/test judges (keep only ID 29 and 30)
DELETE FROM judges WHERE id NOT IN (29, 30);

-- Show judges after deletion
SELECT 'After deletion:' as Status;
SELECT id, name, title FROM judges ORDER BY id;

-- Show count
SELECT COUNT(*) as total_judges FROM judges;
