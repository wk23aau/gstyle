import { dbPool } from '../config/database.js';

class CvServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export const saveGeneratedCv = async (userId, jobQuery, cvContent) => {
  if (!dbPool) throw new CvServiceError('Database not initialized.', 503);
  if (!userId || !jobQuery || !cvContent) {
    throw new CvServiceError('User ID, job query, and CV content are required to save CV.', 400);
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO generated_cvs (user_id, job_query, generated_content) VALUES (?, ?, ?)',
      [userId, jobQuery, cvContent]
    );
    console.log(`Saved CV for user_id: ${userId}, cv_id: ${result.insertId}`);
    return { id: result.insertId, userId, jobQuery, cvContent, created_at: new Date().toISOString() };
  } catch (error) {
    console.error('Error saving generated CV to database:', error);
    throw new CvServiceError('Failed to save CV to database.', 500);
  }
};

export const getSavedCvsForUser = async (userId) => {
  if (!dbPool) throw new CvServiceError('Database not initialized.', 503);
  if (!userId) throw new CvServiceError('User ID is required to fetch saved CVs.', 400);

  try {
    const [rows] = await dbPool.query(
      'SELECT id, user_id, job_query, LEFT(generated_content, 250) as generated_content_snippet, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM generated_cvs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching saved CVs from database:', error);
    throw new CvServiceError('Failed to fetch saved CVs.', 500);
  }
};

export const getFullSavedCvForUser = async (cvId, userId) => {
    if (!dbPool) throw new CvServiceError('Database not initialized.', 503);
    if (!cvId || !userId) throw new CvServiceError('CV ID and User ID are required.', 400);

    try {
        const [rows] = await dbPool.query(
            'SELECT id, user_id, job_query, generated_content, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM generated_cvs WHERE id = ? AND user_id = ?',
            [cvId, userId]
        );
        if (rows.length === 0) {
            throw new CvServiceError('CV not found or access denied.', 404);
        }
        return rows[0];
    } catch (error) {
        console.error(`Error fetching full CV (id: ${cvId}) for user (id: ${userId}):`, error);
        if (error instanceof CvServiceError) throw error;
        throw new CvServiceError('Failed to fetch full CV.', 500);
    }
};


export const deleteCvForUser = async (cvId, userId) => {
  if (!dbPool) throw new CvServiceError('Database not initialized.', 503);
  if (!cvId || !userId) {
    throw new CvServiceError('CV ID and User ID are required to delete CV.', 400);
  }

  try {
    const [result] = await dbPool.query(
      'DELETE FROM generated_cvs WHERE id = ? AND user_id = ?',
      [cvId, userId]
    );

    if (result.affectedRows === 0) {
      throw new CvServiceError('CV not found or you do not have permission to delete it.', 404);
    }
    console.log(`Deleted CV id: ${cvId} for user_id: ${userId}`);
    return { message: 'CV deleted successfully.' };
  } catch (error) {
    console.error('Error deleting CV from database:', error);
    if (error instanceof CvServiceError) throw error;
    throw new CvServiceError('Failed to delete CV.', 500);
  }
};