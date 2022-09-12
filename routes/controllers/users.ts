import express from 'express';
import constants from '../../config/constants';
// import User from '../../db/models/users';
import {newUser, patchUser} from '../middleware/validateUser';
import {jwtSign} from '../../utils/jwtSign';
import hashPassword from '../../utils/hashPass';
import validate from '../middleware/validate';
import prisma from '../../db/prisma';
const router = express.Router();

// READ all
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    // knex query builder
    // {withRelated: ['tokens']}
    const data = await prisma.user.findMany({where: {verified: true}});
    return res.json({errors: false, data: data});
  } catch (err: any) {
    return res.status(500).json({ errors: [err.message], data: {} })
  }
});

// CREATE
router.post('/', newUser(), validate, async (req: express.Request, res: express.Response) => {
    try {
      const {email, username, password} = req.body
      const data = await hashPassword(password, constants.saltRounds);
      const newUser = await prisma.user.create({
        data: {
          username: username,
          password: data.hash, // todo: should db field match "hash"
          salt: data.salt,
          email: email,
          itr: data.itr,
          verified: false,
          active: true,
          role: 1, // guess by default
        }
      })
      const token = jwtSign(
        Object.assign(req.body, {role: 1, email_verified: false}),
        'verification',
        constants.ttlVerify
      )
      const newToken = await prisma.token.create({data: {
        token: token,
        user_id:  newUser.id,
        active: true,
      }});
      // const user = await new User(dataMerged).save();
      return res.status(201).json({ errors: false, data: {id: newUser.id }});
    } catch (err: any) {
      res.status(500).json({errors: [err.message], data: {}});
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
  } catch (err: any) {
    res.status(500).json({errors: [err.message], data: {}});
  }
})

// UPDATE
router.patch('/:id([0-9]+)', patchUser(), validate, async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('user ID is required');
  const {username} = req.body

  try {
    const user = await prisma.user.findUniqueOrThrow({where: {id: Number(req.params.id)}})
    if (user) {
      const data = await prisma.user.update({where: {id: Number(user.id)}, data: { username}})
      return res.json({errors: false, data: data});
    } else {
      return res.status(404).json({errors: 'User not found', data: {}});
    }
  } catch (err: any) {
    return res.status(500).json({errors: [err.message], data: {}});
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
  } catch (err: any) {
    res.status(500).json({errors: [err.message], data: {}});
  }
});

export default router;
