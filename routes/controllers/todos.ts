
import express from 'express';
import {getTodos, getTodo, createTodo, patchTodo, deleteTodo}  from '../middleware/validateTodo';
import validate from '../middleware/validate';
import prisma from '../../db/prisma'
const router = express.Router();

// READ
router.get('/', getTodos(), validate, async (req: express.Request, res: express.Response) => {
  if (!req.body.user_id) console.error('quote ID is required');

  try {
    const data = await prisma.todo.findMany({where: { user_id: req.body.user_id}});
    return res.json({errors: false, data: data});
  } catch (err: any) {
    return res.status(500).json({errors: [err.message], data: {}});
  }
});
// CREATE
router.post('/', createTodo(), validate, async (req: express.Request, res: express.Response) => {
  try {
    const { title, completed, user_id } = req.body
    const result = await prisma.todo.create({
      data: {
        title: title,
        completed: completed,
        user_id: user_id,
      },
    });
    return res.status(201).json({errors: false, data: result});
  } catch (err: any) {
    return res.status(500).json({errors: [err.message], data: {}});
  }
});
// READ
router.get('/:id([0-9]+)', getTodo(), validate, async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('quote ID is required');

  try {
    const data = await prisma.todo.findMany({where: { id: Number(req.params.id)}});
    if (!data) {
      return res.status(404).json({errors: true, data: {}});
    } else {
      return res.json({errors: false, data: data});
    }
  } catch (error: any) {
    return res.status(500).json({errors: [error.message], data: {}});
  }
});
// UPDATE
router.patch('/:id([0-9]+)', patchTodo(), validate, async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('todo ID is required');

  try {
    const data = await prisma.todo.findUnique({where: {id: Number(req.params.id)}});
    if (data) {
      const { title, completed, user_id } = req.body
      const toUpdate = Object.assign(req.body, {updated_at: new Date().toISOString()});
      await prisma.todo.update({
        where: {id: Number(data.id)},
        data: {
          title,
          completed,
          user_id
        }
    });
      // await new Todo({id: data.id}).save(toUpdate, {patch: true});
      return res.json({ errors: false, data: data, message: 'Todo updated'});
    } else {
      return res.status(404).json({errors: 'Todo not found', data: {}});
    }
  } catch (err: any) {
    return res.status(500).json({ errors: [err.message] });
  }
});
// DELETE
router.delete('/:id([0-9]+)', deleteTodo(), validate, async (req: express.Request, res: express.Response) => {
  if (!req.params.id) console.error('Todo ID is required');
  try {
    const data = await prisma.todo.delete({ where: {id: Number(req.params.id)}});
    return res.json({errors: false, data: data, message: `Todo removed, id: ${req.params.id}`});
  } catch (err: any) {
    return res.status(500).json({errors: [err.message]});
  }
});

export default router;
