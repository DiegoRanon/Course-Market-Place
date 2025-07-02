-- Populate categories table with initial data
INSERT INTO categories (name, description, color)
VALUES 
  ('Web Development', 'Learn web development technologies like HTML, CSS, JavaScript, and popular frameworks', '#3498db'),
  ('Data Science', 'Master data analysis, machine learning, and AI techniques', '#9b59b6'),
  ('Business', 'Develop business skills including management, marketing, and entrepreneurship', '#34495e'),
  ('Design', 'Learn graphic design, UX/UI, and other creative skills', '#e74c3c'),
  ('Marketing', 'Master digital marketing, SEO, social media, and advertising strategies', '#f39c12'),
  ('Personal Development', 'Improve soft skills, productivity, and personal growth', '#2ecc71')
ON CONFLICT (name) DO NOTHING;

-- Update course counts for each category
-- This is a placeholder - in a real application, you would use a trigger or function
-- to keep these counts updated automatically
UPDATE categories
SET count = (
  SELECT COUNT(*) 
  FROM courses 
  WHERE category = categories.id
);

-- Add icons to categories if the column exists
DO $$ 
BEGIN
  -- Check if the icon column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'icon'
  ) THEN
    -- Update icons
    UPDATE categories SET icon = '💻' WHERE name = 'Web Development';
    UPDATE categories SET icon = '📊' WHERE name = 'Data Science';
    UPDATE categories SET icon = '💼' WHERE name = 'Business';
    UPDATE categories SET icon = '🎨' WHERE name = 'Design';
    UPDATE categories SET icon = '📱' WHERE name = 'Marketing';
    UPDATE categories SET icon = '🧠' WHERE name = 'Personal Development';
  END IF;
END $$; 