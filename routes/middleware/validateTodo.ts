import { check } from "express-validator";

export const createTodo = () => {
  return [
    check('title', `Title field min length should be ${5}`).isLength({ min: 5 }),
    check('completed', 'Completed field should be a boolean').isBoolean(),
    check('userId', `The user ID is invalid`).exists().custom(value => Number.isInteger(value))
  ]
}

export const getTodos = () => {
  return [
    check('userId', `The user ID is invalid`).exists().custom(value => Number.isInteger(value))
  ]
}

export const getTodo = () => {
  return [
    check('id', `Todo ID is invalid`).exists().custom(value => Number.isInteger(Number(value)))
  ]
}

export const patchTodo = () => {
  return [
    check('id', `Todo ID is invalid`).exists().custom(value => Number.isInteger(Number(value))),
    check('title', `Title field min length should be ${5}`).isLength({ min: 5 }),
    check('completed', 'Completed field should be a boolean').isBoolean(),
    check('userId', `The user ID is invalid`).exists().custom(value => Number.isInteger(value))
  ]
}

export const deleteTodo = () => {
  return [
    check('id', `Todo ID is invalid`).exists().custom(value => Number.isInteger(Number(value)))
  ]
}
