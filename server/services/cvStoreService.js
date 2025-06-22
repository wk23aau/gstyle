
import { dbPool } from '../config/database.js';

class CvStoreServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export const saveGeneratedCv = async (userId, jobInfoQuery, generatedCvText, cvTitle, tags) => {
  if (!dbPool) {
    console.error("[CvStoreService] Database not initialized during saveGeneratedCv.");
    throw new CvStoreServiceError('Database not initialized.', 503);
  }
  if (!userId || !jobInfoQuery || !generatedCvText || !cvTitle) {
    throw new CvStoreServiceError('Missing required fields to save CV.', 400);
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO saved_cvs (user_id, job_info_query, generated_cv_text, cv_title, tags) VALUES (?, ?, ?, ?, ?)',
      [userId, jobInfoQuery, generatedCvText, cvTitle, tags ? JSON.stringify(tags) : null]
    );
    console.log(`[CvStoreService] CV saved for user ${userId}, CV ID: ${result.insertId}`);
    return { id: result.insertId, userId, jobInfoQuery, cvTitle, tags };
  } catch (dbError) {
    console.error('[CvStoreService] Error saving CV to database:', dbError);
    throw new CvStoreServiceError('Failed to save CV.', 500);
  }
};

export const getUserSavedCvs = async (userId) => {
  if (!dbPool) {
    console.error("[CvStoreService] Database not initialized during getUserSavedCvs.");
    throw new CvStoreServiceError('Database not initialized.', 503);
  }
  if (!userId || isNaN(parseInt(userId))) {
     console.error(`[CvStoreService] Invalid or missing userId for getUserSavedCvs: ${userId}`);
    throw new CvStoreServiceError('Valid User ID is required.', 400);
  }

  try {
    const [rows] = await dbPool.query(
      'SELECT id, cv_title, tags, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%sZ") as created_at, DATE_FORMAT(updated_at, "%Y-%m-%dT%H:%i:%sZ") as updated_at FROM saved_cvs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows.map(cv => {
        let parsedTags = null;
        if (cv.tags) {
            try {
                // Ensure cv.tags is a string before parsing
                parsedTags = typeof cv.tags === 'string' ? JSON.parse(cv.tags) : cv.tags; // If already object (e.g. from tests), use as is
                if (typeof parsedTags !== 'object' && !Array.isArray(parsedTags)) { // Additional check if parsing stringified non-JSON
                    parsedTags = null; // Reset if not a valid JSON structure (array or object)
                    console.warn(`[CvStoreService] Tags for CV ID ${cv.id} parsed into non-object/array type. CV Tags: ${cv.tags}`);
                }
            } catch (parseError) {
                console.warn(`[CvStoreService] Failed to parse tags for CV ID ${cv.id}: "${cv.tags}". Error: ${parseError.message}. Returning tags as null.`);
                parsedTags = null;
            }
        }
        return {
            ...cv,
            tags: parsedTags
        };
    });
  } catch (dbError) {
    console.error(`[CvStoreService] Error fetching saved CVs for user ${userId}:`, dbError);
    throw new CvStoreServiceError('Failed to fetch saved CVs.', 500);
  }
};

export const getSavedCvDetails = async (cvId, userId) => {
  if (!dbPool) {
    console.error("[CvStoreService] Database not initialized during getSavedCvDetails.");
    throw new CvStoreServiceError('Database not initialized.', 503);
  }
  if (!cvId || isNaN(parseInt(cvId)) || !userId || isNaN(parseInt(userId))) {
    console.error(`[CvStoreService] Invalid cvId or userId for getSavedCvDetails. CV_ID: ${cvId}, User_ID: ${userId}`);
    throw new CvStoreServiceError('CV ID and valid User ID are required.', 400);
  }

  try {
    const [rows] = await dbPool.query(
      'SELECT id, user_id, job_info_query, generated_cv_text, cv_title, tags, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%sZ") as created_at, DATE_FORMAT(updated_at, "%Y-%m-%dT%H:%i:%sZ") as updated_at FROM saved_cvs WHERE id = ? AND user_id = ?',
      [cvId, userId]
    );
    if (rows.length === 0) {
      throw new CvStoreServiceError('CV not found or access denied.', 404);
    }
    const cv = rows[0];
    let parsedTags = null;
    if (cv.tags) {
        try {
            parsedTags = typeof cv.tags === 'string' ? JSON.parse(cv.tags) : cv.tags;
             if (typeof parsedTags !== 'object' && !Array.isArray(parsedTags)) {
                parsedTags = null; 
                console.warn(`[CvStoreService] Tags for CV ID ${cv.id} (detail fetch) parsed into non-object/array type. CV Tags: ${cv.tags}`);
            }
        } catch (parseError) {
            console.warn(`[CvStoreService] Failed to parse tags for CV ID ${cv.id} during detail fetch: "${cv.tags}". Error: ${parseError.message}. Returning tags as null.`);
            parsedTags = null;
        }
    }
    return {
        ...cv,
        tags: parsedTags
    };
  } catch (dbError) {
    console.error(`[CvStoreService] Error fetching CV details for CV ID ${cvId}, User ID ${userId}:`, dbError);
    if (dbError instanceof CvStoreServiceError) throw dbError;
    throw new CvStoreServiceError('Failed to fetch CV details.', 500);
  }
};

export const deleteSavedCv = async (cvId, userId) => {
  if (!dbPool) {
    console.error("[CvStoreService] Database not initialized during deleteSavedCv.");
    throw new CvStoreServiceError('Database not initialized.', 503);
  }
  if (!cvId || isNaN(parseInt(cvId)) || !userId || isNaN(parseInt(userId))) {
    console.error(`[CvStoreService] Invalid cvId or userId for deleteSavedCv. CV_ID: ${cvId}, User_ID: ${userId}`);
    throw new CvStoreServiceError('CV ID and valid User ID are required.', 400);
  }

  try {
    const [result] = await dbPool.query(
      'DELETE FROM saved_cvs WHERE id = ? AND user_id = ?',
      [cvId, userId]
    );
    if (result.affectedRows === 0) {
      throw new CvStoreServiceError('CV not found or access denied for deletion.', 404);
    }
    console.log(`[CvStoreService] CV ID ${cvId} deleted for user ${userId}.`);
    return { message: 'CV deleted successfully.' };
  } catch (dbError) {
    console.error(`[CvStoreService] Error deleting CV ID ${cvId} for User ID ${userId}:`, dbError);
    if (dbError instanceof CvStoreServiceError) throw dbError;
    throw new CvStoreServiceError('Failed to delete CV.', 500);
  }
};