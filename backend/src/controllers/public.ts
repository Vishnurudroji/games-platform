import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getPublicEventsData = async (req: Request, res: Response): Promise<any> => {
    try {
        const events = await prisma.event.findMany({
            include: {
                games: {
                    include: {
                        categories: true
                    }
                }
            }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
