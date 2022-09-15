import express, {Request, Response, NextFunction} from 'express';
import constants from '../../config/constants';
import {getUser, newUser, patchUser} from '../middleware/validateUser';
import {hashValueAsync, jwtSign} from '../../utils/jwtSign';
import validate from '../middleware/validate';
import prisma from '../../db/prisma';
import HttpErrors from 'http-errors'
const SECRET = process.env.JWT_SECRET || 'Secret!';
const router = express.Router();

// READ all
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // todo: check roles
    const data = await prisma.user.findMany({where: {verified: true}});
    return res.json({data: data});
  } catch (error) {
    next(error)
  }
});

// CREATE
router.post('/', newUser(), validate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {email, username, password} = req.body

      const hashData = await hashValueAsync(password, constants.saltRounds);
      const token = jwtSign( {sub: 0, email: email}, SECRET, constants.ttlVerify);
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
      });

      return res.status(201).json({ data: {id: newUser.id}});
    } catch (error) {
      next(error)
    }
});

// READ
router.get('/:id([0-9]+)', getUser(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params;
  try {
    const data = await prisma.user.findUniqueOrThrow({where: {id: Number(id)}})
    if (!data) throw new HttpErrors.NotFound('Record not found')

    return res.json({data: data});
  } catch (error) {
    next(error)
  }
})

// UPDATE
router.patch('/:id([0-9]+)', patchUser(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params;
  const {username} = req.body
  try {
    const user = await prisma.user.findUniqueOrThrow({where: {id: Number(id)}})
    if (!user) throw new HttpErrors.NotFound('Record not found')

    await prisma.user.update({where: {id: Number(user.id)}, data: {username}})
    return res.json({data: req.body, message: 'User updated'});
  } catch (error) {
    next(error)
  }
});

// DELETE
router.delete('/:id([0-9]+)', async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params;
  try {
    await prisma.user.delete({ where: {id: Number(id)}});
    return res.json({data: {id: id}, message: 'User removed'});
  } catch (error) {
    next(error)
  }
});

export default router;
