import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const createEvent = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { name, startDate, endDate, venue, associationId, adminName, adminEmail, adminPassword } = req.body;

        let adminId = req.user?.id;

        if (req.user?.role === 'DEVELOPER') {
            if (!adminEmail) return res.status(400).json({ message: 'Admin email required' });

            let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });

            if (!adminUser) {
                if (!adminPassword) return res.status(400).json({ message: 'Password required for new Admin' });
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                adminUser = await prisma.user.create({
                    data: { email: adminEmail, password: hashedPassword, name: adminName, role: 'ADMIN' }
                });
            }
            adminId = adminUser.id;
        }

        if (!adminId) return res.status(400).json({ message: 'Valid Admin is required' });

        const event = await prisma.event.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                venue,
                associationId,
                adminId
            }
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getEvents = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const events = await prisma.event.findMany({
            include: {
                association: true,
                admin: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;

        const games = await prisma.game.findMany({ where: { eventId: id } });
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
            await prisma.game.deleteMany({ where: { eventId: id } });
        }

        await prisma.event.delete({ where: { id } });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
