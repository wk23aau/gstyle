
import express from 'express';
import { generateCvWithAI } from '../services/aiService.js';
import { checkAndDecrementUserCredits, findUserById } from '../services/userService.js';
import { saveGeneratedCv, getUserSavedCvs, getSavedCvDetails, deleteSavedCv } from '../services/cvStoreService.js';

const router = express.Router();
const GEMINI_CALL_COST = 5; 

const ensureAuthenticated = (req, res, next) => {
  const userIdHeader = req.headers['x-user-id']; 
  if (!userIdHeader) {
    console.log("[CV Routes] ensureAuthenticated: x-user-id header missing.");
    return res.status(401).json({ message: 'Authentication required. Mock: Send x-user-id header.' });
  }
  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId)) {
    console.log(`[CV Routes] ensureAuthenticated: Invalid user ID format in x-user-id header: ${userIdHeader}`);
    return res.status(400).json({ message: 'Invalid user ID format in x-user-id header.' });
  }
  req.userId = userId;
  next();
};


router.post('/generate', async (req, res) => {
  let userIdFromRequest; // To hold userId if present for logging
  try {
    const { jobInfo, userId } = req.body; 
    userIdFromRequest = userId; // For logging in catch block

    if (!jobInfo) {
        return res.status(400).json({ message: "Job information is required." });
    }

    if (userId) { 
      try {
        await checkAndDecrementUserCredits(userId, GEMINI_CALL_COST);
      } catch (creditError) {
        console.error(`[CV Routes /generate] Credit error for user ${userId}: ${creditError.message}`);
        return res.status(creditError.statusCode || 403).json({ message: creditError.message });
      }
    }
    
    const cvContent = await generateCvWithAI(jobInfo);

    if (userId) {
      try {
        // Fetch user's full profile to extract tags
        const user = await findUserById(userId); // Assuming findUserById returns the comprehensive User object
        if (user) {
          const tags = [];
          // Extract from work experiences
          if (user.workExperiences && Array.isArray(user.workExperiences)) {
            user.workExperiences.forEach(we => { if (we.title) tags.push(we.title); });
          }
          // Extract from educations
          if (user.educations && Array.isArray(user.educations)) {
            user.educations.forEach(edu => {
              if (edu.degree) tags.push(edu.degree);
              if (edu.fieldOfStudy) tags.push(edu.fieldOfStudy);
            });
          }
          // Extract from languages
          if (user.languages && Array.isArray(user.languages)) {
            user.languages.forEach(lang => { if (lang.languageName) tags.push(lang.languageName); });
          }
          // Extract from headline
          if (user.headline) tags.push(user.headline);
          
          const uniqueTags = [...new Set(tags.filter(Boolean).map(tag => tag.trim()))]; // Ensure tags are trimmed and unique
          
          const cvTitle = jobInfo.substring(0, 60) + (jobInfo.length > 60 ? '...' : '');
          
          await saveGeneratedCv(userId, jobInfo, cvContent, cvTitle, uniqueTags);
          console.log(`[CV Routes /generate] CV saved for user ${userId} with title "${cvTitle}" and tags: [${uniqueTags.join(', ')}]`);
        } else {
          console.warn(`[CV Routes /generate] User with ID ${userId} not found after CV generation. CV not saved.`);
        }
      } catch (saveError) {
        console.error(`[CV Routes /generate] Failed to save CV for user ${userId} after generation: ${saveError.message}. Stack: ${saveError.stack}`);
        // Don't fail the whole request if saving fails, but log it.
        // User still gets their CV content.
      }
    }
    
    res.json({ cvContent });

  } catch (error) {
    console.error(`[CV Routes /generate] Error for user ${userIdFromRequest || 'unregistered'}: ${error.message}. Stack: ${error.stack}`);
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to generate CV due to an internal server error.' });
  }
});


// --- Routes for Saved CVs ---

router.get('/saved', ensureAuthenticated, async (req, res) => {
  console.log(`[CV Routes /saved GET] Request received for user ${req.userId}`);
  try {
    const savedCvs = await getUserSavedCvs(req.userId);
    res.json(savedCvs);
  } catch (error) {
    console.error(`[CV Routes /saved GET] Error fetching saved CVs for user ${req.userId}: ${error.message}. Stack: ${error.stack}`);
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to retrieve saved CVs.' });
  }
});

router.get('/saved/:cvId', ensureAuthenticated, async (req, res) => {
  const cvIdParam = req.params.cvId;
  console.log(`[CV Routes /saved/:cvId GET] Request received for CV ID ${cvIdParam}, user ${req.userId}`);
  try {
    const cvId = parseInt(cvIdParam, 10);
    if (isNaN(cvId)) {
        console.log(`[CV Routes /saved/:cvId GET] Invalid CV ID format: ${cvIdParam}`);
        return res.status(400).json({ message: 'Invalid CV ID format.' });
    }
    const cvDetails = await getSavedCvDetails(cvId, req.userId);
    res.json(cvDetails);
  } catch (error) {
    console.error(`[CV Routes /saved/:cvId GET] Error fetching CV details for cvId ${cvIdParam}, user ${req.userId}: ${error.message}. Stack: ${error.stack}`);
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to retrieve CV details.' });
  }
});

router.delete('/saved/:cvId', ensureAuthenticated, async (req, res) => {
  const cvIdParam = req.params.cvId;
  console.log(`[CV Routes /saved/:cvId DELETE] Request received for CV ID ${cvIdParam}, user ${req.userId}`);
  try {
    const cvId = parseInt(cvIdParam, 10);
     if (isNaN(cvId)) {
        console.log(`[CV Routes /saved/:cvId DELETE] Invalid CV ID format: ${cvIdParam}`);
        return res.status(400).json({ message: 'Invalid CV ID format.' });
    }
    const result = await deleteSavedCv(cvId, req.userId);
    res.json(result);
  } catch (error) {
    console.error(`[CV Routes /saved/:cvId DELETE] Error deleting CV cvId ${cvIdParam} for user ${req.userId}: ${error.message}. Stack: ${error.stack}`);
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to delete CV.' });
  }
});


export default router;