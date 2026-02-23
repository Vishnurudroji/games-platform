import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import associationRoutes from './routes/association';
import eventRoutes from './routes/event';
import gameRoutes from './routes/game';
import categoryRoutes from './routes/category';
import teamRoutes from './routes/team';
import matchRoutes from './routes/match';
import leaderboardRoutes from './routes/leaderboard';
import dashboardRoutes from './routes/dashboard';
import publicRoutes from './routes/public';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
    res.send('College Sports Event Platform API');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
