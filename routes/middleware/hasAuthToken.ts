import { header, body } from 'express-validator';

export const hasAuthToken = () => {
  return [
    header('authorization', `Authorization header required`).isString(),
    header('authorization', `Authorization header malformed`).isBase64()
  ]
};

export const verifyEmail = () => ([body('token', 'Verification token is required').isString()])
