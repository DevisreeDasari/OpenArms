import { pool } from "../config/db.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, email, password_hash, is_verified, google_sub, name, age, gender, created_at FROM users WHERE email = $1",
    [email]
  );
  return rows[0] || null;
}

export async function findUserByGoogleSub(googleSub) {
  const { rows } = await pool.query(
    "SELECT id, email, password_hash, is_verified, google_sub, name, age, gender, created_at FROM users WHERE google_sub = $1",
    [googleSub]
  );
  return rows[0] || null;
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, email, is_verified, google_sub, name, age, gender, created_at FROM users WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

export async function createUser({ email, passwordHash }) {
  const { rows } = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, is_verified, created_at",
    [email, passwordHash]
  );
  return rows[0];
}

export async function setEmailVerificationToken({ userId, tokenHash, expiresAt }) {
  await pool.query(
    "UPDATE users SET email_verify_token_hash = $1, email_verify_expires_at = $2 WHERE id = $3",
    [tokenHash, expiresAt, userId]
  );
}

export async function verifyEmailByTokenHash(tokenHash) {
  const { rows } = await pool.query(
    "UPDATE users SET is_verified = TRUE, email_verify_token_hash = NULL, email_verify_expires_at = NULL WHERE email_verify_token_hash = $1 AND (email_verify_expires_at IS NULL OR email_verify_expires_at > NOW()) RETURNING id, email, is_verified, created_at",
    [tokenHash]
  );
  return rows[0] || null;
}

export async function setPasswordResetToken({ userId, tokenHash, expiresAt }) {
  await pool.query(
    "UPDATE users SET password_reset_token_hash = $1, password_reset_expires_at = $2 WHERE id = $3",
    [tokenHash, expiresAt, userId]
  );
}

export async function resetPasswordByTokenHash({ tokenHash, passwordHash }) {
  const { rows } = await pool.query(
    "UPDATE users SET password_hash = $1, password_reset_token_hash = NULL, password_reset_expires_at = NULL WHERE password_reset_token_hash = $2 AND (password_reset_expires_at IS NULL OR password_reset_expires_at > NOW()) RETURNING id, email, is_verified, created_at",
    [passwordHash, tokenHash]
  );
  return rows[0] || null;
}

export async function linkGoogleSubToUser({ userId, googleSub }) {
  const { rows } = await pool.query(
    "UPDATE users SET google_sub = $1 WHERE id = $2 RETURNING id, email, is_verified, google_sub, created_at",
    [googleSub, userId]
  );
  return rows[0] || null;
}

export async function updateUserProfile({ userId, name, age, gender }) {
  const { rows } = await pool.query(
    "UPDATE users SET name = $1, age = $2, gender = $3 WHERE id = $4 RETURNING id, email, is_verified, name, age, gender, created_at",
    [name, age, gender, userId]
  );
  return rows[0] || null;
}
