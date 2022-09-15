import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import { registerUser, existUser } from '../middleware/validateUser'
import { hasAuthToken, verifyEmail } from '../middleware/hasAuthToken'
import validate from '../middleware/validate'
import { jwtSign, jwtVerify, hashValueAsync } from '../../utils/crypto'
import buildTemplateModel from '../../utils/buildTemplateModel'
import emailRepository from '../../core/email'
import constants from '../../config/constants'
import prisma from '../../db/prisma'
import HttpErrors from 'http-errors'
if (process.env.NODE_ENV !== 'production') dotenv.config()
const SECRET = process.env.JWT_SECRET || 'Secret!'
// import {profile} from 'winston';
const router = express.Router()
// eslint-disable-next-line no-unused-vars
declare global { namespace Express { interface User { id: number, email: string } } }

// READ exist
router.get('/exist/:email', existUser(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.params
  try {
    const user = await prisma.user.findFirstOrThrow({ where: { email, verified: true } })
    return res.json({ data: { email: user.email } })
  } catch (error) {
    next(error)
  }
})

// REGISTER
router.post('/register', registerUser(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password, client } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) throw new HttpErrors.Forbidden('User taken')

    const hashData = await hashValueAsync(password, constants.saltRounds)
    const verifiedToken = jwtSign({ sub: 0, email }, SECRET, constants.ttlVerify)
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashData.hash,
        salt: hashData.salt,
        email,
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
        { username: newUser.username, email: newUser.email, verifyToken: verifiedToken },
        { host: client || 'http://localhost:3000', action_path: '/api/auth/verify', login_path: '/api/auth/login' }
      )
    )

    return res.status(201).json({ data: { id: newUser.id }, message: 'Check your email inbox to verify account' })
  } catch (error) {
    next(error)
  }
})

// LOGIN
router.post('/login', passport.authenticate('local', { session: false }), async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  try {
    if (!email) throw new HttpErrors.UnprocessableEntity('Email is required')
    if (!password) throw new HttpErrors.UnprocessableEntity('Password is required')

    // Passport store user info in req.user
    if (!req.user) throw new HttpErrors.NotFound('Record not found')
    if (!req.user?.id) throw new HttpErrors.NotFound('Record not found')

    // generate a new JWT
    const token = jwtSign({ email: req.user.email, sub: req.user.id }, SECRET, constants.ttlAuth)
    const newJWTToken = await prisma.token.create({ data: { token, userId: req.user.id, active: true } })
    if (!newJWTToken) throw new HttpErrors.NotFound('Unable to create a token')

    // the jwt token contain a user profile object
    return res.json({ data: { token: newJWTToken.token } })
  } catch (error) {
    next(error)
  }
})

// LOGOUT
router.get('/logout', hasAuthToken(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { authorization = '' } = req.headers
  if (!authorization) throw new HttpErrors.Unauthorized('Invalid config')

  try {
    const token = authorization.replace(/bearer\s+/, '')
    if (!token) throw new HttpErrors.Unauthorized('Invalid config')

    await prisma.token.update({ where: { token }, data: { active: false } })
    return res.json({ data: {}, msg: 'Logout with success' })
  } catch (error) {
    next(error)
  }
})

// VERIFY
router.post('/verify', verifyEmail(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body
  try {
    const userRecord = await prisma.user.findFirst({ where: { verifyToken: token } })

    // token must exist
    if (!userRecord) throw new HttpErrors.NotFound('Invalid verification token')
    // token must be active
    if (!userRecord.active) throw new HttpErrors.PreconditionRequired('Invalid verification status')
    // verify token integrity
    const verified = await jwtVerify(token, SECRET)
    if (typeof verified !== 'string' && !verified.email) throw new HttpErrors.Unauthorized('Invalid token')

    // mark user as verified
    const user = await prisma.user.update({ where: { id: userRecord.id }, data: { verified: true } })

    return res.json({ data: { id: user.id }, message: 'Thanks, for register, your account is verified' })
  } catch (error) {
    next(error)
  }
})

export default router
