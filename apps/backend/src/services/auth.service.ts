import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '7d';

// ── Register ──────────────────────────────────────────────

export async function register(
  email: string,
  username: string,
  password: string
) {
  // Check if email or username already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    throw new Error(
      existing.email === email
        ? 'Email already in use'
        : 'Username already taken'
    );
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      username: true,
      preferredLanguage: true,
      createdAt: true,
    },
  });

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { user, token };
}

// ── Login ─────────────────────────────────────────────────

export async function login(email: string, password: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  // Return user without passwordHash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}