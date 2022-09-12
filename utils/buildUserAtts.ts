import {jwtSign} from './jwtSign';
import constants from '../config/constants';
import { User } from '@prisma/client'

const buildUserAttrs = (user: Partial<User>, data: {salt: string; itr: number; hash: string}) => {
  const emailVerified = false;
  const role = 1; // guess by default
  const userData = Object.assign(user, {role: role, verified: emailVerified });
  return {
      email: user.email,
      username: user.username,
      salt: data.salt,
      itr: data.itr,
      password: data.hash,
      verified: emailVerified,
      active: true,
      role: role,
      veroken: jwtSign(userData, 'verification', constants.ttlVerify),
  };
};

export default buildUserAttrs;
