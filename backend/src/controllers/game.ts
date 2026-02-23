import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createGame = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { name, eventId } = req.body;

        // Only ADMIN or DEVELOPER should create games
        const game = await prisma.game.create({
            data: {
                name,
                eventId
            }
        });

        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getGames = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { eventId } = req.query;
        let whereClause = {};
        if (eventId) {
            whereClause = { eventId: String(eventId) };
        }

        const games = await prisma.game.findMany({
            where: whereClause,
            include: { categories: true }
        });
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteGame = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;

        // Find categories for this game
        const categories = await prisma.category.findMany({ where: { gameId: id } });
        const categoryIds = categories.map(c => c.id);

        if (categoryIds.length > 0) {
            // Find teams for these categories
            const teams = await prisma.team.findMany({ where: { categoryId: { in: categoryIds } } });
            const teamIds = teams.map(t => t.id);

            // Delete in proper order: Matches, TeamMembers, Teams, Categories
            await prisma.match.deleteMany({ where: { categoryId: { in: categoryIds } } });
            if (teamIds.length > 0) {
                await prisma.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });
                await prisma.team.deleteMany({ where: { categoryId: { in: categoryIds } } });
            }
            await prisma.category.deleteMany({ where: { gameId: id } });
        }

        await prisma.game.delete({ where: { id } });
        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
