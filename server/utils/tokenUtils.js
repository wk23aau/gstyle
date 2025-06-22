
import crypto from 'crypto';

export const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
