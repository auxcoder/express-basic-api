import express from 'express';
import constants from '../../config/constants';
import {newUser, patchUser} from '../middleware/validateUser';
import {hashValueAsync, jwtSign} from '../../utils/jwtSign';
import validate from '../middleware/validate';
import prisma from '../../db/prisma';
import HttpErrors from 'http-errors'
const router = express.Router();

// READ all
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    // todo: check roles
    const data = await prisma.user.findMany({where: {verified: true}});
    return res.json({errors: false, data: data});
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

// CREATE
router.post('/', newUser(), validate, async (req: express.Request, res: express.Response) => {
    try {
      const {email, username, password} = req.body
      const hashData = await hashValueAsync(password, constants.saltRounds);

      const token = jwtSign(
        Object.assign(req.body, {role: 1, email_verified: false}),
        'verification',
        constants.ttlVerify
      );

      const newUser = await prisma.user.create({
        data: {
          username: username,
          password: hashData.hash,
          salt: hashData.salt,
          email: email,
          itr: hashData.itr,
          verified: false,
          active: true,
          role: 1, // guess by default
          verifyToken: token
        }
      })

      // const user = await new User(dataMerged).save();
      return res.status(201).json({ errors: false, data: {id: newUser.id}});
    } catch (error) {
      if (error instanceof Error) return res.json({errors: [error.message], data: {}});
      return res.json(error)
    }
});

// READ
router.get('/:id([0-9]+)', async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('quote ID is required');
  try {
    const data = await prisma.user.findUniqueOrThrow({where: {id: Number(req.params.id)}})
    if (!data) {
      res.status(404).json({errors: true, message: 'User not found'});
    } else {
      res.json({errors: false, data: data});
    }
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
})

// UPDATE
router.patch('/:id([0-9]+)', patchUser(), validate, async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('user ID is required');
  const {username} = req.body

  try {
    const user = await prisma.user.findUniqueOrThrow({where: {id: Number(req.params.id)}})
    if (!user) throw new HttpErrors.NotFound('Record not found')

    const data = await prisma.user.update({where: {id: Number(user.id)}, data: { username}})
    return res.json({errors: false, data: data});
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

// DELETE
router.delete('/:id([0-9]+)', async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('user ID is required');
  // hard remove test record if env is dev
  // if (process.env.NODE_ENV === 'test') options.hardDelete = true;
  try {
    await prisma.user.delete({ where: {id: Number(req.params.id)}});
    return res.json({errors: false, message: 'User removed'});
  } catch (error) {
    if (error instanceof Error) return res.json({errors: [error.message], data: {}});
    return res.json(error)
  }
});

export default router;
