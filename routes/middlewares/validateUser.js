import { check } from "express-validator";

const minUsername = 8;
const minPass = 8;

// todo: set password security rules
export const newUser = () => {
  return [
    check('username', `Username field min length should be ${minUsername}`).isLength({ min: minUsername }),
    check('password', `Password field min length should be ${minPass}`).isLength({ min: minPass }),
    check('email', `Email field not valid`).isEmail(),
    check('client', `Client field is not valid`).notEmpty(), // validate is url
  ]
};

export const patchUser = () => {
  return [
    check('username', `Username field min length should be ${minUsername}`).isLength({ min: minUsername }),
    check('email', `Email field not valid`).isEmail()
  ]
};

export const existUser = () => {
  return [check('email', `Email field not valid`).not().isEmpty().isEmail().normalizeEmail()]
};
