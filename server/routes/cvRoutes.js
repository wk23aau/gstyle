
import express from 'express';
import { generateCvWithAI } from '../services/aiService.js';
import { checkAndDecrementUserCredits } from '../services/userService.js'; // Import credit service

const router = express.Router();
const GEMINI_CALL_COST = 5; // Should be consistent with userService

router.post('/generate', async (req, res) => {
  try {
    const { jobInfo, userId } = req.body; // Expect userId if registered user

    if (userId) { // Registered user flow
      try {
        await checkAndDecrementUserCredits(userId, GEMINI_CALL_COST);
        // If successful, proceed to generate CV
      } catch (creditError) {
        // Catch credit-specific errors (e.g., insufficient credits, user not found)
        return res.status(creditError.statusCode || 403).json({ message: creditError.message });
      }
    }
    // For unregistered users, or if registered user has sufficient credits:
    const cvContent = await generateCvWithAI(jobInfo);
    res.json({ cvContent });

  } catch (error) {
    // Catch errors from generateCvWithAI or other unexpected errors
    console.error('Error in /generate CV route:', error.message);
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to generate CV due to an internal server error.' });
  }
});

export default router;
