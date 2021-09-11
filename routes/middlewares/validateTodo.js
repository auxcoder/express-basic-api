import { check } from "express-validator";

export const validateTodo = () => {
  return [
    check('title', `Title field min length should be ${5}`).isLength({ min: 5 }),
    check('completed', 'Completed field should be a boolean').isBoolean()
  ]
}

export const getTodos = () => {
  return [
    check('user_id', `The user ID is invalid`).exists().custom(value => Number.isInteger(value))
  ]
}
