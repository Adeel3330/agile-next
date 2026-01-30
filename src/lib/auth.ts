import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
}

export async function verifyToken(req: NextRequest): Promise<{ adminId: string } | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    return { adminId: decoded.id };
  } catch (error) {
    console.error('JWT verify error:', error);
    return null;
  }
}
