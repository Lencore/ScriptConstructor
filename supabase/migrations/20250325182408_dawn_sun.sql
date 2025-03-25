/*
  # Create scripts table

  1. New Tables
    - `scripts`
      - `id` (uuid, primary key)
      - `data` (jsonb, stores script data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `scripts` table
    - Add policies for reading and inserting scripts
*/

CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scripts"
  ON scripts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert scripts"
  ON scripts
  FOR INSERT
  TO public
  WITH CHECK (true);