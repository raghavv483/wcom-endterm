-- Drop old restrictive policies
DROP POLICY IF EXISTS "votes_create" ON votes;
DROP POLICY IF EXISTS "votes_delete" ON votes;

-- Create new permissive policies
CREATE POLICY "votes_create" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (true);
