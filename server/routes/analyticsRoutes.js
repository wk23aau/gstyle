
import express from 'express';
import { fetchRealtimeAnalytics } from '../services/analyticsService.js';

const router = express.Router();

router.get('/realtime-data', async (req, res) => {
  try {
    const data = await fetchRealtimeAnalytics();
    res.json(data);
  } catch (error) {
    // The service should ideally format the error, but we can catch and ensure 500
    console.error('Error in /realtime-data route:', error.message);
    res.status(500).json({ 
        message: error.message || 'Failed to fetch real-time analytics due to an internal server error.',
        activeUsers: 0,
        topPages: [] 
    });
  }
});

export default router;
