import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createAssociation = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { name } = req.body;

        const association = await prisma.association.create({
            data: {
                name,
                createdById: req.user!.id
            }
        });

        res.status(201).json(association);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAssociations = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const associations = await prisma.association.findMany({
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                events: true,
            }
        });
        res.json(associations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateAssociation = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;
        const { name } = req.body;

        const association = await prisma.association.update({
            where: { id },
            data: { name }
        });

        res.json(association);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteAssociation = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;

        // Cascade delete: Associations -> Events -> Games -> Categories -> Teams/Matches -> TeamMembers
        const events = await prisma.event.findMany({ where: { associationId: id } });
        const eventIds = events.map(e => e.id);

        if (eventIds.length > 0) {
            const games = await prisma.game.findMany({ where: { eventId: { in: eventIds } } });
            const gameIds = games.map(g => g.id);

            if (gameIds.length > 0) {
                const categories = await prisma.category.findMany({ where: { gameId: { in: gameIds } } });
                const categoryIds = categories.map(c => c.id);

                if (categoryIds.length > 0) {
                    const teams = await prisma.team.findMany({ where: { categoryId: { in: categoryIds } } });
                    const teamIds = teams.map(t => t.id);

                    await prisma.match.deleteMany({ where: { categoryId: { in: categoryIds } } });

                    if (teamIds.length > 0) {
                        await prisma.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });
                        await prisma.team.deleteMany({ where: { categoryId: { in: categoryIds } } });
                    }

                    await prisma.category.deleteMany({ where: { gameId: { in: gameIds } } });
                }
                await prisma.game.deleteMany({ where: { eventId: { in: eventIds } } });
            }
            await prisma.event.deleteMany({ where: { associationId: id } });
        }

        await prisma.association.delete({ where: { id } });

        res.json({ message: 'Association deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
