// const { header, body } = require('express-validator/check');
const { header, body } = require('express-validator');

const hasAuthToken = () => {
  return [
    header('authorization', `Authorization header required`).isString(),
    header('authorization', `Authorization header malformed`).isBase64()
  ]
};

const verifyEmail = () => ([body('token', 'Verification token is required').isString()])

module.exports = {
  hasAuthToken,
  verifyEmail
}
