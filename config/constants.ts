import dotenv from 'dotenv';
import type {TLooseObj} from '../types/common';
const ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV !== 'production') dotenv.config();

const emailData = {
  supportEmail: 'support@test.com',
  companyName: 'My Company',
  companyAddress: 'Rue Michelle, 234 France',
  companyUrl: 'https:example.com',
  postmarkId: process.env.POSTMARK_ID,
};

const environment = {
  env: process.env.NODE_ENV || 'development',
};

type EmailData = {
  supportEmail: string
  companyName: string
  companyAddress: string
  companyUrl: string
  postmarkId: string,
}

type EnvConfig = {
  port: number;
  ttlVerify: number;
  ttlAuth: number;
  saltRounds: number;
  emailData: EmailData;
}

const constants = {
  development: {
    port: 5000,
    ttlVerify: 60 * 60 * 2, // two days (sec * min * 2)
    ttlAuth: 60 * 60 * 24 * 7 * 2, // two weeks (sec * min * day * week * 2)
    saltRounds: 10,
    emailData,
    environment
  },
  test: {
    port: 5000,
    ttlVerify: 60 * 60, // one hour
    ttlAuth: 60 * 60, // one hour
    saltRounds: 2,
    emailData,
    environment
  },
  production: {
    port: 5000,
    ttlVerify: 60 * 60 * 2, // two days (sec * min * 2)
    ttlAuth: 60 * 60 * 24 * 7 * 2, // two weeks (sec * min * day * week * 2)
    saltRounds: 10,
    emailData,
    environment
  },
};

export default (function(obj: TLooseObj, e: string): EnvConfig {
  return obj[e];
})(constants, ENV)
