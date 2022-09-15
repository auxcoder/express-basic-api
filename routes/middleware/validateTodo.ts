import { check } from "express-validator";

export const createTodo = () => {
  return [
    check('title', `Title field min length should be ${5}`).isLength({ min: 5 }),
    check('completed', 'Completed field should be a boolean').isBoolean(),
    check('userId', 'The user ID is missing').exists().custom(value => Number.isInteger(Number(value))).withMessage('The user ID must be an Integer')
  ]
}

export const getTodos = () => {
  return [
    check('userId', 'The user ID is missing').exists().custom(value => Number.isInteger(Number(value))).withMessage('The user ID must be an Integer')
  ]
}

export const getTodo = () => {
  return [
    check('id', 'Todo ID is missing').exists().custom(value => Number.isInteger(Number(value))).withMessage('The user ID must be an Integer')
  ]
}

export const patchTodo = () => {
  return [
    check('id', 'Todo ID is missing').exists().custom(value => Number.isInteger(Number(value))).withMessage('The user ID must be an Integer'),
    check('title', `Title field min length should be ${5}`).isLength({ min: 5 }),
    check('completed', 'Completed field should be a boolean').isBoolean(),
    check('userId', `The user ID is invalid`).exists().custom(value => Number.isInteger(Number(value))).withMessage('The user ID must be an Integer')
  ]
}

export const deleteTodo = () => {
  return [
    check('id', `Todo ID is invalid`).exists().custom(value => Number.isInteger(Number(value))).withMessage('The user ID must be an Integer')
  ]
}
