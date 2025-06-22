
// Utility to sanitize user object for API responses, removing sensitive fields.
export const sanitizeUserForResponse = (user) => {
  if (!user) return null;
  
  const hasLocalPassword = !!user.password; // Check if password hash exists before removing it

  // Destructure to explicitly remove sensitive fields and return the rest
  const {
    password, // Hashed password from DB
    email_verification_token,
    email_verification_token_expires_at,
    password_reset_token,
    password_reset_token_expires_at,
    _updatedInDb, // internal flag from credit service, remove before sending to client
    ...safeUser // This object will contain all other non-sensitive properties
  } = user;

  // Ensure credits_available is a number, default to 0 if undefined for some reason
  const credits_available = typeof safeUser.credits_available === 'number' ? safeUser.credits_available : 0;


  // Add the hasLocalPassword flag and ensure credits fields are present
  return { 
    ...safeUser, 
    hasLocalPassword,
    credits_available: credits_available,
    credits_last_reset_date: safeUser.credits_last_reset_date // Will be YYYY-MM-DD string or null
  };
};
