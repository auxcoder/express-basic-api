import jwt from 'jsonwebtoken';
import { User } from '@prisma/client'
import {Profile} from '../types/common';

export function jwtSign(userProfile: Partial<User>, secret: string, jwtExpiresIn: number): string {
  return jwt.sign(userProfile, secret, {expiresIn: Number(jwtExpiresIn)});
}

export async function jwtVerify(token: string, secret: string, options?: Partial<jwt.VerifyOptions>): Promise<jwt.JwtPayload | Profile | string> {
  return await jwt.verify(token, secret, options);
}
