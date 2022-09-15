import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import { newUser, existUser } from '../middleware/validateUser';
import { hasAuthToken, verifyEmail } from '../middleware/hasAuthToken';
import validate from '../middleware/validate';
import {jwtSign, jwtVerify, hashValueAsync} from '../../utils/jwtSign';
import buildTemplateModel from '../../utils/buildTemplateModel';
import emailRepository from '../../core/email';
import constants from '../../config/constants';
import prisma from '../../db/prisma'
import HttpErrors from 'http-errors'
if (process.env.NODE_ENV !== 'production') dotenv.config();
const SECRET = process.env.JWT_SECRET || 'Secret!';
// import {profile} from 'winston';
const router = express.Router();
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global { namespace Express { interface User { id: number, email: string } } }

// READ exist
router.get('/exist/:email', existUser(), validate, (req: express.Request, res: express.Response) => {
  try {
    const user = prisma.user.findFirst({where: {email: req.body.email, verified: true}})
    return  res.json({ errors: false, data: user ?? null});
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

// REGISTER
router.post('/register', newUser(), validate, async (req: express.Request, res: express.Response) => {
  try {
    const {email, username, password, client} = req.body
    const user = await prisma.user.findUnique({where: {email: email}})
    if (user) throw new HttpErrors.Forbidden('User taken')

    const hashData = await hashValueAsync(password, constants.saltRounds);
    const verifiedToken = jwtSign( {sub: 0, email: email}, SECRET, constants.ttlVerify)
    const newUser = await prisma.user.create({
      data : {
        username: username,
        password: hashData.hash,
        salt: hashData.salt,
        email: email,
        itr: hashData.itr,
        verified: false,
        active: true,
        role: 1, // guess by default
        verifyToken: verifiedToken
      }
    })

    await emailRepository.sendWelcome(
      'noreplay@auxcoder.com',
      newUser.email,
      buildTemplateModel(
        {username: newUser.username, email: newUser.email, verifyToken: verifiedToken},
        {host: client || 'http://localhost:3000', action_path: '/api/auth/verify', login_path: '/api/auth/login'}
      )
    );

    return res.status(201).json({
      errors: false,
      data: {
        message: 'Check your email inbox to verify account',
        id: newUser.id
      }
    });
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

// LOGIN
router.post('/login', passport.authenticate('local', { session: false }), async (req, res,) => {
  const credentials = req.body;
  if(!credentials.email) return res.status(422).json({errors: {email: 'is required'}});
  if(!credentials.password) return res.status(422).json({errors: {password: 'is required'}});
  if(!req.user) return res.status(422).json({errors: {password: 'is required'}});

  try {
    // Passport store user info in req.user
    if (!req.user) throw new HttpErrors.NotFound('Record not found')
    if (!req.user?.id) throw new HttpErrors.NotFound('Record not found')

    // generate a new JWT
    const token = jwtSign({email: req.user.email, sub: req.user.id}, SECRET, constants.ttlAuth);
    const newJWTToken = await prisma.token.create({data: {token: token, userId: req.user.id, active: true}})
    if (!newJWTToken) throw new HttpErrors.NotFound('Unable to create a token')

    // the jwt token contain a user profile object
    return res.json({errors: false, data: {token: newJWTToken.token}});
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

// LOGOUT
router.get('/logout', hasAuthToken(), validate, async (req: express.Request, res: express.Response) => {
  const {authorization = ''}= req.headers;
  if (!authorization) throw new HttpErrors.Unauthorized('Invalid config')

  try {
    const token = authorization.replace(/bearer\s+/, '');
    if (!token) throw new HttpErrors.Unauthorized('Invalid config')

    await prisma.token.update({where: {token: token}, data: {active: false}})
    return res.json({errors: false, data: {}});

  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

// VERIFY
router.post('/verify', verifyEmail(), validate, async (req: express.Request, res: express.Response) => {
  const {token} = req.body;
  try {
    const userRecord = await prisma.user.findFirst({where: {verifyToken: token}})

    // token must exist
    if (!userRecord) throw new HttpErrors.NotFound('Invalid verification token')
    // token must be active
    if (!userRecord.active) throw new HttpErrors.PreconditionRequired('Invalid verification status')
    // verify token integrity
    const verified = await jwtVerify(token, SECRET)
    if (typeof verified !== 'string' && !verified.email) throw new HttpErrors.Unauthorized('Invalid token')

    // mark user as verified
    const user = await prisma.user.update({where: {id: userRecord.id}, data: {verified: true}});

    return res.json({errors: false, data: {id: user.id}, message: 'Thanks, for register, your account is verified'});
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});
// module
export default router;
