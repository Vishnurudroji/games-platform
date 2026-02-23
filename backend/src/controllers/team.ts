import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { TeamStatus } from '@prisma/client';

export const registerTeam = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, captainName, branch, year, categoryId, members } = req.body;

        // Public registration endpoint
        const team = await prisma.team.create({
            data: {
                name,
                captainName,
                branch,
                year,
                categoryId,
                status: TeamStatus.PENDING,
                members: {
                    create: members || [] // Array of { name, branch, year }
                }
            },
            include: {
                members: true
            }
        });

        res.status(201).json({ message: 'Team registered successfully, pending approval', team });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getTeams = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { categoryId } = req.query;
        let whereClause = {};
        if (categoryId) {
            whereClause = { categoryId: String(categoryId) };
        }

        const teams = await prisma.team.findMany({
            where: whereClause,
            include: { members: true, category: { select: { name: true, game: { select: { name: true } } } } }
        });

        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateTeamStatus = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { status } = req.body; // 'APPROVED' | 'REJECTED'

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const team = await prisma.team.update({
            where: { id },
            data: { status: status as TeamStatus },
        });

        res.json({ message: `Team status updated to ${status}`, team });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
