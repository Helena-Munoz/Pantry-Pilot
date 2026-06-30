import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

// ── Register ──────────────────────────────────────────────

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;

    // Basic field validation
    if (!email || !username || !password) {
      res.status(400).json({ error: 'Email, username and password are required' });
      return;
    }

    const result = await authService.register(email, username, password);

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ── Login ─────────────────────────────────────────────────

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Basic field validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}