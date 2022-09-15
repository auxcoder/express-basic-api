import express, { NextFunction, Request, Response } from 'express'
import { getTodos, getTodo, createTodo, patchTodo, deleteTodo } from '../middleware/validateTodo'
import validate from '../middleware/validate'
import prisma from '../../db/prisma'
import HttpErrors from 'http-errors'
const router = express.Router()

// READ
router.get('/', getTodos(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body
  try {
    const data = await prisma.todo.findMany({ where: { userId } })
    return res.json({ data })
  } catch (error) {
    next(error)
  }
})

// CREATE
router.post('/', createTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { title, completed, userId } = req.body
  try {
    const result = await prisma.todo.create({
      data: {
        title,
        completed,
        userId
      }
    })
    return res.status(201).json({ data: result })
  } catch (error) {
    next(error)
  }
})

// READ
router.get('/:id([0-9]+)', getTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  try {
    const data = await prisma.todo.findMany({ where: { id: Number(id) } })

    // no match by id
    if (!data) throw new HttpErrors.NotFound('Record not found')

    return res.json({ data })
  } catch (error) {
    next(error)
  }
})

// UPDATE
router.patch('/:id([0-9]+)', patchTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const { title, completed, userId } = req.body
  try {
    const data = await prisma.todo.findUnique({ where: { id: Number(id) } })

    // no match by id
    if (!data) throw new HttpErrors.NotFound('Record not found')

    // const toUpdate = Object.assign(req.body, {updated_at: new Date().toISOString()});
    const updated = await prisma.todo.update({
      where: { id: Number(data.id) },
      data: {
        title,
        completed,
        userId
      }
    })

    return res.json({ data: updated, message: 'Todo updated with success' })
  } catch (error) {
    next(error)
  }
})

// DELETE
router.delete('/:id([0-9]+)', deleteTodo(), validate, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  try {
    const item = await prisma.todo.findUnique({ where: { id: Number(id) } })

    // no match by id
    if (!item) throw new HttpErrors.NotFound('Record not found')

    const data = await prisma.todo.delete({ where: { id: Number(id) } })
    return res.json({ data, message: 'Todo removed with success' })
  } catch (error) {
    next(error)
  }
})

export default router
