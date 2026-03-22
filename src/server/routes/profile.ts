import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = new Hono();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to extract and verify JWT
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Helper to extract token from header
const getTokenFromHeader = (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  return authHeader.substring(7);
};

// GET /api/profile/api-key-usage
router.get('/api-key-usage', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = getTokenFromHeader(authHeader);
    const { userId } = verifyToken(token);

    const { data: usage, error } = await supabase
      .from('api_key_usage')
      .select('*')
      .eq('user_id', userId)
      .order('last_used', { ascending: false });

    if (error) throw error;

    return c.json(usage || []);
  } catch (error) {
    console.error('Failed to fetch API key usage:', error);
    return c.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 400 }
    );
  }
});

// GET /api/profile/activity-logs
router.get('/activity-logs', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = getTokenFromHeader(authHeader);
    const { userId } = verifyToken(token);

    const limit = parseInt(c.req.query('limit') || '50');

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return c.json(logs || []);
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return c.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 400 }
    );
  }
});

export const profileRoutes = router;
