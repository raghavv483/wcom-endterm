import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profile';

const app = new Hono();

// CORS middleware
app.use('*', cors());

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/profile', profileRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
