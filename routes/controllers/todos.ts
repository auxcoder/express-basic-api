import express, {NextFunction, Request, Response} from 'express';
import {getTodos, getTodo, createTodo, patchTodo, deleteTodo}  from '../middleware/validateTodo';
import validate from '../middleware/validate';
import prisma from '../../db/prisma'
import HttpErrors from 'http-errors'
const router = express.Router();

// READ
  if (!req.body.userId) console.error('quote ID is required');

router.get('/', getTodos(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.todo.findMany({where: {userId: req.body.userId}});
    return res.json({errors: false, data: data});
  } catch (error) {
    next(error)
  }
});

// CREATE
router.post('/', createTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, completed, userId } = req.body
    const result = await prisma.todo.create({
      data: {
        title: title,
        completed: completed,
        userId: userId,
      },
    });
    return res.status(201).json({errors: false, data: result});
  } catch (error) {
    next(error)
  }
});

// READ
  if (!req.params.id) console.error('quote ID is required');

router.get('/:id([0-9]+)', getTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.todo.findMany({where: {id: Number(req.params.id)}});

    // no match by id
    if (!data) throw new HttpErrors.NotFound('Record not found')

    return res.json({errors: false, data: data});
  } catch (error) {
    next(error)
  }
});

// UPDATE
  if (!req.params.id) console.error('todo ID is required');
  const { title, completed, userId } = req.body

router.patch('/:id([0-9]+)', patchTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.todo.findUnique({where: {id: Number(req.params.id)}});

    // no match by id
    if (!data) throw new HttpErrors.NotFound('Record not found')

    // const toUpdate = Object.assign(req.body, {updated_at: new Date().toISOString()});
    const updated = await prisma.todo.update({
      where: {id: Number(data.id)},
      data: {
        title,
        completed,
        userId
      }
    });

    return res.json({ errors: false, data: updated, message: 'Todo updated'});
  } catch (error) {
    next(error)
  }
});

// DELETE
  if (!req.params.id) console.error('Todo ID is required');
router.delete('/:id([0-9]+)', deleteTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.todo.findUnique({where: {id: Number(req.params.id)}});

    // no match by id
    if (!item) throw new HttpErrors.NotFound('Record not found')

    const data = await prisma.todo.delete({where: {id: Number(req.params.id)}});
    return res.json({errors: false, data: data, message: `Todo removed, id: ${req.params.id}`});
  } catch (error) {
    next(error)
  }
});

export default router;
