import { pool } from "../config/db.js";

export async function listJournalEntries(userId) {
  const { rows } = await pool.query(
    "SELECT id, user_id, title, content, created_at, updated_at FROM journals WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

export async function createJournalEntry({ userId, title, content }) {
  const { rows } = await pool.query(
    "INSERT INTO journals (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, user_id, title, content, created_at, updated_at",
    [userId, title, content]
  );
  return rows[0];
}

export async function updateJournalEntry({ userId, id, title, content }) {
  const { rows } = await pool.query(
    "UPDATE journals SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id, user_id, title, content, created_at, updated_at",
    [title, content, id, userId]
  );
  return rows[0] || null;
}

export async function deleteJournalEntry({ userId, id }) {
  const { rowCount } = await pool.query("DELETE FROM journals WHERE id = $1 AND user_id = $2", [id, userId]);
  return rowCount > 0;
}
