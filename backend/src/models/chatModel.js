import { pool } from "../config/db.js";

export async function listChatMessages(userId, limit = 50) {
  const { rows } = await pool.query(
    "SELECT id, user_id, role, message, created_at FROM chats WHERE user_id = $1 ORDER BY created_at ASC LIMIT $2",
    [userId, limit]
  );
  return rows;
}

export async function createChatMessage({ userId, role, message }) {
  const { rows } = await pool.query(
    "INSERT INTO chats (user_id, role, message) VALUES ($1, $2, $3) RETURNING id, user_id, role, message, created_at",
    [userId, role, message]
  );
  return rows[0];
}
