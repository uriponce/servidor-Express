import { promisify } from 'node:util';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';
import asyncHandler from '../utils/asyncHandler.js';

const scrypt = promisify(scryptCallback);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});

const issueToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, stored] = storedHash.split(':');
  if (!salt || !stored || !/^[0-9a-f]{128}$/i.test(stored)) return false;
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(stored, 'hex'));
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 60) {
    throw new HttpError(400, 'El nombre es obligatorio y no puede superar los 60 caracteres');
  }
  if (
    typeof email !== 'string' ||
    email.trim().length > 254 ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    throw new HttpError(400, 'El email no es válido');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    throw new HttpError(409, 'Ya existe una cuenta con ese email');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
  });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email y contraseña son obligatorios');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Email o contraseña incorrectos');
  }

  res.status(200).json({ token: issueToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
});
