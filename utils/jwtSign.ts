import jwt from 'jsonwebtoken';
import { User } from '@prisma/client'
import {Profile} from '../types/common';
import bcrypt from 'bcryptjs';
const {JWT_ROUNDS} = process.env;

type UserProfile = {
  sub: number;
  email: string
}

export function jwtSign(userProfile: UserProfile, secret: string, jwtExpiresIn: number): string {
  return jwt.sign(userProfile, secret, {expiresIn: Number(jwtExpiresIn)});
}

export async function jwtVerify(token: string, secret: string, options?: Partial<jwt.VerifyOptions>): Promise<jwt.JwtPayload | Profile | string> {
  return await jwt.verify(token, secret, options);
}

export function generateSalt(value?: number): string {
  const rounds = value || Number(JWT_ROUNDS)
  return bcrypt.genSaltSync(rounds);
}

type Payload = {
  salt: string;
  hash: string;
  itr: number;
}

export function hashValueWithSalt(str: string, salt: string): string {
  return bcrypt.hashSync(str, salt);
}

export async function hashValueAsync(pass: string, itr: number): Promise<Payload> {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(itr, function(err, salt) {
      if (err) reject(err);
      bcrypt.hash(pass, salt, function(err, hash) {
        if (err) reject(err);
        resolve({
          salt: salt,
          hash: hash,
          itr: itr,
        });
      });
    });
  });
}

export function hashValue(str: string) {
  const salt = bcrypt.genSaltSync(Number(JWT_ROUNDS));
  return bcrypt.hashSync(str, salt);
}

export async function compareHash(plainStr: string, hashStr: string): Promise<boolean> {
  const isMatched = await areEqual(plainStr, hashStr);
  return isMatched;
}

export async function areEqual(str: string, hash: string): Promise<boolean> {
  return bcrypt.compare(str, hash);
}
