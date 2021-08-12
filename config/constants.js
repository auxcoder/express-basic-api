import dotenv from 'dotenv';
let env = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV !== 'production') dotenv.config();

const emailData = {
  supportEmail: 'support@test.com',
  companyName: 'My Company',
  companyAddress: 'Rue Sant Michelle, 234 France',
  companyUrl: 'https:example.com',
  postmarkId: process.env.POSTMARK_ID,
};

const environment = {
  env: process.env.NODE_ENV || 'development',
};

const constants = {
  development: Object.assign(
    {
      port: 5000,
      ttlVerify: 60 * 60 * 2, // two days (sec * min * 2)
      ttlAuth: 60 * 60 * 24 * 7 * 2, // two weeks (sec * min * day * week * 2)
      saltRounds: 10,
    },
    emailData,
    environment
  ),
  test: Object.assign(
    {
      port: 5000,
      ttlVerify: 60 * 60, // one hour
      ttlAuth: 60 * 60, // one hour
      saltRounds: 2,
    },
    emailData,
    environment
  ),
  production: Object.assign(
    {
      port: 5000,
      ttlVerify: 60 * 60 * 2, // two days (sec * min * 2)
      ttlAuth: 60 * 60 * 24 * 7 * 2, // two weeks (sec * min * day * week * 2)
      saltRounds: 10,
    },
    emailData,
    environment
  ),
};

export default constants[env];
