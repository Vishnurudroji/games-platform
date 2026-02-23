import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getLeaderboard = async (req: Request, res: Response): Promise<any> => {
    try {
        const categoryId = String(req.params.categoryId);

        const matches = await prisma.match.findMany({
            where: { categoryId, result: { not: null } },
            include: { team1: true, team2: true }
        });

        const teams = await prisma.team.findMany({
            where: { categoryId, status: 'APPROVED' }
        });

        // Simple point calculation: +1 point per win
        const leaderboardMap = new Map<string, { id: string; name: string; wins: number; matchesObj: any[] }>();

        teams.forEach(t => {
            leaderboardMap.set(t.id, { id: t.id, name: t.name, wins: 0, matchesObj: [] });
        });

        matches.forEach(m => {
            if (!m.result) return;
            // Depending on how result is stored, let's assume result stores the ID of the winning team for simplicity, 
            // or "DRAW", or "Team1 Won".
            // We will parse: if result matches team1.id -> team1 won.
            const isTeam1Winner = m.result === m.team1Id || m.result === 'Team1 Won';
            const isTeam2Winner = m.result === m.team2Id || m.result === 'Team2 Won';

            if (isTeam1Winner && m.team1Id && leaderboardMap.has(m.team1Id)) {
                leaderboardMap.get(m.team1Id)!.wins += 1;
            }
            if (isTeam2Winner && m.team2Id && leaderboardMap.has(m.team2Id)) {
                leaderboardMap.get(m.team2Id)!.wins += 1;
            }
        });

        const leaderboard = Array.from(leaderboardMap.values()).sort((a, b) => b.wins - a.wins);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
