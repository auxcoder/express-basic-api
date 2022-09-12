import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import { newUser, existUser } from '../middleware/validateUser';
import { hasAuthToken, verifyEmail } from '../middleware/hasAuthToken';
import validate from '../middleware/validate';
import {jwtSign, jwtVerify} from '../../utils/jwtSign';
import hashPassword from '../../utils/hashPass';
import buildTemplateModel from '../../utils/buildTemplateModel';
import emailRepository from '../../core/email';
import constants from '../../config/constants';
import prisma from '../../db/prisma'
import HttpErrors from 'http-errors'
if (process.env.NODE_ENV !== 'production') dotenv.config();
// import {profile} from 'winston';
const router = express.Router();

// READ exist
router.get('/exist/:email', existUser(), validate, (req: express.Request, res: express.Response) => {
  try {
    const user = prisma.user.findFirst({where: {email: req.body.email, verified: true}})
    return  res.json({ errors: false, data: user ?? null});
  } catch(error: any) {
    return res.json({errors: [error.message], data: {}});
  }
});

// REGISTER
router.post('/register', newUser(), validate, async (req: express.Request, res: express.Response) => {
  try {
    const {email, username, password} = req.body
    const user = await prisma.user.findUnique({where: {email: email}})
    if (user) throw new HttpErrors.Forbidden('User taken')

    const data = await hashPassword(password, constants.saltRounds);
    const verifiedToken =jwtSign(
      Object.assign(req.body, {role: 1, email_verified: false}),
      process.env.SECRET || 'secret',
      constants.ttlVerify
    )
    const newUser = await prisma.user.create({
      data : {
        username: username,
        password: data.hash,
        salt: data.salt,
        email: email,
        itr: data.itr,
        verified: false,
        active: true,
        role: 1, // guess by default
      }
    })
    const newToken = await prisma.token.create({data: {
      token: verifiedToken,
      user_id:  newUser.id,
      active: true,
    }});
    // const model = await new Users(userObj).save();
    await emailRepository.sendWelcome(
      'noreplay@auxcoder.com',
      newUser.email,
      buildTemplateModel({ username: newUser.username, email: newUser.email, verify_token: newToken.token } , req.body.client)
    );

    return res.status(201).json({errors: false, data: {id: newToken.token}});

  } catch (error: any) {
    res.json({errors: [error.message], data: {}});
  }
});

// LOGIN
router.post('/login', (req: express.Request, res: express.Response, next) => {
  const credentials = req.body;
  if(!credentials.email) return res.status(422).json({errors: {email: 'is required'}});
  if(!credentials.password) return res.status(422).json({errors: {password: 'is required'}});

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(404).json({error: ['User not found', info], data: {}});

    req.login(user, {session: false}, err => {
      if (err) res.send(err);

      try {
        const token = jwtSign(user, 'auth', constants.ttlAuth);
        const data = prisma.token.create({data: {token: token, user_id: user.id, active: true}})
      } catch (error: any) {
        res.json({errors: [error.message], data: {}});
      }
    });
  })(req, res, next);
});

// LOGOUT
router.get('/logout', hasAuthToken(), validate, async (req: express.Request, res: express.Response) => {
  const {authorization = ''}= req.headers;
  if (!authorization) throw new HttpErrors.Unauthorized('Invalid config')

  const token = authorization.replace(/bearer\s+/, '');
  if (!token) throw new HttpErrors.Unauthorized('Invalid config')

  await prisma.token.update({where: {token: token}, data: {active: false}})
  return res.json({errors: false, data: {}});
});

// VERIFY
router.post('/verify', verifyEmail(), validate, async (req: express.Request, res: express.Response) => {
  const {token} = req.body;
  try {
    const tokenRecord = await prisma.token.findUnique({where: {token: token}})

    // token must exist
    if (!tokenRecord) throw new HttpErrors.NotFound('Invalid verification token')

    // token must be active
    if (!tokenRecord.active) throw new HttpErrors.PreconditionRequired('Invalid verification status')

    // verify token integrity
    const verified = await jwtVerify(token, 'secret')
    if (typeof verified !== 'string' && !verified.email) throw new HttpErrors.Unauthorized('Invalid token')

    // mark user as verified
    const user = await prisma.user.update({where: {id: tokenRecord.user_id}, data: {verified: true}});

    // deactivate verification token
    await prisma.token.update({where: {token: token}, data: {active: false}})

    return res.json({errors: false, data: {id: user.id}});
  } catch (error: any) {
    res.json({errors: [error.message], data: {}});
  }
});
// module
export default router;
