import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: string, role: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        next();
    };
};
