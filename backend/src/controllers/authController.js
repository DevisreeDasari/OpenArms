import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import {
  createUser,
  findUserByEmail,
  findUserByGoogleSub,
  getUserById,
  linkGoogleSubToUser,
  resetPasswordByTokenHash,
  setEmailVerificationToken,
  setPasswordResetToken,
  updateUserProfile,
  verifyEmailByTokenHash,
} from "../models/userModel.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6),
});

const googleSchema = z.object({
  idToken: z.string().min(10),
});

const profileSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
});

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn });
}

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:5173/OpenArms/";
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function createTransport() {
  const user = process.env.GMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, "").trim() : "";
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    tls: {
      servername: "smtp.gmail.com",
    },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  });
}

async function sendEmail({ to, subject, text }) {
  const transporter = createTransport();
  if (!transporter) {
    const err = new Error("Email service not configured");
    err.statusCode = 500;
    throw err;
  }

  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER;
  try {
    await transporter.sendMail({ from, to, subject, text });
  } catch (e) {
    const err = new Error(`Failed to send email: ${e?.message || String(e)}`);
    err.statusCode = 500;
    throw err;
  }
}

function requireVerifiedEmail() {
  return String(process.env.AUTH_REQUIRE_VERIFIED || "false").toLowerCase() === "true";
}

export async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await findUserByEmail(body.email);
    if (existing) {
      if (!existing.is_verified) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = sha256(rawToken);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await setEmailVerificationToken({ userId: existing.id, tokenHash, expiresAt });

        const verifyUrl = `${getAppBaseUrl()}#/verify-email?token=${encodeURIComponent(rawToken)}`;
        sendEmail({
          to: body.email,
          subject: "Verify your email",
          text: `Verify your email by opening this link: ${verifyUrl}`,
        }).catch((err) => {
          // eslint-disable-next-line no-console
          console.error("[backend] failed to send verification email:", err);
        });

        return res.status(200).json({
          message: "Verification email resent",
          user: { id: existing.id, email: existing.email, isVerified: false },
        });
      }

      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await createUser({ email: body.email, passwordHash });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await setEmailVerificationToken({ userId: user.id, tokenHash, expiresAt });

    const verifyUrl = `${getAppBaseUrl()}#/verify-email?token=${encodeURIComponent(rawToken)}`;
    sendEmail({
      to: body.email,
      subject: "Verify your email",
      text: `Verify your email by opening this link: ${verifyUrl}`,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[backend] failed to send verification email:", err);
    });

    if (requireVerifiedEmail()) {
      return res.status(201).json({
        message: "Verification email sent",
        user: { id: user.id, email: user.email, isVerified: false },
      });
    }

    const token = signToken(user);
    return res
      .status(201)
      .json({ token, user: { id: user.id, email: user.email, isVerified: false } });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);

    const user = await findUserByEmail(body.email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(body.password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (requireVerifiedEmail() && !user.is_verified) {
      return res.status(403).json({ error: "Please verify your email before logging in" });
    }

    const token = signToken({ id: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, email: user.email, isVerified: !!user.is_verified } });
  } catch (err) {
    return next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const body = verifyEmailSchema.parse(req.body);
    const tokenHash = sha256(body.token);

    const user = await verifyEmailByTokenHash(tokenHash);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, isVerified: true } });
  } catch (err) {
    return next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const user = await findUserByEmail(body.email);

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = sha256(rawToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await setPasswordResetToken({ userId: user.id, tokenHash, expiresAt });

      const resetUrl = `${getAppBaseUrl()}#/reset-password?token=${encodeURIComponent(rawToken)}`;
      await sendEmail({
        to: body.email,
        subject: "Reset your password",
        text: `Reset your password by opening this link: ${resetUrl}`,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const tokenHash = sha256(body.token);
    const passwordHash = await bcrypt.hash(body.newPassword, 10);

    const user = await resetPasswordByTokenHash({ tokenHash, passwordHash });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, isVerified: !!user.is_verified } });
  } catch (err) {
    return next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const body = googleSchema.parse(req.body);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: body.idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const googleSub = payload?.sub;
    const email = payload?.email;
    const emailVerified = !!payload?.email_verified;

    if (!googleSub || !email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    let user = await findUserByGoogleSub(googleSub);
    if (!user) {
      const byEmail = await findUserByEmail(email);
      if (byEmail) {
        user = await linkGoogleSubToUser({ userId: byEmail.id, googleSub });
      } else {
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const created = await createUser({ email, passwordHash });
        user = await linkGoogleSubToUser({ userId: created.id, googleSub });
      }
    }

    if (requireVerifiedEmail() && !emailVerified) {
      return res.status(403).json({ error: "Google account email is not verified" });
    }

    const token = signToken({ id: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, email: user.email, isVerified: emailVerified || !!user.is_verified } });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        isVerified: !!user.is_verified,
        name: user.name || null,
        age: typeof user.age === "number" ? user.age : null,
        gender: user.gender || null,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const parsed = profileSchema.parse({
      ...req.body,
      age: typeof req.body?.age === "string" ? Number(req.body.age) : req.body?.age,
    });

    const user = await updateUserProfile({ userId, ...parsed });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        isVerified: !!user.is_verified,
        name: user.name || null,
        age: typeof user.age === "number" ? user.age : null,
        gender: user.gender || null,
      },
    });
  } catch (err) {
    return next(err);
  }
}
