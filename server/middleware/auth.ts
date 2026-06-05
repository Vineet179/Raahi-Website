import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'raahi_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: 'user' | 'rider' | 'admin';
  };
}

/**
 * JWT Authentication Guard
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access Denied: No Token Provided' });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access Denied: Invalid or Expired Token' });
  }
}

/**
 * Role-Based Access Control Guard
 */
export function authorizeRoles(...allowedRoles: ('user' | 'rider' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: Authentication Required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Forbidden: This resource requires a role of [${allowedRoles.join(', ')}]. Current: [${req.user.role}]` 
      });
      return;
    }

    next();
  };
}
