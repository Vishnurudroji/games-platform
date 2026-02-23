import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const scheduleMatch = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { categoryId, team1Id, team2Id, scheduledTime } = req.body;

        // Incharge logic here
        const match = await prisma.match.create({
            data: {
                categoryId,
                team1Id,
                team2Id,
                scheduledTime: new Date(scheduledTime)
            }
        });

        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateMatchResult = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { result, scoreData } = req.body;

        const match = await prisma.match.update({
            where: { id },
            data: {
                result,
                scoreData: scoreData || null
            }
        });

        res.json(match);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getMatches = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { categoryId } = req.query;
        let whereClause = {};
        if (categoryId) {
            whereClause = { categoryId: String(categoryId) };
        }

        const matches = await prisma.match.findMany({
            where: whereClause,
            include: {
                team1: { select: { name: true, branch: true } },
                team2: { select: { name: true, branch: true } },
                category: { select: { name: true, game: { select: { name: true } } } }
            }
        });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateMatch = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { team1Id, team2Id, scheduledTime } = req.body;

        const match = await prisma.match.update({
            where: { id },
            data: {
                ...(team1Id && { team1Id }),
                ...(team2Id && { team2Id }),
                ...(scheduledTime && { scheduledTime: new Date(scheduledTime) })
            }
        });

        res.json(match);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteMatch = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);

        await prisma.match.delete({
            where: { id }
        });

        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
