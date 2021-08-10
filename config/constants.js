let env = process.env.NODE_ENV || 'development';

const emailData = {
  supportEmail: 'support@test.com',
  companyName: 'My Company',
  companyAddress: 'Rue Sant Michelle, 234 France',
  companyUrl: 'https:example.com',
  postmarkId: '50aa80af-6b92-4e95-97a0-a42bdf0343a5',
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

module.exports = constants[env];
