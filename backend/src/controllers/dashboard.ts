import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getBudgetDashboard = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        // Analytics that require viewing all events/categories based on role:
        // If Admin -> budget for their events
        // If Developer -> global budget

        let eventFilter = {};
        if (req.user?.role === 'ADMIN') {
            eventFilter = { adminId: req.user.id };
        }

        const events = await prisma.event.findMany({
            where: eventFilter,
            include: {
                games: {
                    include: {
                        categories: {
                            include: {
                                teams: {
                                    where: { status: 'APPROVED' }
                                },
                                incharge: {
                                    select: { email: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const analytics = events.map(event => {
            let eventRevenue = 0;
            let totalTeams = 0;

            const gamesAnalytics = event.games.map(game => {
                let gameRevenue = 0;
                let gameTeams = 0;

                const categoriesAnalytics = game.categories.map(category => {
                    const approvedTeamsCount = category.teams.length;
                    const revenue = approvedTeamsCount * category.entryFee;

                    gameRevenue += revenue;
                    gameTeams += approvedTeamsCount;

                    return {
                        id: category.id,
                        name: category.name,
                        entryFee: category.entryFee,
                        inchargeEmail: (category as any).incharge?.email,
                        approvedTeamsCount,
                        revenue
                    };
                });

                eventRevenue += gameRevenue;
                totalTeams += gameTeams;

                return {
                    id: game.id,
                    name: game.name,
                    totalTeams: gameTeams,
                    revenue: gameRevenue,
                    categories: categoriesAnalytics
                };
            });

            return {
                id: event.id,
                name: event.name,
                totalTeams,
                totalRevenue: eventRevenue,
                games: gamesAnalytics
            };
        });

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
